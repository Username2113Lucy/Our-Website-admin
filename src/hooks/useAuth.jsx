// src/hooks/useAuth.jsx
import { useState, useEffect } from 'react';

// Generate or get unique tab ID
const getTabId = () => {
  let tabId = sessionStorage.getItem('adminTabId');
  if (!tabId) {
    tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('adminTabId', tabId);
  }
  return tabId;
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTabId, setCurrentTabId] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('🔐 useAuth useEffect running...');
    const tabId = getTabId();
    console.log('📋 Tab ID:', tabId);
    setCurrentTabId(tabId);
    
    // Check if this tab is authenticated
    const authData = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    const savedUser = localStorage.getItem('user');
    
    console.log('📊 Auth data from localStorage:', authData);
    console.log('👤 User data from localStorage:', savedUser);
    
    if (authData.tabId === tabId && authData.expires > Date.now()) {
      console.log('✅ Tab is authenticated');
      setIsAuthenticated(true);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      console.log('❌ Tab is NOT authenticated');
      setIsAuthenticated(false);
      setUser(null);
    }

    // Listen for storage changes
    const handleStorageChange = (e) => {
      console.log('🔄 Storage changed:', e.key);
      if (e.key === 'adminAuth' && !e.newValue) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData) => {
    console.log('🚀 Login function called with:', userData);
    const tabId = getTabId();
    const authData = {
      tabId: tabId,
      expires: Date.now() + (2 * 60 * 60 * 1000), // 2 hours
      loginTime: new Date().toISOString()
    };
    
    console.log('💾 Saving auth data:', authData);
    
    localStorage.setItem('adminAuth', JSON.stringify(authData));
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    setUser(userData);
    
    console.log('✅ Login completed');
  };

  const logout = () => {
    console.log('🚪 Logout function called');
    const authData = JSON.parse(localStorage.getItem('adminAuth') || '{}');
    
    // Only logout this tab
    if (authData.tabId === currentTabId) {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      console.log('✅ Logout completed');
    }
  };

  return { isAuthenticated, user, login, logout, currentTabId };
};