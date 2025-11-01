import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const users = [
    { username: 'VSVetrian', password: '04910#VTS', role: 'Super Admin' },
  ];

  const maxAttempts = 3;
  const lockoutTime = 300000; // 5 minutes = 300,000 ms

  // Format time as mm:ss min or ss sec
  const formatTime = (seconds) => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')} min`;
    } else {
      return `${seconds.toString().padStart(2, '0')} sec`;
    }
  };

  // Separate function to handle normal attempt errors
  const showAttemptError = (remainingAttempts) => {
    setError(`Invalid Credentials. ${remainingAttempts} attempts remaining.`);
  };

  // Separate function to handle lockout errors
  const showLockoutError = (time) => {
    setError(`Too many failed attempts! Account locked for ${formatTime(time)}.`);
  };

  // Load attempts and lock status from localStorage on component mount
  useEffect(() => {
    const savedAttempts = localStorage.getItem('loginAttempts');
    const savedLockStatus = localStorage.getItem('isLocked');
    const savedLockTime = localStorage.getItem('lockTime');
    
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
    
    if (savedLockStatus === 'true') {
      const lockTime = parseInt(savedLockTime);
      const currentTime = new Date().getTime();
      const timeElapsed = currentTime - lockTime;
      
      if (timeElapsed < lockoutTime) {
        // Still locked
        setIsLocked(true);
        const remainingTime = lockoutTime - timeElapsed;
        const initialTimeLeft = Math.ceil(remainingTime / 1000);
        setTimeLeft(initialTimeLeft);
        showLockoutError(initialTimeLeft);
        
        // Start countdown
        const interval = setInterval(() => {
          setTimeLeft(prev => {
            const newTime = prev - 1;
            if (newTime <= 0) {
              clearInterval(interval);
              handleUnlock();
              return 0;
            }
            return newTime;
          });
        }, 1000);

        return () => clearInterval(interval);
      } else {
        // Lock time expired
        handleUnlock();
      }
    }
  }, []);

  const handleUnlock = () => {
    setIsLocked(false);
    setAttempts(0);
    setTimeLeft(0);
    localStorage.removeItem('isLocked');
    localStorage.removeItem('lockTime');
    localStorage.removeItem('loginAttempts');
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('🔄 Login button clicked');
    
    // Check if account is locked
    if (isLocked) {
      console.log('🔒 Account is locked');
      showLockoutError(timeLeft);
      return;
    }
    
    setIsLoading(true);
    console.log('🔍 Checking credentials...');
    
    // Check if credentials match any user in the dictionary
    const matchedUser = users.find(user => 
      user.username === username && user.password === password
    );
    
    console.log('👤 Matched user:', matchedUser);
    
    if (matchedUser) {
      console.log('✅ Credentials matched, proceeding with login...');
      
      // Reset attempts on successful login
      setAttempts(0);
      setIsLocked(false);
      setTimeLeft(0);
      
      try {
        // Call the onLogin prop from App.jsx
        console.log('🚀 Calling onLogin function...');
        onLogin({ 
          username: matchedUser.username, 
          role: matchedUser.role 
        });
        
        console.log('✅ Login function completed, clearing attempt data...');
        
        // Clear login attempt data
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('isLocked');
        localStorage.removeItem('lockTime');
        
        console.log('🔄 Navigating to dashboard...');
        navigate('/');
        setError('');
      } catch (error) {
        console.error('❌ Error during login:', error);
        setError('Login failed. Please try again.');
      }
    } else {
      console.log('❌ Invalid credentials');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());
      
      if (newAttempts >= maxAttempts) {
        console.log('🔒 Maximum attempts reached, locking account...');
        const initialTime = Math.ceil(lockoutTime / 1000);
        setTimeLeft(initialTime);
        setIsLocked(true);
        localStorage.setItem('isLocked', 'true');
        localStorage.setItem('lockTime', new Date().getTime().toString());
        
        showLockoutError(initialTime);
        
        const interval = setInterval(() => {
          setTimeLeft(prev => {
            const newTime = prev - 1;
            if (newTime <= 0) {
              clearInterval(interval);
              handleUnlock();
              return 0;
            }
            return newTime;
          });
        }, 1000);

        return () => clearInterval(interval);
      } else {
        showAttemptError(maxAttempts - newAttempts);
      }
    }
    
    setIsLoading(false);
  };

  // Update lockout error message when timeLeft changes
  useEffect(() => {
    if (isLocked && timeLeft > 0) {
      showLockoutError(timeLeft);
    }
  }, [timeLeft, isLocked]);

  return (
    <div className="h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background Logo - Bigger and with round border */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="rounded-full border-4 border-yellow-500/30">
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
            draggable="false"
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
              disabled={isLocked || isLoading}
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
              disabled={isLocked || isLoading}
            />
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className={`w-30 btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-3 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300 ${
                isLoading || isLocked ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLocked || isLoading}
            >
              {isLoading ? 'PROCESSING...' : isLocked ? 'LOCKED' : 'LOGIN'}
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