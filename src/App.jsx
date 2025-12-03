import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddEntry from './pages/AddEntry';
import EntriesList from './pages/EntriesList';
import MonthlySummary from './pages/MonthlySummary';
import Navbar from './components/Navbar';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

// Main App Routes
const AppRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <Router>
      {currentUser && <Navbar />}
      <div className="min-h-screen pb-20">
        <Routes>
          <Route
            path="/login"
            element={currentUser ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-entry"
            element={
              <ProtectedRoute>
                <AddEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entries"
            element={
              <ProtectedRoute>
                <EntriesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/monthly"
            element={
              <ProtectedRoute>
                <MonthlySummary />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

