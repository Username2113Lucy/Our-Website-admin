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
  Building,
  Briefcase,
  DollarSign,
  Clock,
  MapPin
} from "lucide-react";
import { Listbox } from "@headlessui/react";

function Careersreg() {
  const [registrations, setRegistrations] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterField, setFilterField] = useState("fullName");
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Counters
  const [counts, setCounts] = useState({ 
    total: 0, 
    new: 0, 
    reviewed: 0, 
    interview: 0, 
    rejected: 0, 
    hired: 0 
  });

  const fetchRegistrations = async () => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/RegisterCareer/applications`;
      const res = await axios.get(url);
      const result = Array.isArray(res.data.data) ? res.data.data : [];
      setRegistrations(result);
      setFilteredData(result);
      updateCounts(result);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch career applications");
    }
  };

  const updateCounts = (data) => {
    const newCount = data.filter(item => item.status === "New").length;
    const reviewedCount = data.filter(item => item.status === "Reviewed").length;
    const interviewCount = data.filter(item => item.status === "Interview").length;
    const rejectedCount = data.filter(item => item.status === "Rejected").length;
    const hiredCount = data.filter(item => item.status === "Hired").length;
    
    setCounts({
      total: data.length,
      new: newCount,
      reviewed: reviewedCount,
      interview: interviewCount,
      rejected: rejectedCount,
      hired: hiredCount
    });
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

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
        if (exportItem.createdAt) exportItem.createdAt = formatDate(exportItem.createdAt);
        if (exportItem.updatedAt) exportItem.updatedAt = formatDate(exportItem.updatedAt);
        if (exportItem.interviewDate) exportItem.interviewDate = formatDate(exportItem.interviewDate);
        
        // Format currency fields
        if (exportItem.currentCTC) exportItem.currentCTC = `₹${exportItem.currentCTC}`;
        if (exportItem.expectedCTC) exportItem.expectedCTC = `₹${exportItem.expectedCTC}`;
        
        // Remove MongoDB internal fields and file data
        delete exportItem._id;
        delete exportItem.__v;
        delete exportItem.resume;
        delete exportItem.resumePath;
        delete exportItem.uploadDirectory;
        
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
      const filename = `Career_Applications_${timestamp}.csv`;
      
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
    if (!filterValue && !statusFilter && !experienceFilter) {
      setFilteredData(registrations);
      updateCounts(registrations);
      return;
    }

    const filtered = registrations.filter((item) => {
      let matches = true;

      if (filterValue) {
        const fieldValue = item[filterField]?.toString().toLowerCase() || '';
        matches = matches && fieldValue.includes(filterValue.toLowerCase());
      }

      if (statusFilter) {
        matches = matches && item.status === statusFilter;
      }

      if (experienceFilter) {
        matches = matches && item.experienceType === experienceFilter;
      }

      return matches;
    });

    setFilteredData(filtered);
    updateCounts(filtered);
  };

  const resetFilters = () => {
    setFilterValue("");
    setStatusFilter("");
    setExperienceFilter("");
    setFilteredData(registrations);
    updateCounts(registrations);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/RegisterCareer/applications/${id}`;
      await axios.delete(url);
      fetchRegistrations();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/RegisterCareer/applications/${id}`;
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

  // Resume View Function
  const viewResume = async (reg) => {
    try {
      if (!reg) {
        throw new Error("Registration data is undefined");
      }
      
      let filename = reg.resume || reg.resumePath;
      
      if (!filename) {
        throw new Error("No resume filename found");
      }
      
      // Extract just the filename if it's a path
      if (filename.includes('/') || filename.includes('\\')) {
        filename = filename.split('/').pop() || filename.split('\\').pop();
      }
      
      const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const url = `${backendBaseUrl}/upload_careers/${filename}`;
      
      console.log("🔗 Resume URL:", url);
      window.open(url, '_blank');
      
    } catch (err) {
      console.error("❌ Resume view error:", err);
      alert(`Failed to open resume: ${err.message}`);
    }
  };

  // Resume Download Function
  const downloadResume = async (reg) => {
    try {
      if (!reg) {
        throw new Error("Registration data is undefined");
      }
      
      let filename = reg.resume || reg.resumePath;
      
      if (!filename) {
        throw new Error("No resume filename found for download");
      }
      
      // Extract just the filename if it's a path
      if (filename.includes('/') || filename.includes('\\')) {
        filename = filename.split('/').pop() || filename.split('\\').pop();
      }
      
      const originalName = reg.fullName ? `${reg.fullName.replace(/\s+/g, '_')}_resume.pdf` : 'resume.pdf';
      
      const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const url = `${backendBaseUrl}/upload_careers/${filename}`;
      
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
    // Status field - always show dropdown
    if (fieldName === "status") {
      return (
        <select 
          value={value || "New"}
          onChange={(e) => handleUpdate(reg._id, { ...reg, status: e.target.value })}
          className="px-2 py-1 rounded bg-gray-800 border border-yellow-500 text-yellow-500 text-xs"
        >
          <option value="New">New</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Interview">Interview</option>
          <option value="Rejected">Rejected</option>
          <option value="Hired">Hired</option>
        </select>
      );
    }

    // Rating field
    if (fieldName === "rating") {
      return (
        <select 
          value={value || 0}
          onChange={(e) => handleUpdate(reg._id, { ...reg, rating: parseInt(e.target.value) })}
          className="px-2 py-1 rounded bg-gray-800 border border-yellow-500 text-yellow-500 text-xs"
        >
          <option value={0}>0 - No Rating</option>
          <option value={1}>1 - Poor</option>
          <option value={2}>2 - Fair</option>
          <option value={3}>3 - Good</option>
          <option value={4}>4 - Very Good</option>
          <option value={5}>5 - Excellent</option>
        </select>
      );
    }

    if (isEditing) {
      if (fieldName === "interestReason" || fieldName === "notes") {
        return (
          <textarea 
            defaultValue={value} 
            onChange={(e) => (reg[field] = e.target.value)}
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full min-h-[60px] resize-vertical"
            rows={2}
          />
        );
      }
      
      if (fieldName === "interviewDate") {
        return (
          <input 
            type="date" 
            defaultValue={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => (reg[field] = e.target.value)}
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full"
          />
        );
      }
      
      if (fieldName === "currentCTC" || fieldName === "expectedCTC") {
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
      
      if (fieldName === "experienceType") {
        return (
          <select 
            defaultValue={value}
            onChange={(e) => (reg[field] = e.target.value)}
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full"
          >
            <option value="fresher">Fresher</option>
            <option value="experienced">Experienced</option>
          </select>
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

    if (fieldName === "createdAt" || fieldName === "updatedAt" || fieldName === "interviewDate") {
      return formatDate(value);
    }

    if (fieldName === "interestReason" || fieldName === "notes") {
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

    if ((fieldName === "currentCTC" || fieldName === "expectedCTC") && value) {
      return `₹${value}`;
    }

    if (fieldName === "rating" && value) {
      return `${value}/5 ⭐`;
    }

    return <span className="whitespace-nowrap">{value || "-"}</span>;
  };

  const getSerialNumber = (index) => index + 1;

  // Field configurations for career database
  const getTableFields = () => {
    return [
      { key: "fullName", label: "Full Name", icon: <User size={14} /> },
      { key: "email", label: "Email", icon: <Mail size={14} /> },
      { key: "phone", label: "Phone", icon: <Phone size={14} /> },
      { key: "city", label: "City", icon: <MapPin size={14} /> },
      { key: "gender", label: "Gender" },
      { key: "position", label: "Position", icon: <Briefcase size={14} /> },
      { key: "experienceType", label: "Experience Type" },
      { key: "currentCompany", label: "Current Company", icon: <Building size={14} /> },
      { key: "currentDesignation", label: "Current Designation" },
      { key: "experience", label: "Experience" },
      { key: "currentCTC", label: "Current CTC", icon: <DollarSign size={14} /> },
      { key: "expectedCTC", label: "Expected CTC", icon: <DollarSign size={14} /> },
      { key: "noticePeriod", label: "Notice Period", icon: <Clock size={14} /> },
      { key: "highestQualification", label: "Highest Qualification", icon: <School size={14} /> },
      { key: "degree", label: "Degree" },
      { key: "domain", label: "Domain" },
      { key: "heardFrom", label: "Heard From" },
      { key: "interestReason", label: "Interest Reason" },
      { key: "createdAt", label: "Applied On", icon: <Calendar size={14} /> },
      { key: "status", label: "Status" },
      { key: "rating", label: "Rating" },
      { key: "notes", label: "Notes" },
      { key: "interviewDate", label: "Interview Date" },
    ];
  };

  const hasResume = (reg) => {
    return !!(reg.resume || reg.resumePath);
  };

  return (
    <div className="absolute top-31.5 left-66 right-0 bottom-0 p-6 overflow-auto z-10 bg-black/70 text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-yellow-500 mb-2">Career Applications Admin Panel</h1>
        <p className="text-gray-400">Manage job applications and candidate tracking</p>
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
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-yellow-500 font-semibold">Total:</span>
            <span className="text-white font-bold">{counts.total}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-blue-400">New:</span>
            <span className="text-white font-bold">{counts.new}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-yellow-500">Reviewed:</span>
            <span className="text-white font-bold">{counts.reviewed}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-orange-400">Interview:</span>
            <span className="text-white font-bold">{counts.interview}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-red-400">Rejected:</span>
            <span className="text-white font-bold">{counts.rejected}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-green-400">Hired:</span>
            <span className="text-white font-bold">{counts.hired}</span>
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
            <option value="New">New</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>

          {/* Experience Filter */}
          <select 
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#0f0f0f] border border-gray-700 text-white focus:ring-1 focus:ring-yellow-500"
          >
            <option value="">All Experience</option>
            <option value="fresher">Fresher</option>
            <option value="experienced">Experienced</option>
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
                      {hasResume(reg) ? (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => viewResume(reg)}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-yellow-500 rounded hover:bg-gray-700 border border-gray-600 text-xs transition-colors"
                            title="View Resume"
                          >
                            <Eye size={12} />
                            View
                          </button>
                          <button 
                            onClick={() => downloadResume(reg)}
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
              Showing {filteredData.length} career applications
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

export default Careersreg;