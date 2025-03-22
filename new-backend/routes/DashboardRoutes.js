// In your router setup
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from 'E:/React/nova-hotel/frontend/src/components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }/>
    </Routes>
  );
}