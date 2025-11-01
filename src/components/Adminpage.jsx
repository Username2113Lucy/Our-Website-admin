import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export default function Adminpage({ user, onLogout }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const toggleAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
  };

  const navigate = useNavigate();

  // Close admin panel when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.admin-panel-container')) {
      setShowAdminPanel(false);
    }
  };

  // Add click outside listener
  React.useEffect(() => {
    if (showAdminPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdminPanel]);

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      
      {/* Background Video (commented out) */}
      {/* <video autoPlay muted loop playsInline className="absolute top-0 left-0 w-full h-full object-cover z-[-1] opacity-70">
        <source src="/videos/bgvdo.mp4" type="video/mp4" />
      </video> */}

      {/* Transparent Fullscreen Overlay with Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/image/Lo.png"
          alt="Logo"
          className="object-contain opacity-100"
        />
      </div>

      {/* Top Section */}
      <div className="fixed top-0 left-0 w-full h-30 flex items-center justify-between px-8 bg-black/70 relative">
        
        {/* triple border bottom */}
        <div className="absolute bottom-[-6px] left-0 w-full">
          <div className="h-[2px] bg-yellow-500"></div>
          <div className="h-[2px] bg-black"></div>
          <div className="h-[2px] bg-yellow-500"></div>
        </div>

        {/* Left: Logo */}
        <div className="flex items-center">
          <img
            src="/image/Lo.png"
            alt="Logo"
            className="w-40 h-40 object-contain opacity-90"
          />
        </div>

        {/* Center: Slogan */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-semibold text-center ml-[150px]">
            EVERY CLICK CARRIES RESPONSIBILITY 
          </h1>
        </div>

        {/* Right: Admin Panel Button with Dropdown */}
        <div className="flex items-center admin-panel-container">
          <div className="relative">
<button 
  onClick={toggleAdminPanel}
  className="text-lg font-bold w-40 h-10 flex items-center justify-center bg-transparent text-white border-2 border-yellow-500 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300"
>
  ADMIN PANEL
</button>
            
            {/* Admin Panel Dropdown */}
            {showAdminPanel && (
              <div className="absolute -right-6 top-12 w-80 bg-black/95 border-2 border-yellow-500 rounded-lg shadow-2xl z-50 p-4">
                {/* User Info Section */}
                {user ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-black text-2xl font-bold">
                          {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
                        </span>
                      </div>
                      <h3 className="text-yellow-500 font-bold text-lg">Welcome, {user.username}!</h3>
                      <p className="text-white text-sm">Administrator</p>
                    </div>

    {/* User Details */}
    <div className="space-y-2 mb-4">
      <div className="flex justify-between border-b border-yellow-500/30 pb-1">
        <span className="text-yellow-500">Username:</span> {/* Added this line */}
        <span className="text-white">{user.username}</span> {/* Added this line */}
      </div>
      <div className="flex justify-between border-b border-yellow-500/30 pb-1">
        <span className="text-yellow-500">Role:</span>
        <span className="text-white">{user.role || 'Super Admin'}</span> {/* Updated this line */}
      </div>
      <div className="flex justify-between border-b border-yellow-500/30 pb-1">
        <span className="text-yellow-500">Last Login:</span>
        <span className="text-white">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
      </div>
      <div className="flex justify-between border-b border-yellow-500/30 pb-1">
        <span className="text-yellow-500">Status:</span>
        <span className="text-green-500 animate-pulse">● Online</span>
      </div>
    </div>

{/* Action Buttons */}
<div className="space-y-2 flex justify-center">
  <button 
    onClick={onLogout}
    className="w-20 bg-transparent text-red-500 border-2 border-red-500 font-bold py-2 rounded-lg hover:text-white hover:bg-red-500 transition-all duration-300 text-sm"
  >
    LOG OUT
  </button>
</div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-yellow-500 mb-2">Not Logged In</p>
                    <button 
                      onClick={() => navigate('/login')}
                      className="btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-2 px-4 rounded-lg hover:text-black hover:bg-yellow-500 transition-all duration-300"
                    >
                      LOGIN
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed top-1.5 left-0 w-64 h-[calc(100%-7rem)] bg-black/70 flex flex-col gap-4 p-6 relative">
        
        {/* triple border right */}
        <div className="absolute top-0 right-[-6px] h-full">
          <div className="w-[2px] h-full bg-yellow-500 absolute left-0"></div>
          <div className="w-[3px] h-full bg-black absolute right-[1px]"></div>
          <div className="w-[2px] h-full bg-yellow-500 absolute right-[2px]"></div>
        </div>

        <div className="flex flex-col gap-4 w-64">
          {/* Dashboard Button */}
          <div>
            <Link
              to="/" 
              onClick={() => setOpenMenu(null)} 
              className="w-53 block text-center btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-3 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300"
            >
              DASHBOARD
            </Link>
          </div>

          {/* Registration Dropdown */}
          <div>
            <button
              onClick={() => toggleMenu("registration")}
              className="w-53 btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-3 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300"
            >
              REGISTRATION ⮛
            </button>
            {openMenu === "registration" && (
              <div className="w-50 ml-4 mt-2 flex flex-col gap-2">
                <Link to='/Careersreg' className="btn-glowing block text-center bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-1 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300">
                  Careers
                </Link>
                <Link to='/Course Registration' className="btn-glowing block text-center bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-1 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300">
                  Courses
                </Link>
                <Link to='/Internship Registration' className="btn-glowing block text-center bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-1 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300">
                  Internship
                </Link>
              </div>
            )}
          </div>

          {/* Idea Forge */}
          <div>
            <button
              onClick={() => navigate('/IdeaForgeDetails')}
              className="w-53 btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-3 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300"
            >
              IDEA FORGE 
            </button>
          </div>
        </div>
      </div>

      {/* Add this style tag for the glowing effect */}
      <style>{`
        .btn-glowing {
          position: relative;
          z-index: 1;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.8), 
                       0 0 20px rgba(255, 215, 0, 0.6);
          transition: all 0.3s ease;
        }
        
        .btn-glowing:hover {
          text-shadow: 0 0 5px rgba(0, 0, 0, 0.9);
        }
        
        .btn-glowing::after {
          content: "";
          z-index: -1;
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #1a1a1a;
          left: 0;
          top: 0;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .btn-glowing::before {
          content: "";
          background: linear-gradient(
            90deg,
            #000000, #1a1a1a, #2d2d2d, #3d3d3d,
            #d4af37, #ffd700, #f1c232, #d4af37,
            #3d3d3d, #2d2d2d, #1a1a1a, #000000
          );
          position: absolute;
          top: -3px;
          left: -3px;
          background-size: 400% 100%;
          z-index: -1;
          width: calc(100% + 6px);
          height: calc(100% + 6px);
          filter: blur(8px);
          animation: waveGlow 3s linear infinite;
          transition: all 0.3s ease;
          border-radius: 10px;
          opacity: 0.8;
        }
        
        .btn-glowing:hover::before {
          opacity: 1;
          filter: blur(12px);
          animation: waveGlow 5.0s linear infinite;
          top: -5px;
          left: -5px;
          width: calc(100% + 10px);
          height: calc(100% + 10px);
        }
        
        .btn-glowing:hover::after {
          background-color: transparent;
        }
        
        @keyframes waveGlow {
          0% { 
            background-position: 100% 0;
          }
          100% { 
            background-position: 0 0;
          }
        }
      `}</style>
    </div>
  );
}