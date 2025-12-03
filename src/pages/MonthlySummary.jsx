import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parse } from 'date-fns';
import { getEntriesByMonth } from '../firebase/entries';
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

const MonthlySummary = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadMonthlyData();
  }, [selectedMonth]);

  const loadMonthlyData = async () => {
    try {
      setLoading(true);
      const data = await getEntriesByMonth(selectedMonth);
      setEntries(data);
      calculateSummary(data);
    } catch (error) {
      console.error('Error loading monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const totals = data.reduce(
      (acc, entry) => ({
        grossEarnings: acc.grossEarnings + (entry.grossEarnings || 0),
        cng: acc.cng + (entry.cng || 0),
        netEarnings: acc.netEarnings + (entry.netEarnings || 0),
        ownerEarnings: acc.ownerEarnings + (entry.ownerEarnings || 0),
        driverEarnings: acc.driverEarnings + (entry.driverEarnings || 0),
        trips: acc.trips + (entry.trips || 0),
        hoursWorked: acc.hoursWorked + parseFloat(entry.hoursWorked || 0),
        daysWithEntries: acc.daysWithEntries + 1,
      }),
      {
        grossEarnings: 0,
        cng: 0,
        netEarnings: 0,
        ownerEarnings: 0,
        driverEarnings: 0,
        trips: 0,
        hoursWorked: 0,
        daysWithEntries: 0,
      }
    );

    const avgDailyGross =
      totals.daysWithEntries > 0
        ? totals.grossEarnings / totals.daysWithEntries
        : 0;

    setSummary({
      ...totals,
      avgDailyGross,
    });
  };

  // Prepare chart data for the month
  const prepareChartData = () => {
    const monthStart = startOfMonth(parse(selectedMonth + '-01', 'yyyy-MM-dd', new Date()));
    const monthEnd = endOfMonth(monthStart);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Create a map of entries by date
    const entriesByDate = {};
    entries.forEach((entry) => {
      entriesByDate[entry.date] = entry;
    });

    // Prepare data for each day
    const labels = daysInMonth.map((day) => format(day, 'MMM dd'));
    const data = daysInMonth.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const entry = entriesByDate[dateStr];
      return entry ? entry.grossEarnings || 0 : 0;
    });

    return { labels, data };
  };

  const chartDataObj = prepareChartData();

  const chartData = {
    labels: chartDataObj.labels,
    datasets: [
      {
        label: 'Gross Earnings (₹)',
        data: chartDataObj.data,
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
        text: `Daily Gross Earnings - ${format(parse(selectedMonth + '-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy')}`,
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

  const stats = summary
    ? [
        {
          label: 'Total Gross Earnings',
          value: `₹${summary.grossEarnings.toFixed(2)}`,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
          label: 'Total CNG Paid',
          value: `₹${summary.cng.toFixed(2)}`,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        },
        {
          label: 'Total Net Earnings',
          value: `₹${summary.netEarnings.toFixed(2)}`,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
          label: 'Total Owner Earnings',
          value: `₹${summary.ownerEarnings.toFixed(2)}`,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
        {
          label: 'Total Driver Earnings',
          value: `₹${summary.driverEarnings.toFixed(2)}`,
          color: 'text-indigo-600 dark:text-indigo-400',
          bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
        {
          label: 'Total Trips',
          value: summary.trips,
          color: 'text-teal-600 dark:text-teal-400',
          bgColor: 'bg-teal-50 dark:bg-teal-900/20',
        },
        {
          label: 'Total Hours',
          value: `${summary.hoursWorked.toFixed(1)} hrs`,
          color: 'text-pink-600 dark:text-pink-400',
          bgColor: 'bg-pink-50 dark:bg-pink-900/20',
        },
        {
          label: 'Avg Daily Gross',
          value: `₹${summary.avgDailyGross.toFixed(2)}`,
          color: 'text-cyan-600 dark:text-cyan-400',
          bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
        },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Monthly Summary
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View detailed analytics for any month
        </p>
      </div>

      {/* Month Selector */}
      <div className="card mb-6">
        <label htmlFor="month" className="label">
          Select Month
        </label>
        <input
          id="month"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input-field w-full sm:w-auto"
        />
      </div>

      {/* Summary Cards */}
      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`card ${stat.bgColor} border-l-4 ${
                  index === 0
                    ? 'border-blue-500'
                    : index === 1
                    ? 'border-orange-500'
                    : index === 2
                    ? 'border-green-500'
                    : index === 3
                    ? 'border-purple-500'
                    : index === 4
                    ? 'border-indigo-500'
                    : index === 5
                    ? 'border-teal-500'
                    : index === 6
                    ? 'border-pink-500'
                    : 'border-cyan-500'
                }`}
              >
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="card mb-8">
            <div className="h-96">
              {entries.length > 0 ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  No entries found for this month
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!summary && (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No data available for the selected month
          </p>
        </div>
      )}
    </div>
  );
};

export default MonthlySummary;

