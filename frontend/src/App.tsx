import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientSearchPage } from './pages/PatientSearchPage';
import { PatientProfilePage } from './pages/PatientProfilePage';
import { ConsultationPage } from './pages/ConsultationPage';
import { PrescriptionPage } from './pages/PrescriptionPage';
import './styles/index.scss';

// Protected route wrapper
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/search"
        element={
          <ProtectedRoute>
            <PatientSearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute>
            <PatientProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultation/:patientId"
        element={
          <ProtectedRoute>
            <ConsultationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prescription/:prescriptionId"
        element={
          <ProtectedRoute>
            <PrescriptionPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ToastContainer />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
