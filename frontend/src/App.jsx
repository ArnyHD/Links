import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import CreateDomain from './pages/CreateDomain';
import EditDomain from './pages/EditDomain';
import DomainDetails from './pages/DomainDetails';
import CreateNode from './pages/CreateNode';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/domains/create"
            element={
              <ProtectedRoute>
                <CreateDomain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/domains/:id/edit"
            element={
              <ProtectedRoute>
                <EditDomain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/domains/:id/details"
            element={
              <ProtectedRoute>
                <DomainDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nodes/create"
            element={
              <ProtectedRoute>
                <CreateNode />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
