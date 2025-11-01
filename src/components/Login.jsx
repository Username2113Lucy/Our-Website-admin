import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Login = ({ setIsAuthenticated, setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

const users = [

    { username: 'VSVetrian', password: '04910#VTS', role: 'Super Admin' },

//   { 
//     username: import.meta.env.VITE_ADMIN_1_USERNAME, 
//     password: import.meta.env.VITE_ADMIN_1_PASSWORD, 
//     role: import.meta.env.VITE_ADMIN_1_ROLE 
//   },
//   // You can add more users like this:
//   {
//     username: import.meta.env.VITE_ADMIN_2_USERNAME, 
//     password: import.meta.env.VITE_ADMIN_2_PASSWORD, 
//     role: import.meta.env.VITE_ADMIN_2_ROLE
//   }
];

  const maxAttempts = 3; // Maximum allowed attempts
  const lockoutTime = 30000; // 30 seconds lockout

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      setError('Account temporarily locked. Please try again later.');
      setTimeout(() => {
        setError('');
      }, 5000);
      return;
    }
    
    // Check if credentials match any user in the dictionary
    const matchedUser = users.find(user => 
      user.username === username && user.password === password
    );
    
    if (matchedUser) {
      // Reset attempts on successful login
      setAttempts(0);
      setIsLocked(false);
      setIsAuthenticated(true);
      setUser({ 
        username: matchedUser.username, 
        role: matchedUser.role 
      });
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ 
        username: matchedUser.username, 
        role: matchedUser.role 
      }));
      navigate('/');
      setError('');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setError(`Too many failed attempts! Account locked for ${lockoutTime/1000} seconds.`);
        setIsLocked(true);
        // Auto unlock after lockout time
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
          setError('');
        }, lockoutTime);
      } else {
        setError(`Invalid Credentials. ${maxAttempts - newAttempts} attempts remaining.`);
      }
      
      // Auto clear error after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative">
      {/* Background Logo - Bigger and with round border */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="p-38 rounded-full border-4 border-yellow-500/30">
          <img
            src="/image/Lo.png"
            alt="Logo"
            className="w-[800px] h-[800px] object-cover"
          />
        </div>
      </div>

      {/* Login Form - Wider */}
      <div className="bg-black/80 border-2 border-yellow-500 rounded-lg p-8 w-[500px] relative z-10">
        
        {/* Logo at the top - Bigger with round border */}
        <div className="flex justify-center">
          <img
            src="/image/Head_Lo.png"
            alt="Company Logo"
            className="w-32 h-32 object-contain"
          />
        </div>

        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-yellow-500 mb-2">ADMIN LOGIN</h2>
          <p className="text-white text-sm">Enter your credentials to access the panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          
        <div className="flex justify-center mt-4">
          {error && (
            <div className={`bg-red-500/20 border border-red-500 text-red-300 px-3 py-2 rounded text-sm text-center w-70 ${isLocked ? 'animate-pulse' : ''}`}>
              {error}
            </div>
          )}
        </div>
          
          <div>
            <label className="block text-yellow-500 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black border-2 border-yellow-500 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-300"
              placeholder="Enter username"
              required
              disabled={isLocked}
            />
          </div>

          <div>
            <label className="block text-yellow-500 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border-2 border-yellow-500 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-yellow-300"
              placeholder="Enter password"
              required
              disabled={isLocked}
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-30 btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-3 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLocked}
            >
              {isLocked ? 'LOCKED' : 'LOGIN'}
            </button>
          </div>

          {/* Attempts counter */}
          {attempts > 0 && !isLocked && (
            <div className="text-center text-yellow-500 text-sm">
              Attempts: {attempts}/{maxAttempts}
            </div>
          )}


        </form>

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
    </div>
  );
};

export default Login;