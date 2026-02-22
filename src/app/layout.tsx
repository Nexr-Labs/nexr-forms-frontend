import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from '../components/Auth';
import { Dashboard } from './dashboard/page';
import { EventBuilder } from './events/[id]/edit/page';
import { PublicEvent } from './e/[id]/page';
import { EventResponses } from './events/[id]/responses/page';
import { AuthProvider, useAuth } from '../lib/auth';
import { Home } from './page';

// --- ROUTES ---
const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/e/:id" element={<PublicEvent />} />

          {/* Protected Organizer Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/events/:id/edit" element={<PrivateRoute><EventBuilder /></PrivateRoute>} />
          <Route path="/events/:id/responses" element={<PrivateRoute><EventResponses /></PrivateRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default RootLayout;