import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FilmDetail from './pages/FilmDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import ToastContainer from './components/ToastContainer';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      <Navbar />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/films/:id" element={<FilmDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ToastContainer />
    </>
  );
}
