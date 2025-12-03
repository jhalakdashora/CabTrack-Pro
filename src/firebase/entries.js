// Firestore CRUD operations for entries
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

const COLLECTION_NAME = 'entries';

/**
 * Calculate derived fields for an entry
 * 
 * Calculation Logic:
 * 1. Net earnings = Gross - CNG
 * 2. Base 50-50 split
 * 3. Driver pass is purchased from online payments, so:
 *    - Net online settlement = Online amounts - Driver pass amount
 * 4. Apply net online settlement (owner gets -netOnline, driver gets +netOnline)
 * 5. Driver pass is 50-50 expense, both pay their share
 * 6. Final earnings = after online settlement - pass contribution
 */
export const calculateEntryFields = (data) => {
  // Parse input values
  const grossEarnings = parseFloat(data.grossEarnings) || 0;
  const cng = parseFloat(data.cng) || 0;
  const onlineAmountToDriver = parseFloat(data.onlineAmountToDriver) || 0;
  const driverPassUsed = data.driverPassUsed === true || data.driverPassUsed === 'true';
  const driverPassAmount = parseFloat(data.driverPassAmount) || 0;
  const kmStart = parseFloat(data.kmStart) || 0;
  const kmEnd = parseFloat(data.kmEnd) || 0;

  // Step 1: Net earnings before adjustments
  const netEarnings = grossEarnings - cng;

  // Step 2: Base 50-50 split
  const baseOwner = netEarnings * 0.5;
  const baseDriver = netEarnings * 0.5;

  // Step 3: Driver pass is purchased from online payments
  // So net online settlement = online amounts - driver pass amount
  const netOnlineSettlement = onlineAmountToDriver - (driverPassUsed ? driverPassAmount : 0);

  // Step 4: Apply net online settlement adjustment
  // Owner received money that belongs to driver, so subtract from owner, add to driver
  const ownerAfterOnline = baseOwner - netOnlineSettlement;
  const driverAfterOnline = baseDriver + netOnlineSettlement;

  // Step 5: Driver Pass handling (if purchased) - 50-50 split
  let ownerPassContribution = 0;
  let driverPassContribution = 0;
  
  if (driverPassUsed && driverPassAmount > 0) {
    // Split 50-50
    ownerPassContribution = driverPassAmount * 0.5;
    driverPassContribution = driverPassAmount * 0.5;
  }

  // Step 6: Final earnings
  const finalOwnerEarnings = ownerAfterOnline - ownerPassContribution;
  const finalDriverEarnings = driverAfterOnline - driverPassContribution;

  // KM Difference
  const kmDiff = kmEnd - kmStart;

  return {
    ...data,
    grossEarnings,
    cng,
    onlineAmountToDriver,
    driverPassUsed,
    driverPassAmount: driverPassUsed ? driverPassAmount : 0,
    netEarnings,
    ownerEarnings: finalOwnerEarnings,
    driverEarnings: finalDriverEarnings,
    kmStart,
    kmEnd,
    kmDiff,
    // Store intermediate values for display purposes
    _baseOwner: baseOwner,
    _baseDriver: baseDriver,
    _netOnlineSettlement: netOnlineSettlement,
    _ownerAfterOnline: ownerAfterOnline,
    _driverAfterOnline: driverAfterOnline,
    _ownerPassContribution: ownerPassContribution,
    _driverPassContribution: driverPassContribution,
  };
};

/**
 * Add a new entry
 */
export const addEntry = async (entryData) => {
  const calculatedData = calculateEntryFields(entryData);
  
  // Remove intermediate calculation fields before saving
  const { _baseOwner, _baseDriver, _ownerAfterOnline, _driverAfterOnline, _ownerPassContribution, _driverPassContribution, ...entry } = calculatedData;
  
  entry.date = entryData.date; // YYYY-MM-DD format
  entry.trips = parseInt(entryData.trips) || 0;
  entry.hoursWorked = entryData.hoursWorked || '';
  entry.notes = entryData.notes || '';
  // Store online amounts list if available
  if (entryData.onlineAmountsList && Array.isArray(entryData.onlineAmountsList)) {
    entry.onlineAmountsList = entryData.onlineAmountsList;
  }
  entry.createdAt = Timestamp.now();

  const docRef = await addDoc(collection(db, COLLECTION_NAME), entry);
  return docRef.id;
};

/**
 * Update an existing entry
 */
export const updateEntry = async (entryId, entryData) => {
  const calculatedData = calculateEntryFields(entryData);
  
  // Remove intermediate calculation fields before saving
  const { _baseOwner, _baseDriver, _ownerAfterOnline, _driverAfterOnline, _ownerPassContribution, _driverPassContribution, ...entry } = calculatedData;
  
  entry.date = entryData.date;
  entry.trips = parseInt(entryData.trips) || 0;
  entry.hoursWorked = entryData.hoursWorked || '';
  entry.notes = entryData.notes || '';
  // Store online amounts list if available
  if (entryData.onlineAmountsList && Array.isArray(entryData.onlineAmountsList)) {
    entry.onlineAmountsList = entryData.onlineAmountsList;
  }

  const entryRef = doc(db, COLLECTION_NAME, entryId);
  await updateDoc(entryRef, entry);
};

/**
 * Delete an entry
 */
export const deleteEntry = async (entryId) => {
  const entryRef = doc(db, COLLECTION_NAME, entryId);
  await deleteDoc(entryRef);
};

/**
 * Get all entries, ordered by date (newest first)
 */
export const getAllEntries = async () => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get entries for a specific date
 */
export const getEntriesByDate = async (date) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('date', '==', date)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get entries for a date range
 */
export const getEntriesByDateRange = async (startDate, endDate) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get entries for a specific month (YYYY-MM format)
 */
export const getEntriesByMonth = async (month) => {
  const startDate = `${month}-01`;
  const endDate = `${month}-31`;
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Get last N days of entries
 */
export const getLastNDaysEntries = async (days = 7) => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = today.toISOString().split('T')[0];
  
  return getEntriesByDateRange(startDateStr, endDateStr);
};

