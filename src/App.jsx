import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import  Interndatabase  from "./pages/Interndatabase";
import { Dashboard } from "./pages/Dashboard";
import Adminpage from "./components/Adminpage";
import { Courseentry } from "./pages/Courseentry";
import { Coursedatabase } from "./pages/Coursedatabase";
import Internentry from "./pages/Internentry";
import  Careersreg  from "./pages/Careersreg";
import  Internshipreg  from "./pages/Internshipreg";
import RDreg from "./pages/RDreg";
import Coursereg from "./pages/Coursereg";
import Ideaforge from "./pages/Ideaforge";


function App() {
  return (
    <>
    <Router>
    <Adminpage/>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/InternEntry" element={<Internentry/>} />        
        <Route path="/InternDatabase" element={<Interndatabase/>} />
        <Route path="/CourseEntry" element={<Courseentry/>} />
        <Route path="/CourseDatabase" element={<Coursedatabase/>} />
        <Route path="/Careersreg" element={<Careersreg/>} />
        <Route path="/Course Registration" element={<Coursereg/>} />
        <Route path="/Internship Registration" element={<Internshipreg/>} />
        <Route path="/R & D Registration" element={<RDreg/>} />
        <Route path="/IdeaForgeDetails" element={<Ideaforge/>} />




      </Routes>
    </Router>
    </>
  );
}

export default App;