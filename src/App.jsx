import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Interndatabase from "./pages/Interndatabase";
import { Dashboard } from "./pages/Dashboard";
import Adminpage from "./components/Adminpage";
import { Courseentry } from "./pages/Courseentry";
import { Coursedatabase } from "./pages/Coursedatabase";
import Internentry from "./pages/Internentry";
import Careersreg from "./pages/Careersreg";
import Internshipreg from "./pages/Internshipreg";
import RDreg from "./pages/RDreg";
import Coursereg from "./pages/Coursereg";
import Ideaforge from "./pages/Ideaforge";
import Login from "./components/Login";

// useAuth hook directly in App.jsx
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentTabId, setCurrentTabId] = useState('');

  useEffect(() => {
    // Generate or get unique tab ID
    let tabId = sessionStorage.getItem('adminTabId');
    if (!tabId) {
      tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('adminTabId', tabId);
    }
    setCurrentTabId(tabId);
    
    // Check if this tab is authenticated
    const authData = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    const savedUser = localStorage.getItem('user');
    
    if (authData.tabId === tabId && authData.expires > Date.now()) {
      setIsAuthenticated(true);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'adminAuth' && !e.newValue) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData) => {
    const tabId = sessionStorage.getItem('adminTabId');
    const authData = {
      tabId: tabId,
      expires: Date.now() + (2 * 60 * 60 * 1000), // 2 hours
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('adminAuth', JSON.stringify(authData));
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    const authData = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    
    // Only logout this tab
    if (authData.tabId === currentTabId) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return { isAuthenticated, user, login, logout };
};

function App() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <>
      <Router>
        {isAuthenticated ? (
          <>
            <Adminpage user={user} onLogout={logout} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/InternEntry" element={<Internentry />} />
              <Route path="/InternDatabase" element={<Interndatabase />} />
              <Route path="/CourseEntry" element={<Courseentry />} />
              <Route path="/CourseDatabase" element={<Coursedatabase />} />
              <Route path="/Careersreg" element={<Careersreg />} />
              <Route path="/Course Registration" element={<Coursereg />} />
              <Route path="/Internship Registration" element={<Internshipreg />} />
              <Route path="/R & D Registration" element={<RDreg />} />
              <Route path="/IdeaForgeDetails" element={<Ideaforge />} />
            </Routes>
          </>
        ) : (
          <Routes>
            <Route 
              path="*" 
              element={<Login onLogin={login} />} 
            />
          </Routes>
        )}
      </Router>
    </>
  );
}

export default App;