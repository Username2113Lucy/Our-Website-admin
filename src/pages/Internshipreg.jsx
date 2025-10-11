import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  RefreshCw, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Save, 
  Trash2, 
  X, 
  FileText, 
  Eye, 
  Download,
  Mail,
  Phone,
  User,
  School,
  Calendar,
  Building
} from "lucide-react";
import { Listbox } from "@headlessui/react";

function Internshipreg() {
  const [activeTab, setActiveTab] = useState("partial");
  const [registrations, setRegistrations] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterField, setFilterField] = useState("fullName");
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Counters
  const [partialCounts, setPartialCounts] = useState({ total: 0, notViewed: 0, viewed: 0, deleted: 0 });
  const [mainCounts, setMainCounts] = useState({ total: 0, notViewed: 0, viewed: 0, deleted: 0 });

  const fetchRegistrations = async () => {
    try {
      let url = "";
      if (activeTab === "partial") {
        url = `${import.meta.env.VITE_API_BASE_URL}/PartialIntern/partial-data`;
      } else {
        url = `${import.meta.env.VITE_API_BASE_URL}/RegisterIntern/registration`;
      }

      const res = await axios.get(url);
      const result = Array.isArray(res.data.data) ? res.data.data : [];
      setRegistrations(result);
      setFilteredData(result);
      updateCounts(result);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch internship registrations");
    }
  };

  const updateCounts = (data) => {
    const notViewed = data.filter(item => item.status === "Not Viewed" || !item.status).length;
    const viewed = data.filter(item => item.status === "Viewed").length;
    
    if (activeTab === "partial") {
      setPartialCounts({
        total: data.length,
        notViewed,
        viewed,
        deleted: partialCounts.deleted
      });
    } else {
      setMainCounts({
        total: data.length,
        notViewed,
        viewed,
        deleted: mainCounts.deleted
      });
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [activeTab]);

  // Export to CSV Function
  const exportToExcel = () => {
    try {
      if (filteredData.length === 0) {
        alert("No data to export!");
        return;
      }

      const exportData = filteredData.map(item => {
        const exportItem = { ...item };
        
        // Handle date fields
        if (exportItem.dob) exportItem.dob = formatDate(exportItem.dob);
        if (exportItem.startDate) exportItem.startDate = formatDate(exportItem.startDate);
        if (exportItem.createdAt) exportItem.createdAt = formatDate(exportItem.createdAt);
        if (exportItem.updatedAt) exportItem.updatedAt = formatDate(exportItem.updatedAt);
        
        // Handle boolean fields
        if (exportItem.agreement !== undefined) {
          exportItem.agreement = exportItem.agreement ? "Yes" : "No";
        }
        
        // Remove MongoDB internal fields and file data
        delete exportItem._id;
        delete exportItem.__v;
        delete exportItem.resume;
        delete exportItem.resumePath;
        
        return exportItem;
      });

      const headers = [...new Set(exportData.flatMap(item => Object.keys(item)))];
      
      let csvContent = "";
      csvContent += headers.map(header => `"${header}"`).join(",") + "\n";
      
      exportData.forEach(item => {
        const row = headers.map(header => {
          const value = item[header];
          if (value === null || value === undefined) return '""';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        });
        csvContent += row.join(",") + "\n";
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Internship_Registrations_${activeTab === 'partial' ? 'Partial' : 'Main'}_${timestamp}.csv`;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      alert(`Exported ${exportData.length} records to ${filename}`);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRegistrations();
    setEditRow(null);
    setExpandedRows(new Set());
    resetFilters();
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleFilter = () => {
    if (!filterValue && !statusFilter) {
      setFilteredData(registrations);
      updateCounts(registrations);
      return;
    }

    const filtered = registrations.filter((item) => {
      if (filterValue) {
        const fieldValue = item[filterField]?.toString().toLowerCase() || '';
        return fieldValue.includes(filterValue.toLowerCase());
      }

      if (statusFilter) {
        return item.status === statusFilter;
      }

      return true;
    });

    setFilteredData(filtered);
    updateCounts(filtered);
  };

  const resetFilters = () => {
    setFilterValue("");
    setStatusFilter("");
    setFilteredData(registrations);
    updateCounts(registrations);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      let url = "";
      if (activeTab === "partial") {
        url = `${import.meta.env.VITE_API_BASE_URL}/PartialIntern/partial-delete/${id}`;
      } else {
        url = `${import.meta.env.VITE_API_BASE_URL}/RegisterIntern/registration/${id}`;
      }
      
      await axios.delete(url);
      fetchRegistrations();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      let url = "";
      if (activeTab === "partial") {
        url = `${import.meta.env.VITE_API_BASE_URL}/PartialIntern/partial-update/${id}`;
      } else {
        url = `${import.meta.env.VITE_API_BASE_URL}/RegisterIntern/registration/${id}`;
      }
      
      await axios.put(url, updatedData);
      fetchRegistrations();
      setEditRow(null);
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed");
    }
  };

  const handleEdit = (id) => {
    setEditRow(id);
    const newExpandedRows = new Set(expandedRows);
    newExpandedRows.add(id);
    setExpandedRows(newExpandedRows);
  };

  const handleCancelEdit = () => {
    setEditRow(null);
  };

  // Safe resume check function with detailed logging
const checkResume = (reg) => {
  if (!reg) return false;
  
  console.log("🔍 FULL REGISTRATION DATA:", reg);
  console.log("🔍 Resume field specifically:", reg.resume);
  
  // Check all possible locations for resume data
  const hasResume = !!(reg.resume || reg.resumePath || reg.uploadDirectory);
  
  if (hasResume) {
    console.log("✅ Resume data found in:", Object.keys(reg).filter(key => 
      reg[key] && typeof reg[key] === 'object' && reg[key] !== null
    ));
  } else {
    console.log("❌ No resume data found");
  }
  
  return hasResume;
};

// Resume View Function
const viewResume = async (id, reg) => {
  try {
    console.log("📁 Full registration data for resume:", reg);
    
    if (!reg) {
      throw new Error("Registration data is undefined");
    }
    
    let filename = null;
    
    // Extract filename from resume data
    if (reg.resume && typeof reg.resume === 'object') {
      console.log("📄 Resume object:", reg.resume);
      
      // Try different possible filename fields
      filename = reg.resume.filename || 
                (reg.resume.path ? reg.resume.path.split('\\').pop() || reg.resume.path.split('/').pop() : null);
    }
    else if (reg.resumePath) {
      console.log("📄 Resume path:", reg.resumePath);
      filename = reg.resumePath.split('\\').pop() || reg.resumePath.split('/').pop();
    }
    
    console.log("📄 Extracted filename:", filename);
    
    if (!filename) {
      throw new Error("No resume filename found in registration data");
    }
    
    // Use the correct backend URL (port 3000)
    const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const url = `${backendBaseUrl}/upload_intern/${filename}`;
    
    console.log("🔗 Final URL:", url);
    
    window.open(url, '_blank');
    
  } catch (err) {
    console.error("❌ Resume view error:", err);
    alert(`Failed to open resume: ${err.message}\n\nCheck console for details.`);
  }
};

// Resume Download Function
const downloadResume = async (id, reg) => {
  try {
    console.log("📥 Registration data for download:", reg);
    
    if (!reg) {
      throw new Error("Registration data is undefined");
    }
    
    let filename = null;
    let originalName = null;
    
    // Extract filename
    if (reg.resume && typeof reg.resume === 'object') {
      if (reg.resume.filename) {
        filename = reg.resume.filename;
        originalName = reg.resume.originalName || filename;
      }
      else if (reg.resume.path) {
        const path = reg.resume.path;
        filename = path.split('\\').pop() || path.split('/').pop();
        originalName = reg.resume.originalName || filename;
      }
    }
    else if (reg.resumePath) {
      filename = reg.resumePath.split('\\').pop() || reg.resumePath.split('/').pop();
      originalName = reg.fullName ? `${reg.fullName.replace(/\s+/g, '_')}_resume.pdf` : 'resume.pdf';
    }
    
    if (!filename) {
      throw new Error("No resume filename found for download");
    }
    
    console.log("📄 Downloading:", originalName);
    
    // Use BACKEND URL
    const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const url = `${backendBaseUrl}/upload_intern/${filename}`;
    
    console.log("🔗 Download URL:", url);
    
    const response = await axios.get(url, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    console.log("✅ Download completed");
    
  } catch (err) {
    console.error("❌ Download error:", err);
    alert(`Failed to download resume: ${err.message}`);
  }
};

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
  };

  const toggleRowExpand = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

const renderField = (value, fieldName, isEditing, reg, field) => {
  // Add this condition for status field - always show dropdown
  if (fieldName === "status") {
    return (
      <select 
        value={value || "Not Viewed"}
        onChange={(e) => handleUpdate(reg._id, { ...reg, status: e.target.value })}
        className="px-2 py-1 rounded bg-gray-800 border border-yellow-500 text-yellow-500 text-xs"
      >
        <option value="Not Viewed">Not Viewed</option>
        <option value="Viewed">Viewed</option>
      </select>
    );
  }

  if (isEditing) {
    if (fieldName === "interestReason" || fieldName === "additionalComments" || 
        fieldName === "skills" || fieldName === "previousExperience" || fieldName === "expectations") {
      return (
        <textarea 
          defaultValue={value} 
          onChange={(e) => (reg[field] = e.target.value)}
          className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full min-h-[60px] resize-vertical"
          rows={2}
        />
      );
    }
    
    if (fieldName === "dob" || fieldName === "startDate") {
      return (
        <input 
          type="date" 
          defaultValue={value ? new Date(value).toISOString().split('T')[0] : ''}
          onChange={(e) => (reg[field] = e.target.value)}
          className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full"
        />
      );
    }
    
    if (fieldName === "agreement") {
      return (
        <select 
          defaultValue={value}
          onChange={(e) => (reg[field] = e.target.value === "true")}
          className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }
    
    if (fieldName === "totalCost" || fieldName === "amountPaid") {
      return (
        <input 
          type="number" 
          defaultValue={value} 
          onChange={(e) => (reg[field] = parseFloat(e.target.value))}
          className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full"
          step="0.01"
        />
      );
    }
    
    return (
      <input 
        type="text" 
        defaultValue={value} 
        onChange={(e) => (reg[field] = e.target.value)}
        className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full min-w-[120px]"
      />
    );
  }

  if (fieldName === "dob" || fieldName === "startDate" || fieldName === "createdAt" || fieldName === "updatedAt") {
    return formatDate(value);
  }

  if (fieldName === "interestReason" || fieldName === "additionalComments" || fieldName === "skills" || fieldName === "previousExperience") {
    const isExpanded = expandedRows.has(reg._id);
    return (
      <div className="cursor-pointer" onClick={() => toggleRowExpand(reg._id)}>
        <div className="flex items-center justify-between">
          <span className={isExpanded ? "whitespace-normal break-words" : "truncate block max-w-xs"}>
            {value || "No data"}
          </span>
          {isExpanded ? <ChevronUp size={16} className="text-yellow-500" /> : <ChevronDown size={16} className="text-yellow-500" />}
        </div>
      </div>
    );
  }

  if (fieldName === "agreement") {
    return value ? "Yes" : "No";
  }

  return <span className="whitespace-nowrap">{value || "-"}</span>;
};

  const getSerialNumber = (index) => index + 1;

  const currentCounts = activeTab === "partial" ? partialCounts : mainCounts;

  // Field configurations for each database
  const getTableFields = () => {
    const commonFields = [
      { key: "fullName", label: "Full Name", icon: <User size={14} /> },
      { key: "email", label: "Email", icon: <Mail size={14} /> },
      { key: "phone", label: "Phone", icon: <Phone size={14} /> },
      { key: "gender", label: "Gender" },
      { key: "city", label: "City" },
      { key: "dob", label: "DOB", icon: <Calendar size={14} /> },
      { key: "college", label: "College", icon: <Building size={14} /> },
      { key: "degree", label: "Degree", icon: <School size={14} /> },
      { key: "department", label: "Department" },
      { key: "year", label: "Year" },
      { key: "rollNumber", label: "Roll Number" },
    ];

    if (activeTab === "partial") {
      return [
        ...commonFields,
        { key: "domain", label: "Domain" },
        { key: "duration", label: "Duration" },
        { key: "internshipType", label: "Type" },
        { key: "startDate", label: "Start Date" },
        { key: "interestReason", label: "Interest Reason" },
        { key: "skills", label: "Skills" },
        { key: "accessPreference", label: "Access Pref" },
        { key: "additionalComments", label: "Comments" },
        { key: "heardFrom", label: "Heard From" },
        { key: "referralCode", label: "Referral Code" },
        { key: "yourReferralCode", label: "Your Referral" },
        { key: "agreement", label: "Agreement" },
        { key: "createdAt", label: "Created" },
        { key: "notes", label: "Notes" },
        { key: "totalCost", label: "Total Cost" },
        { key: "amountPaid", label: "Amount Paid" },
        { key: "status", label: "Status" },
      ];
    } else {
      return [
        ...commonFields,
        { key: "domain", label: "Domain" },
        { key: "duration", label: "Duration" },
        { key: "internshipType", label: "Type" },
        { key: "startDate", label: "Start Date" },
        { key: "interestReason", label: "Interest Reason" },
        { key: "skills", label: "Skills" },
        { key: "previousExperience", label: "Prev Experience" },
        { key: "expectations", label: "Expectations" },
        { key: "accessPreference", label: "Access Pref" },
        { key: "additionalComments", label: "Comments" },
        { key: "heardFrom", label: "Heard From" },
        { key: "referralCode", label: "Referral Entered" },
        { key: "yourReferralCode", label: "Your Referral" },
        { key: "agreement", label: "Agreement" },
        { key: "createdAt", label: "Created" },
        { key: "notes", label: "Notes" },
        { key: "totalCost", label: "Total Cost" },
        { key: "amountPaid", label: "Amount Paid" },
        { key: "status", label: "Status" },
      ];
    }
  };

  return (
    <div className="absolute top-31.5 left-66 right-0 bottom-0 p-6 overflow-auto z-10 bg-black/70 text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-yellow-500 mb-2">Internship Registration Admin Panel</h1>
        <p className="text-gray-400">Manage internship applications and partial registrations</p>
      </div>

      {/* Navbar */}
      <div className="flex gap-4 mb-6 border-b border-yellow-600 pb-2">
        <button
          onClick={() => setActiveTab("main")}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            activeTab === "main" ? "bg-yellow-600 text-black" : "bg-gray-800 text-white"
          }`}
        >
          <User size={16} />
          Main Database
        </button>
        <button
          onClick={() => setActiveTab("partial")}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            activeTab === "partial" ? "bg-yellow-600 text-black" : "bg-gray-800 text-white"
          }`}
        >
          <FileText size={16} />
          Partial Database
        </button>
      </div>

      {/* Top Bar with Counters and Actions */}
      <div className="flex justify-between items-center mb-4">
        {/* Left Side: Refresh, Filter & Export */}
        <div className="flex gap-2 items-center">
          <button 
            onClick={handleRefresh} 
            className="p-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 text-yellow-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setFilterOpen(!filterOpen)} 
            className="p-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-colors"
            title="Filter Data"
          >
            <Filter className="w-5 h-5 text-yellow-500" />
          </button>
          <button 
            onClick={exportToExcel} 
            className="p-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-colors" 
            title="Export to Excel"
          >
            <Download className="w-5 h-5 text-yellow-500" />
          </button>
        </div>

        {/* Right Side: Counters */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-yellow-500 font-semibold">Total:</span>
            <span className="text-white font-bold">{currentCounts.total}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-yellow-500">Not Viewed:</span>
            <span className="text-white font-bold">{currentCounts.notViewed}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-yellow-500">Viewed:</span>
            <span className="text-white font-bold">{currentCounts.viewed}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <Trash2 className="w-4 h-4 text-yellow-500" />
            <span className="text-white font-bold">{currentCounts.deleted}</span>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      {filterOpen && (
        <div className="flex gap-2 mb-4 items-center bg-gray-900 p-4 rounded-lg border border-gray-700">
          
          {/* Filter Field Dropdown */}
          <Listbox value={filterField} onChange={setFilterField}>
            <div className="relative w-48">
              <Listbox.Button className="w-full flex items-center justify-between rounded-lg bg-[#0f0f0f] border border-gray-700 px-3 py-2 text-white focus:ring-1 focus:ring-yellow-500">
                {getTableFields().find(f => f.key === filterField)?.label || "Select Field"}
              </Listbox.Button>
              <Listbox.Options className="absolute mt-1 w-full rounded-lg bg-[#0f0f0f] border border-gray-700 shadow-lg max-h-60 overflow-y-auto z-50">
                {getTableFields().map((field, idx) => (
                  <Listbox.Option
                    key={idx}
                    value={field.key}
                    className={({ active, selected }) =>
                      `cursor-pointer px-3 py-2 rounded-lg ${
                        active ? "bg-yellow-500 text-black" : "text-white"
                      } ${selected ? "bg-yellow-600 text-black" : ""}`
                    }
                  >
                    <div className="flex items-center gap-2">
                      {field.icon}
                      {field.label}
                    </div>
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>

          {/* Filter Value Input */}
          <input 
            type="text" 
            placeholder="Enter filter value..." 
            className="px-3 py-2 rounded-lg bg-[#0f0f0f] border border-gray-700 text-white flex-1 focus:ring-1 focus:ring-yellow-500"
            value={filterValue} 
            onChange={(e) => setFilterValue(e.target.value)} 
          />

          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#0f0f0f] border border-gray-700 text-white focus:ring-1 focus:ring-yellow-500"
          >
            <option value="">All Status</option>
            <option value="Not Viewed">Not Viewed</option>
            <option value="Viewed">Viewed</option>
          </select>

          {/* Apply Button */}
          <button 
            onClick={handleFilter} 
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            Apply
          </button>

          {/* Reset Button */}
          <button 
            onClick={resetFilters} 
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 border border-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* Table Content */}
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto rounded-lg border border-yellow-500 bg-black/20">
          <table className="min-w-full text-left text-white text-sm">
            <thead className="bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 border-b border-gray-700 text-yellow-500 font-semibold text-xs">S.No</th>
                {getTableFields().map(field => (
                  <th key={field.key} className="px-3 py-3 border-b border-gray-700 text-yellow-500 font-semibold text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {field.icon}
                      {field.label}
                    </div>
                  </th>
                ))}
                <th className="px-3 py-3 border-b border-gray-700 text-yellow-500 font-semibold text-xs">Resume</th>
                <th className="px-3 py-3 border-b border-gray-700 text-yellow-500 font-semibold text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((reg, idx) => {
                const isEditing = editRow === reg._id;
                const hasResume = reg.resume || reg.resumePath;
                
                return (
                  <tr key={reg._id} className="hover:bg-gray-800/70 transition-colors">
                    <td className="px-3 py-3 border-b border-gray-700 text-yellow-500 font-semibold text-xs">
                      {getSerialNumber(idx)}
                    </td>
                    
                    {getTableFields().map(field => (
                      <td key={field.key} className="px-3 py-3 border-b border-gray-700 text-xs">
                        {renderField(reg[field.key], field.key, isEditing, reg, field.key)}
                      </td>
                    ))}
                    
<td className="px-3 py-3 border-b border-gray-700 text-xs">
  {checkResume(reg) ? (
    <div className="flex gap-1">
      <button 
        onClick={() => viewResume(reg._id, reg)}
        className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-yellow-500 rounded hover:bg-gray-700 border border-gray-600 text-xs transition-colors"
        title="View Resume"
      >
        <Eye size={12} />
        View
      </button>
      <button 
        onClick={() => downloadResume(reg._id, reg)}
        className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-yellow-500 rounded hover:bg-gray-700 border border-gray-600 text-xs transition-colors"
        title="Download Resume"
      >
        <Download size={12} />
        Download
      </button>
    </div>
  ) : (
    <span className="text-gray-400 text-xs">No File</span>
  )}
</td>
                    
<td className="px-3 py-3 border-b border-gray-700 text-xs">
  <div className="flex gap-1">
    {isEditing ? (
      <>
        <button 
          onClick={() => handleUpdate(reg._id, reg)} 
          className="p-1 bg-gray-800 rounded hover:bg-gray-700 border border-gray-600 transition-colors" 
          title="Save"
        >
          <Save size={14} className="text-yellow-500" />
        </button>
        <button 
          onClick={handleCancelEdit} 
          className="p-1 bg-gray-800 rounded hover:bg-gray-700 border border-gray-600 transition-colors" 
          title="Cancel"
        >
          <X size={14} className="text-yellow-500" />
        </button>
      </>
    ) : (
      <button 
        onClick={() => handleEdit(reg._id)} 
        className="p-1 bg-gray-800 rounded hover:bg-gray-700 border border-gray-600 transition-colors" 
        title="Edit"
      >
        <Edit size={14} className="text-yellow-500" />
      </button>
    )}
    <button 
      onClick={() => handleDelete(reg._id)} 
      className="p-1 bg-gray-800 rounded hover:bg-gray-700 border border-gray-600 transition-colors" 
      title="Delete"
    >
      <Trash2 size={14} className="text-yellow-500" />
    </button>
  </div>
</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Status Bar */}
        <div className="mt-4 p-4 bg-gray-800/80 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-yellow-500 font-semibold text-sm">
              Showing {filteredData.length} records from {activeTab === "partial" ? "Partial" : "Main"} Internship Database
            </span>
            <div className="flex gap-2">
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-yellow-500 rounded hover:bg-gray-700 border border-gray-600 text-sm transition-colors"
              >
                <Download size={16} />
                Export to Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Internshipreg;