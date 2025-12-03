import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getEntriesByDate, getLastNDaysEntries } from '../firebase/entries';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [todayData, setTodayData] = useState(null);
  const [last7DaysData, setLast7DaysData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Get today's entries
      const todayEntries = await getEntriesByDate(today);
      const todayTotal = todayEntries.reduce(
        (acc, entry) => ({
          grossEarnings: acc.grossEarnings + (entry.grossEarnings || 0),
          cng: acc.cng + (entry.cng || 0),
          netEarnings: acc.netEarnings + (entry.netEarnings || 0),
          onlineAmountToDriver: acc.onlineAmountToDriver + (entry.onlineAmountToDriver || 0),
          driverPassAmount: acc.driverPassAmount + (entry.driverPassAmount || 0),
          ownerEarnings: acc.ownerEarnings + (entry.ownerEarnings || 0),
          driverEarnings: acc.driverEarnings + (entry.driverEarnings || 0),
          trips: acc.trips + (entry.trips || 0),
          hoursWorked: acc.hoursWorked + parseFloat(entry.hoursWorked || 0),
        }),
        {
          grossEarnings: 0,
          cng: 0,
          netEarnings: 0,
          onlineAmountToDriver: 0,
          driverPassAmount: 0,
          ownerEarnings: 0,
          driverEarnings: 0,
          trips: 0,
          hoursWorked: 0,
        }
      );

      setTodayData(todayTotal);

      // Get last 7 days data for chart
      const last7Days = await getLastNDaysEntries(7);
      setLast7DaysData(last7Days);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: last7DaysData
      .map((entry) => format(new Date(entry.date + 'T00:00:00'), 'MMM dd'))
      .reverse(),
    datasets: [
      {
        label: 'Gross Earnings (₹)',
        data: last7DaysData.map((entry) => entry.grossEarnings || 0).reverse(),
        backgroundColor: 'rgba(14, 165, 233, 0.6)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Last 7 Days Gross Earnings',
        color: '#6b7280', // Neutral gray that works in both modes
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '₹' + value;
          },
        },
      },
    },
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

  const stats = [
    {
      label: 'Gross Earnings',
      value: `₹${(todayData?.grossEarnings || 0).toFixed(2)}`,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-500',
    },
    {
      label: 'CNG Cost',
      value: `₹${(todayData?.cng || 0).toFixed(2)}`,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-500',
    },
    {
      label: 'Online Adjustments',
      value: `₹${(todayData?.onlineAmountToDriver || 0).toFixed(2)}`,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-500',
      subtitle: 'To driver',
    },
    {
      label: 'Driver Pass',
      value: `₹${(todayData?.driverPassAmount || 0).toFixed(2)}`,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      borderColor: 'border-cyan-500',
      subtitle: '50-50 split',
    },
    {
      label: 'Final Owner Earnings',
      value: `₹${(todayData?.ownerEarnings || 0).toFixed(2)}`,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-500',
    },
    {
      label: 'Final Driver Earnings',
      value: `₹${(todayData?.driverEarnings || 0).toFixed(2)}`,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-500',
    },
    {
      label: 'Trips Today',
      value: todayData?.trips || 0,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-500',
    },
    {
      label: 'Hours Worked',
      value: `${(todayData?.hoursWorked || 0).toFixed(1)} hrs`,
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      borderColor: 'border-pink-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
        <Link to="/add-entry" className="btn-primary">
          + Add Entry
        </Link>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`card ${stat.bgColor} border-l-4 ${stat.borderColor}`}
          >
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            {stat.subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stat.subtitle}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card mb-8">
        <div className="h-64">
          {last7DaysData.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No data available for the last 7 days
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

