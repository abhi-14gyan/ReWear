import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* <Navbar /> */}
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    // </AuthProvider>
  );
}

export default App;
