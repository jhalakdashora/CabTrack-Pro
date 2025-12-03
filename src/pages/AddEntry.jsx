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
    trips: '',
    hoursWorked: '',
    kmStart: '',
    kmEnd: '',
    notes: '',
  });

  const [calculations, setCalculations] = useState({
    netEarnings: 0,
    ownerEarnings: 0,
    driverEarnings: 0,
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
        trips: editEntry.trips || '',
        hoursWorked: editEntry.hoursWorked || '',
        kmStart: editEntry.kmStart || '',
        kmEnd: editEntry.kmEnd || '',
        notes: editEntry.notes || '',
      });
    }
  }, [editEntry]);

  // Auto-calculate when form data changes
  useEffect(() => {
    const calculated = calculateEntryFields(formData);
    setCalculations({
      netEarnings: calculated.netEarnings,
      ownerEarnings: calculated.ownerEarnings,
      driverEarnings: calculated.driverEarnings,
      kmDiff: calculated.kmDiff,
    });
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editEntry) {
        await updateEntry(editEntry.id, formData);
      } else {
        await addEntry(formData);
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
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Net Earnings
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{calculations.netEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Gross - CNG
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Owner Earnings (50%)
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ₹{calculations.ownerEarnings.toFixed(2)}
                </p>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Driver Earnings (50%)
                </p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  ₹{calculations.driverEarnings.toFixed(2)}
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  KM Difference
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
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
    </div>
  );
};

export default AddEntry;

