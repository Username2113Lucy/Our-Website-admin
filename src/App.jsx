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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    
    if (auth === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  return (
    <>
      <Router>
        {isAuthenticated ? (
          <>
            <Adminpage user={user} onLogout={handleLogout} />
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
              element={
                <Login 
                  setIsAuthenticated={setIsAuthenticated} 
                  setUser={setUser} 
                />
              } 
            />
          </Routes>
        )}
      </Router>
    </>
  );
}

export default App;