import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Adminpage() {


  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1] opacity-70"
      >
        <source src="/videos/bgvdo.mp4" type="video/mp4" />
      </video>

      {/* Transparent Fullscreen Overlay with Watermark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/image/sample logo.png"
          alt="Logo"
          className="w-80 h-80 object-contain opacity-100"
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
            src="/image/sample logo.png"
            alt="Logo"
            className="w-25 h-25 object-contain opacity-90"
          />
        </div>

        {/* Center: Slogan */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-semibold text-center ml-[150px]">
            EVERY CLICK CARRIES RESPONSIBLITY 
          </h1>
        </div>

        {/* Right: Admin Button */}
        <div className="flex items-center">
          <button className="text-white text-2xl font-bold w-60 h-10 flex items-center justify-center ">
            ADMIN PANEL
          </button>
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
                {/* Internship Dropdown */}

                <div>
                  <Link
                    to="/" onClick={() => setOpenMenu(null)} 
                    className="w-53 block text-center btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-3 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300"
                  >
                    DASHBOARD
                  </Link>
                </div>

                <div>
                  <button
                    onClick={() => toggleMenu("internship")}
                    className="w-53 btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-3 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300"
                  >
                    INTERNSHIP ⮛
                  </button>
                  {openMenu === "internship" && (
                    <div className="ml-4 mt-2 flex flex-col gap-2">
                      <Link to='/InternEntry' className="w-50 block text-center btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-1 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300">
                        Student Intern Entry
                      </Link>
                      <Link to='/InternDatabase' className="w-50 block text-center btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-1 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300">
                        Intern Database
                      </Link>
                    </div>
                  )}
                </div>

                {/* Course Dropdown */}
                <div>
                  <button
                    onClick={() => toggleMenu("course")}
                    className="w-53 btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-3 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300"
                  >
                    COURSE ⮛
                  </button>
                  {openMenu === "course" && (
                    <div className="w-50 ml-4 mt-2 flex flex-col gap-2">
                      <Link to='/CourseEntry' className="btn-glowing block text-center bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-1 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300">
                        Student Course Entry
                      </Link>
                      <Link to='CourseDatabase' className="btn-glowing block text-center bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-1 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300">
                        Course Database
                      </Link>
                    </div>
                  )}
                </div>

                {/* Course Dropdown */}
                <div>
                  <button
                    onClick={() => toggleMenu("registration")}
                    className="w-53 btn-glowing bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-3 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300"
                  >
                    REGISTRATION ⮛
                  </button>
                  {openMenu === "registration" && (
                    <div className="w-50 ml-4 mt-2 flex flex-col gap-2">
                      <Link to='/Career Registration' className="btn-glowing block text-center bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-1 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300">
                        Careers
                      </Link>
                      <Link to='/Course Registration' className="btn-glowing block text-center bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-1 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300">
                        Courses
                      </Link>
                      <Link to='/Internship Registration' className="btn-glowing block text-center bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-1 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300">
                        Internship
                      </Link>
                      <Link to='/R & D Registration' className="btn-glowing block text-center bg-transparent text-yellow-500 border-2 border-yellow-500 font-bold py-1 rounded-lg shadow-lg hover:text-black hover:bg-yellow-500 transition-all duration-300">
                        R & D Projects
                      </Link>
                    </div>
                  )}
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

