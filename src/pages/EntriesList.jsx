import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getAllEntries, deleteEntry } from '../firebase/entries';

const EntriesList = () => {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    sortEntries();
  }, [entries, sortBy]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await getAllEntries();
      setEntries(data);
      setFilteredEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortEntries = () => {
    const sorted = [...entries].sort((a, b) => {
      switch (sortBy) {
        case 'highestEarnings':
          return (b.grossEarnings || 0) - (a.grossEarnings || 0);
        case 'highestTrips':
          return (b.trips || 0) - (a.trips || 0);
        case 'mostHours':
          return (parseFloat(b.hoursWorked) || 0) - (parseFloat(a.hoursWorked) || 0);
        case 'date':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
    setFilteredEntries(sorted);
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(entryId);
        await loadEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
  };

  const handleEdit = (entry) => {
    navigate('/add-entry', { state: { entry } });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Entries
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all your entries
          </p>
        </div>
        <Link to="/add-entry" className="btn-primary">
          + Add Entry
        </Link>
      </div>

      {/* Sort Options */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-auto min-w-[200px]"
          >
            <option value="date">Date (Newest First)</option>
            <option value="highestEarnings">Highest Earnings</option>
            <option value="highestTrips">Highest Trips</option>
            <option value="mostHours">Most Hours</option>
          </select>
          <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
            Total Entries: {filteredEntries.length}
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Gross
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CNG
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Online Adjust.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Net
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Pass
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trips
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No entries found. <Link to="/add-entry" className="text-primary-600 dark:text-primary-400 hover:underline">Add your first entry</Link>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {format(new Date(entry.date + 'T00:00:00'), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      ₹{(entry.grossEarnings || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      ₹{(entry.cng || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400">
                      {entry.onlineAmountToDriver > 0 ? (
                        <span className="font-medium">₹{(entry.onlineAmountToDriver || 0).toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                      ₹{(entry.netEarnings || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-600 dark:text-purple-400">
                      ₹{(entry.ownerEarnings || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      ₹{(entry.driverEarnings || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-cyan-600 dark:text-cyan-400">
                      {entry.driverPassAmount > 0 ? (
                        <span className="font-medium">₹{(entry.driverPassAmount || 0).toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {entry.trips || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {parseFloat(entry.hoursWorked || 0).toFixed(1)}h
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EntriesList;

