import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import BackgroundEffects from './components/BackgroundEffects';

// Core pages (loaded eagerly — visited by every user)
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Members from './pages/Members';
import Auth from './pages/Auth';
import Quests from './pages/Quests';
import Profile from './pages/Profile';

// Rarely-visited protected page — code-split so it doesn't bloat
// the main bundle every visitor downloads on first load.
const Admin = lazy(() => import('./pages/Admin'));

// Protected Route Wrapper for Admin
const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

// Protected Route Wrapper for Members Area
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BackgroundEffects />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/members" element={<Members />} />
          <Route path="/auth" element={<Auth />} />
          
          <Route path="/admin" element={
            <AdminRoute>
              <Suspense fallback={<div className="min-h-screen bg-[#1a1b22] text-white flex items-center justify-center font-mono text-[#8c8d96]">Loading...</div>}>
                <Admin />
              </Suspense>
            </AdminRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/quests" element={<Quests />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
