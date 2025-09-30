import React, { useState, useEffect } from "react";
import axios from "axios";

const Internentry = () => {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [course, setCourse] = useState("");
  const [days, setDays] = useState("");
  const [entries, setEntries] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [success, setSuccess] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [activeTab, setActiveTab] = useState("entry"); // "entry" | "database"
  const [dbEntries, setDbEntries] = useState([]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Random code generators
  const randomChar = (chars) =>
    chars.charAt(Math.floor(Math.random() * chars.length));

  const generateReferralCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "@#$%&*";
    const chars = letters + numbers + special;

    const part1 = Array.from({ length: 4 }, () => randomChar(chars)).join("");
    const part2 = Array.from({ length: 4 }, () => randomChar(chars)).join("");
    return `VIR-${part1}-${part2}`;
  };

  const generateLoginID = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const chars = letters + numbers;

    const part1 = Array.from({ length: 4 }, () => randomChar(chars)).join("");
    const part2 = Array.from({ length: 4 }, () => randomChar(chars)).join("");
    const part3 = Array.from({ length: 2 }, () => randomChar(chars)).join("");
    return `VIL-${part1}-${part2}-${part3}`;
  };

  const generatePassword = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "@#$%&*";
    const chars = letters + numbers + special;

    const part1 = Array.from({ length: 4 }, () => randomChar(chars)).join("");
    const part2 = Array.from({ length: 4 }, () => randomChar(chars)).join("");
    const part3 = Array.from({ length: 4 }, () => randomChar(chars)).join("");
    return `VIP-${part1}-${part2}-${part3}`;
  };

  const handleAddEmail = () => {
    const newEmails = emailInput
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter((e) => e && emailRegex.test(e) && !emails.includes(e));

    if (newEmails.length === 0) {
      alert("Please enter a valid email address");
      return;
    }

    setEmails([...emails, ...newEmails]);
    setEmailInput("");
  };

  const removeEmail = (index) => {
    const updated = [...emails];
    updated.splice(index, 1);
    setEmails(updated);
  };

  const handleAddEntry = () => {
    if (!course) {
      alert("Please select a course");
      return;
    }

    if (days === "") {
      alert("Please enter number of days");
      return;
    }

    if (editIndex !== null) {
      const updated = [...entries];
      updated[editIndex] = {
        ...updated[editIndex],
        email: emailInput.trim(),
        domain: emailInput.split("@")[1] || "",
        course,
        days,
      };
      setEntries(updated);
      setEditIndex(null);
    } else {
      // if there are no emails but user typed one directly, allow single-email add
      const targetEmails = emails.length > 0 ? emails : [emailInput.trim()].filter(Boolean);

      const newEntries = targetEmails.map((email) => ({
        email,
        domain: email.split("@")[1] || "",
        course,
        days,
        referralCode: generateReferralCode(),
        loginID: generateLoginID(),
        password: generatePassword(),
      }));
      setEntries([...entries, ...newEntries]);
    }

    setEmailInput("");
    setEmails([]);
    setCourse("");
    setDays("");
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    const entry = entries[index];
    setEmailInput(entry.email);
    setCourse(entry.course);
    setDays(entry.days);
    setEmails([]);
  };

  const handleDelete = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const fetchDatabase = async () => {
    try {
      const res = await axios.get("http://localhost:5000/InternEntries/entries");
      // adapt depending on backend shape: if backend returns { entries: [...] } use res.data.entries
      const data = Array.isArray(res.data) ? res.data : res.data.entries || [];
      setDbEntries(data);
    } catch (err) {
      console.error("Error fetching DB entries:", err);
      alert("Failed to fetch database entries. See console.");
    }
  };

  // fetch when database tab is opened
  useEffect(() => {
    if (activeTab === "database") {
      fetchDatabase();
    }
  }, [activeTab]);

  const handleSave = async () => {
    if (entries.length === 0) {
      alert("No entries to save");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/InternEntries/entries", {
        entries: entries,
      });

      // assume backend returns 201 on created
      if (response.status === 201 || response.status === 200) {
        // save succeeded: refresh DB entries to include newly created rows
        await fetchDatabase();

        // show success screen and clear local entries
        setSavedCount(entries.length);
        setEntries([]); // clear local unsaved entries
        setSuccess(true);
        // keep activeTab on 'entry' so success is shown as a separate screen in entry flow
        setActiveTab("entry");
      } else {
        alert("Unexpected response from server when saving.");
        console.error("Save response:", response);
      }
    } catch (error) {
      console.error("Error saving entries:", error);
      alert("Failed to save entries. Check console for details.");
    }
  };

  const handleDeleteFromDB = async (id) => {
  if (!window.confirm("Are you sure you want to delete this entry?")) return;
  try {
    await axios.delete(`http://localhost:5000/InternEntries/entries/${id}`);
    // Refresh list after delete
    fetchDatabase();
  } catch (err) {
    console.error("Error deleting entry:", err);
    alert("Failed to delete entry.");
    }
  };

  const handleBack = () => {
    // go back to intern entry screen
    setSuccess(false);
    setEntries([]);
    setEmailInput("");
    setEmails([]);
    setCourse("");
    setDays("");
    setEditIndex(null);
    setSavedCount(0);
  };

  return (
    <div className="absolute top-31.5 left-66 right-0 bottom-0 p-6 overflow-auto z-10 bg-black/70 text-white">
      {/* Navbar */}
      <div className="flex gap-4 mb-6 border-b border-yellow-600 pb-2">
        <button
          onClick={() => setActiveTab("entry")}
          className={`px-4 py-2 rounded ${activeTab === "entry" ? "bg-yellow-600 text-black" : "bg-gray-800"}`}
        >
          Intern Entry
        </button>
        <button
          onClick={() => setActiveTab("database")}
          className={`px-4 py-2 rounded ${activeTab === "database" ? "bg-yellow-600 text-black" : "bg-gray-800"}`}
        >
          Database
        </button>
      </div>

      {/* Priority rendering:
            1) Database tab (if activeTab === "database")
            2) Success screen (if success === true and activeTab !== "database")
            3) Entry screen (default)
      */}
      {activeTab === "database" ? (
        // DATABASE SCREEN
        <div className="overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Internship Database</h2>
            <div className="flex gap-2">
              <button
                onClick={fetchDatabase}
                className="px-4 py-2 bg-yellow-600 text-black rounded hover:bg-yellow-700"
              >
                Refresh
              </button>
              <button
                onClick={() => { setActiveTab("entry"); setSuccess(false); }}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Back to Entry
              </button>
            </div>
          </div>

          {dbEntries.length === 0 ? (
            <p>No data found.</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-max border border-yellow-600 text-white whitespace-nowrap">
                <thead>
                  <tr className="bg-yellow-600 text-black">
                    <th className="border px-4 py-2">S.No</th>
                    <th className="border px-4 py-2">Email</th>
                    <th className="border px-4 py-2">Course</th>
                    <th className="border px-4 py-2">Days</th>
                    <th className="border px-4 py-2">Referral Code</th>
                    <th className="border px-4 py-2">Login ID</th>
                    <th className="border px-4 py-2">Password</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Created At</th>
                    <th className="border px-4 py-2">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {dbEntries.map((entry, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="border px-4 py-2">{idx + 1}</td>
                      <td className="border px-4 py-2">{entry.email}</td>
                      <td className="border px-4 py-2">{entry.course}</td>
                      <td className="border px-4 py-2">{entry.days}</td>
                      <td className="border px-4 py-2">{entry.referralCode}</td>
                      <td className="border px-4 py-2">{entry.loginID}</td>
                      <td className="border px-4 py-2">{entry.password}</td>
                      <td className="border px-4 py-2">{entry.status}</td>
                      <td className="border px-4 py-2">
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleDeleteFromDB(entry._id)}
                          className="px-2 py-1 bg-red-500 rounded hover:bg-red-600"
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
      ) : success ? (
        // SUCCESS SCREEN (only when not on Database tab)
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-3xl font-bold text-green-400 mb-4">
            ✅ {savedCount} Student{savedCount !== 1 ? "s" : ""} Details Were Registered!
          </h2>
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-yellow-600 rounded hover:bg-yellow-700"
            >
              Back to Entry
            </button>
          </div>
        </div>
      ) : (
        // ENTRY SCREEN
        <>
          <h2 className="text-2xl font-bold mb-6">Internship Entries</h2>

          {/* Email input */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
                placeholder="Enter email(s) and press Add or Enter"
                className="flex-1 p-2 rounded bg-black text-white border border-yellow-500"
              />
              <button
                onClick={handleAddEmail}
                className="px-3 py-2 rounded bg-yellow-600 hover:bg-yellow-700"
              >
                Add
              </button>
            </div>
            {editIndex === null && emailInput && !emails.includes(emailInput) && (
              <span className="text-yellow-600 text-sm">
                👉 Press <b>Add</b> or <b>Enter</b> to save this email
              </span>
            )}
          </div>

          {/* Email chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {emails.map((email, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-yellow-600 text-black rounded-full flex items-center gap-2"
              >
                {email}
                <button onClick={() => removeEmail(index)} className="text-red-700 font-bold">
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Course dropdown */}
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-black text-white border border-yellow-600"
          >
            <option value="">Select Course</option>
            <option value="Data Science">Data Science</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="Full Stack Development">Full Stack Development</option>
            <option value="AI & ML">AI & ML</option>
          </select>

          {/* Number of Days */}
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="Enter No of Days"
            min="0"
            className="w-full p-2 mb-4 rounded bg-black text-white border border-yellow-600"
          />

          {/* Add entry button */}
          <button
            onClick={handleAddEntry}
            className="w-32 py-2 mb-6 text-black font-bold bg-yellow-600 rounded hover:bg-yellow-700 transition-all"
          >
            {editIndex !== null ? "Save Edit" : "+ ADD"}
          </button>

          {/* Table - horizontally scrollable */}
          {entries.length > 0 && (
            <div className="overflow-auto mb-6">
              <table className="min-w-max border border-yellow-600 text-white whitespace-nowrap">
                <thead>
                  <tr className="bg-yellow-600 text-black">
                    <th className="border px-4 py-2">S.No</th>
                    <th className="border px-4 py-2">Email</th>
                    <th className="border px-4 py-2">Domain</th>
                    <th className="border px-4 py-2">Course</th>
                    <th className="border px-4 py-2">No of Days</th>
                    <th className="border px-4 py-2">Referral Code</th>
                    <th className="border px-4 py-2">Login ID</th>
                    <th className="border px-4 py-2">Password</th>
                    <th className="border px-4 py-2">Edit</th>
                    <th className="border px-4 py-2">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="border px-4 py-2">{idx + 1}</td>
                      <td className="border px-4 py-2">{entry.email}</td>
                      <td className="border px-4 py-2">{entry.domain}</td>
                      <td className="border px-4 py-2">{entry.course}</td>
                      <td className="border px-4 py-2">
                        {entry.days === "0" ? "Only Certificate" : entry.days}
                      </td>
                      <td className="border px-4 py-2">{entry.referralCode}</td>
                      <td className="border px-4 py-2">{entry.loginID}</td>
                      <td className="border px-4 py-2">{entry.password}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleEdit(idx)}
                          className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleDelete(idx)}
                          className="px-2 py-1 bg-red-500 rounded hover:bg-red-600"
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

          {/* Save Button */}
          {entries.length > 0 && (
            <button
              onClick={handleSave}
              className="w-40 py-2 text-black font-bold bg-green-500 rounded hover:bg-green-600 transition-all"
            >
              Save
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Internentry;
