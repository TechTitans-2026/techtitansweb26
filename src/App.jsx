import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import BackgroundEffects from './components/BackgroundEffects';

// Core pages
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Members from './pages/Members';
import Auth from './pages/Auth';
import Quests from './pages/Quests';
import Profile from './pages/Profile';


// Lazy-load heavy pages for code-splitting
const Admin = lazy(() => import('./pages/Admin'));
const TechTitansLanding = lazy(() => import('./pages/TechTitansLanding'));

// Read once at module level — stable across renders, consistent with Scene.jsx prop pattern
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Protected Route Wrapper for Authenticated Users
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div className="min-h-screen bg-[#1a1b22] text-white flex items-center justify-center font-mono text-[#8c8d96]">Loading...</div>;
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname, message: 'Please sign in to access this protocol.' }} replace />;
  return children;
};

// Protected Route Wrapper for Admin Page
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-[#1a1b22] text-white flex items-center justify-center font-mono text-[#8c8d96]">Loading...</div>;
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname, message: 'Please sign in to access this protocol.' }} replace />;
  return children;
};

// Layout for all standard pages — includes Navbar and BackgroundEffects
function MainLayout() {
  return (
    <>
      <BackgroundEffects />
      <Navbar />
      <Outlet />
    </>
  );
}

// Scroll to top automatically on route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Landing page — full-screen 3D entry point */}
          <Route path="/" element={
            <Suspense fallback={<div className="min-h-screen bg-[#080a12]" />}>
              <TechTitansLanding prefersReducedMotion={prefersReducedMotion} />
            </Suspense>
          } />
          <Route path="/landing" element={
            <Suspense fallback={<div className="min-h-screen bg-[#080a12]" />}>
              <TechTitansLanding prefersReducedMotion={prefersReducedMotion} />
            </Suspense>
          } />

          {/* All other portal pages — wrapped in MainLayout with Navbar and BackgroundEffects */}
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/members" element={<Members />} />
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/quests" element={
              <PrivateRoute>
                <Quests />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            <Route path="/admin" element={
              <AdminRoute>
                <Suspense fallback={<div className="min-h-screen bg-[#1a1b22] text-white flex items-center justify-center font-mono text-[#8c8d96]">Loading...</div>}>
                  <Admin />
                </Suspense>
              </AdminRoute>
            } />

            {/* Catch all fallback — inside MainLayout so unmatched paths get navbar */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
