import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Coursereg() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/courses/registrations");
      setCourses(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setLoading(false);
    }
  };

  // Delete a course
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this registration?")) return;
    try {
      await axios.delete(`http://localhost:5000/courses/delete/${id}`);
      fetchCourses(); // refresh after delete
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Edit a course field (example: change payment status)
  const handleEdit = async (id) => {
    const newStatus = prompt("Enter new payment status (Pending/Completed):");
    if (!newStatus) return;
    try {
      await axios.put(`http://localhost:5000/courses/update/${id}`, {
        paymentStatus: newStatus,
      });
      fetchCourses();
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="absolute top-31.5 left-66 right-0 bottom-0 p-6 overflow-auto z-10 bg-black/70 text-yellow-500">
      <h1 className="text-2xl font-bold mb-4 text-yellow-500">Course Registrations Database</h1>

      <button
        onClick={fetchCourses}
        className="mb-4 px-4 py-2 border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-black transition"
      >
        Refresh
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-yellow-500">
            <thead>
              <tr className="bg-yellow-500 text-black">
                <th className="border border-yellow-500 px-2 py-1">Full Name</th>
                <th className="border border-yellow-500 px-2 py-1">Email</th>
                <th className="border border-yellow-500 px-2 py-1">Phone</th>
                <th className="border border-yellow-500 px-2 py-1">Gender</th>
                <th className="border border-yellow-500 px-2 py-1">City</th>
                <th className="border border-yellow-500 px-2 py-1">College</th>
                <th className="border border-yellow-500 px-2 py-1">Degree</th>
                <th className="border border-yellow-500 px-2 py-1">Department</th>
                <th className="border border-yellow-500 px-2 py-1">Year</th>
                <th className="border border-yellow-500 px-2 py-1">Roll No</th>
                <th className="border border-yellow-500 px-2 py-1">Course Name</th>
                <th className="border border-yellow-500 px-2 py-1">Duration</th>
                <th className="border border-yellow-500 px-2 py-1">Mode</th>
                <th className="border border-yellow-500 px-2 py-1">Preferred Time</th>
                <th className="border border-yellow-500 px-2 py-1">Level</th>
                <th className="border border-yellow-500 px-2 py-1">Payment Status</th>
                <th className="border border-yellow-500 px-2 py-1">Comments</th>
                <th className="border border-yellow-500 px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id} className="hover:bg-yellow-500/20">
                  <td className="border border-yellow-500 px-2 py-1">{c.fullName}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.email}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.phone}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.gender}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.city}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.college}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.degree}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.department}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.year}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.rollNo}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.courseName}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.duration}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.mode}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.preferredTime}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.level}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.paymentStatus}</td>
                  <td className="border border-yellow-500 px-2 py-1">{c.additionalComments}</td>
                  <td className="border border-yellow-500 px-2 py-1 space-x-2">
                    <button
                      onClick={() => handleEdit(c._id)}
                      className="px-2 py-1 border border-yellow-500 rounded hover:bg-yellow-500 hover:text-black"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="px-2 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
