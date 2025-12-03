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
 */
export const calculateEntryFields = (data) => {
  const grossEarnings = parseFloat(data.grossEarnings) || 0;
  const cng = parseFloat(data.cng) || 0;
  const kmStart = parseFloat(data.kmStart) || 0;
  const kmEnd = parseFloat(data.kmEnd) || 0;

  const netEarnings = grossEarnings - cng;
  const ownerEarnings = netEarnings * 0.5;
  const driverEarnings = netEarnings * 0.5;
  const kmDiff = kmEnd - kmStart;

  return {
    ...data,
    grossEarnings,
    cng,
    netEarnings,
    ownerEarnings,
    driverEarnings,
    kmStart,
    kmEnd,
    kmDiff,
  };
};

/**
 * Add a new entry
 */
export const addEntry = async (entryData) => {
  const calculatedData = calculateEntryFields(entryData);
  
  const entry = {
    ...calculatedData,
    date: entryData.date, // YYYY-MM-DD format
    trips: parseInt(entryData.trips) || 0,
    hoursWorked: entryData.hoursWorked || '',
    notes: entryData.notes || '',
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), entry);
  return docRef.id;
};

/**
 * Update an existing entry
 */
export const updateEntry = async (entryId, entryData) => {
  const calculatedData = calculateEntryFields(entryData);
  
  const entry = {
    ...calculatedData,
    date: entryData.date,
    trips: parseInt(entryData.trips) || 0,
    hoursWorked: entryData.hoursWorked || '',
    notes: entryData.notes || '',
  };

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

