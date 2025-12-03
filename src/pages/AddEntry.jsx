import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { addEntry, updateEntry, calculateEntryFields } from '../firebase/entries';
import { useLocation } from 'react-router-dom';

const AddEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editEntry = location.state?.entry;

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    grossEarnings: '',
    cng: '',
    onlineAmountToDriver: '',
    driverPassUsed: false,
    driverPassAmount: '',
    trips: '',
    hoursWorked: '',
    kmStart: '',
    kmEnd: '',
    notes: '',
  });

  const [onlineAmountsList, setOnlineAmountsList] = useState([]);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [newAmountInput, setNewAmountInput] = useState('');
  const [newAmountDescription, setNewAmountDescription] = useState('');

  const [calculations, setCalculations] = useState({
    netEarnings: 0,
    baseOwner: 0,
    baseDriver: 0,
    ownerAfterOnline: 0,
    driverAfterOnline: 0,
    ownerPassContribution: 0,
    driverPassContribution: 0,
    finalOwnerEarnings: 0,
    finalDriverEarnings: 0,
    kmDiff: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form if editing
  useEffect(() => {
    if (editEntry) {
      setFormData({
        date: editEntry.date || format(new Date(), 'yyyy-MM-dd'),
        grossEarnings: editEntry.grossEarnings || '',
        cng: editEntry.cng || '',
        onlineAmountToDriver: editEntry.onlineAmountToDriver || '',
        driverPassUsed: editEntry.driverPassUsed || false,
        driverPassAmount: editEntry.driverPassAmount || '',
        trips: editEntry.trips || '',
        hoursWorked: editEntry.hoursWorked || '',
        kmStart: editEntry.kmStart || '',
        kmEnd: editEntry.kmEnd || '',
        notes: editEntry.notes || '',
      });
      
      // Load online amounts list if available (for future enhancement)
      // For now, if there's a total, we'll start with empty list
      if (editEntry.onlineAmountsList && Array.isArray(editEntry.onlineAmountsList)) {
        setOnlineAmountsList(editEntry.onlineAmountsList);
      }
    }
  }, [editEntry]);

  // Update onlineAmountToDriver when list changes
  useEffect(() => {
    const total = onlineAmountsList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    setFormData((prev) => ({
      ...prev,
      onlineAmountToDriver: total.toFixed(2),
    }));
  }, [onlineAmountsList]);

  // Auto-calculate when form data changes
  useEffect(() => {
    const calculated = calculateEntryFields(formData);
    setCalculations({
      netEarnings: calculated.netEarnings,
      baseOwner: calculated._baseOwner || 0,
      baseDriver: calculated._baseDriver || 0,
      netOnlineSettlement: calculated._netOnlineSettlement || 0,
      ownerAfterOnline: calculated._ownerAfterOnline || 0,
      driverAfterOnline: calculated._driverAfterOnline || 0,
      ownerPassContribution: calculated._ownerPassContribution || 0,
      driverPassContribution: calculated._driverPassContribution || 0,
      finalOwnerEarnings: calculated.ownerEarnings,
      finalDriverEarnings: calculated.driverEarnings,
      kmDiff: calculated.kmDiff,
    });
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Online amounts modal handlers
  const handleAddOnlineAmount = () => {
    const amount = parseFloat(newAmountInput);
    if (!isNaN(amount) && amount !== 0) {
      setOnlineAmountsList((prev) => [
        ...prev,
        {
          id: Date.now(),
          amount: amount,
          description: newAmountDescription || (amount < 0 ? 'Adjustment' : 'Online payment'),
        },
      ]);
      setNewAmountInput('');
      setNewAmountDescription('');
    }
  };

  const handleDeleteOnlineAmount = (id) => {
    setOnlineAmountsList((prev) => prev.filter((item) => item.id !== id));
  };

  const getOnlineAmountsTotal = () => {
    return onlineAmountsList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        onlineAmountsList: onlineAmountsList, // Include the list of amounts
      };
      
      if (editEntry) {
        await updateEntry(editEntry.id, submitData);
      } else {
        await addEntry(submitData);
      }
      navigate('/entries');
    } catch (err) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {editEntry ? 'Edit Entry' : 'Add New Entry'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {editEntry
            ? 'Update entry details below'
            : 'Fill in the details to record your daily earnings'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="label">
                    Date *
                  </label>
                  <input
                    id="date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="grossEarnings" className="label">
                    Gross Earnings (₹) *
                  </label>
                  <input
                    id="grossEarnings"
                    type="number"
                    name="grossEarnings"
                    value={formData.grossEarnings}
                    onChange={handleChange}
                    className="input-field"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cng" className="label">
                    CNG Cost (₹) *
                  </label>
                  <input
                    id="cng"
                    type="number"
                    name="cng"
                    value={formData.cng}
                    onChange={handleChange}
                    className="input-field"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="label">
                    Online Amount to Driver (₹)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`Total: ₹${getOnlineAmountsTotal().toFixed(2)}`}
                      readOnly
                      className={`input-field flex-1 bg-gray-50 dark:bg-gray-700 cursor-not-allowed ${
                        getOnlineAmountsTotal() < 0 ? 'text-red-600 dark:text-red-400' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOnlineModal(true)}
                      className="btn-primary whitespace-nowrap"
                    >
                      {onlineAmountsList.length > 0 ? 'Edit' : 'Add'} Amounts
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Amount credited to owner but belongs to driver
                  </p>
                  {onlineAmountsList.length > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {onlineAmountsList.length} amount{onlineAmountsList.length > 1 ? 's' : ''} added
                    </p>
                  )}
                </div>
              </div>

              {/* Driver Pass Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center mb-3">
                  <input
                    id="driverPassUsed"
                    type="checkbox"
                    name="driverPassUsed"
                    checked={formData.driverPassUsed}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="driverPassUsed" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Driver pass purchased?
                  </label>
                </div>
                {formData.driverPassUsed && (
                  <div>
                    <label htmlFor="driverPassAmount" className="label">
                      Driver Pass Amount (₹)
                    </label>
                    <input
                      id="driverPassAmount"
                      type="number"
                      name="driverPassAmount"
                      value={formData.driverPassAmount}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Purchased from online payments (50-50 split between owner and driver)
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="trips" className="label">
                    Number of Trips *
                  </label>
                  <input
                    id="trips"
                    type="number"
                    name="trips"
                    value={formData.trips}
                    onChange={handleChange}
                    className="input-field"
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hoursWorked" className="label">
                    Hours Worked *
                  </label>
                  <input
                    id="hoursWorked"
                    type="number"
                    name="hoursWorked"
                    value={formData.hoursWorked}
                    onChange={handleChange}
                    className="input-field"
                    required
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label htmlFor="kmStart" className="label">
                    KM Start *
                  </label>
                  <input
                    id="kmStart"
                    type="number"
                    name="kmStart"
                    value={formData.kmStart}
                    onChange={handleChange}
                    className="input-field"
                    required
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kmEnd" className="label">
                    KM End *
                  </label>
                  <input
                    id="kmEnd"
                    type="number"
                    name="kmEnd"
                    value={formData.kmEnd}
                    onChange={handleChange}
                    className="input-field"
                    required
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Saving...'
                    : editEntry
                    ? 'Update Entry'
                    : 'Save Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/entries')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Live Calculations
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Net Earnings
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{calculations.netEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Gross - CNG
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Base Split (50-50)
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Owner:</span>
                  <span className="font-medium">₹{calculations.baseOwner.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-700 dark:text-gray-300">Driver:</span>
                  <span className="font-medium">₹{calculations.baseDriver.toFixed(2)}</span>
                </div>
              </div>

              {(parseFloat(formData.onlineAmountToDriver || 0) !== 0 || (formData.driverPassUsed && formData.driverPassAmount > 0)) && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    After Online Settlement
                  </p>
                  {formData.driverPassUsed && formData.driverPassAmount > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                      Net Online: ₹{calculations.netOnlineSettlement.toFixed(2)} 
                      (₹{parseFloat(formData.onlineAmountToDriver || 0).toFixed(2)} - ₹{parseFloat(formData.driverPassAmount || 0).toFixed(2)} pass)
                    </p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Owner:</span>
                    <span className="font-medium text-yellow-700 dark:text-yellow-400">
                      ₹{calculations.ownerAfterOnline.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-700 dark:text-gray-300">Driver:</span>
                    <span className="font-medium text-yellow-700 dark:text-yellow-400">
                      ₹{calculations.driverAfterOnline.toFixed(2)}
                    </span>
                  </div>
                  {!formData.driverPassUsed && (
                    <p className={`text-xs mt-1 ${
                      parseFloat(formData.onlineAmountToDriver || 0) >= 0 
                        ? 'text-gray-500 dark:text-gray-500' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Online: {parseFloat(formData.onlineAmountToDriver || 0) >= 0 ? '-' : '+'}₹{Math.abs(parseFloat(formData.onlineAmountToDriver || 0)).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {formData.driverPassUsed && formData.driverPassAmount > 0 && (
                <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Driver Pass (50-50)
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Owner pays:</span>
                    <span className="font-medium text-cyan-700 dark:text-cyan-400">
                      -₹{calculations.ownerPassContribution.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-700 dark:text-gray-300">Driver pays:</span>
                    <span className="font-medium text-cyan-700 dark:text-cyan-400">
                      -₹{calculations.driverPassContribution.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Final Owner Earnings
                </p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  ₹{calculations.finalOwnerEarnings.toFixed(2)}
                </p>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Final Driver Earnings
                </p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  ₹{calculations.finalDriverEarnings.toFixed(2)}
                </p>
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  KM Difference
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {calculations.kmDiff.toFixed(1)} km
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  End - Start
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online Amounts Modal */}
      {showOnlineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Online Amounts to Driver
                </h2>
                <button
                  onClick={() => setShowOnlineModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add multiple amounts (positive or negative). Use negative for adjustments or corrections.
              </p>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 flex-1 overflow-y-auto">
              {/* Add New Amount Form */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={newAmountInput}
                      onChange={(e) => setNewAmountInput(e.target.value)}
                      className="input-field"
                      step="0.01"
                      placeholder="0.00 (can be negative)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOnlineAmount();
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter positive or negative amounts (e.g., -50.00 for adjustments)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={newAmountDescription}
                      onChange={(e) => setNewAmountDescription(e.target.value)}
                      className="input-field"
                      placeholder="e.g., Cancellation fee, Online payment"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOnlineAmount();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOnlineAmount}
                    disabled={!newAmountInput || isNaN(parseFloat(newAmountInput)) || parseFloat(newAmountInput) === 0}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Amount
                  </button>
                </div>
              </div>

              {/* Amounts List */}
              {onlineAmountsList.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Added Amounts
                    </h3>
                    <span className={`text-sm font-bold ${
                      getOnlineAmountsTotal() >= 0 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Total: ₹{getOnlineAmountsTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {onlineAmountsList.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            parseFloat(item.amount) >= 0 
                              ? 'text-gray-900 dark:text-gray-100' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {parseFloat(item.amount) >= 0 ? '₹' : '-₹'}{Math.abs(parseFloat(item.amount)).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteOnlineAmount(item.id)}
                          className="ml-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No amounts added yet</p>
                  <p className="text-xs mt-1">Add amounts using the form above</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowOnlineModal(false)}
                className="btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEntry;

