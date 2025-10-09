import React, { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw, Filter, ChevronDown, ChevronUp, Edit, Save, Trash2, X, Eye, Download } from "lucide-react";
import { Listbox } from "@headlessui/react";

function Ideaforge() {
  const [registrations, setRegistrations] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterField, setFilterField] = useState("name");
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Counters
  const [counts, setCounts] = useState({ 
    total: 0, 
    pending: 0, 
    approved: 0, 
    rejected: 0 
  });

  const fetchRegistrations = async () => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/Ideaforge/participants`;
      const res = await axios.get(url);
      const result = Array.isArray(res.data.participants) ? res.data.participants : [];
      setRegistrations(result);
      setFilteredData(result);
      updateCounts(result);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch IdeaForge registrations");
    }
  };

  const updateCounts = (data) => {
    const pending = data.filter(item => item.status === "pending").length;
    const approved = data.filter(item => item.status === "approved").length;
    const rejected = data.filter(item => item.status === "rejected").length;
    
    setCounts({
      total: data.length,
      pending,
      approved,
      rejected
    });
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Export to CSV/Excel Function
  const exportToExcel = () => {
    try {
      if (filteredData.length === 0) {
        alert("No data to export!");
        return;
      }

      // Prepare data for export
      const exportData = filteredData.map(item => {
        const exportItem = { ...item };
        
        // Handle date fields
        if (exportItem.finalDate) exportItem.finalDate = formatDate(exportItem.finalDate);
        if (exportItem.registrationDate) exportItem.registrationDate = formatDate(exportItem.registrationDate);
        if (exportItem.createdAt) exportItem.createdAt = formatDate(exportItem.createdAt);
        if (exportItem.updatedAt) exportItem.updatedAt = formatDate(exportItem.updatedAt);
        
        // Remove MongoDB internal fields
        delete exportItem._id;
        delete exportItem.__v;
        
        return exportItem;
      });

      // Get all unique keys from the data
      const headers = [...new Set(exportData.flatMap(item => Object.keys(item)))];
      
      // Create CSV content
      let csvContent = "";
      
      // Add headers
      csvContent += headers.map(header => `"${header}"`).join(",") + "\n";
      
      // Add data rows
      exportData.forEach(item => {
        const row = headers.map(header => {
          const value = item[header];
          // Handle values that might contain commas or quotes
          if (value === null || value === undefined) return '""';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        });
        csvContent += row.join(",") + "\n";
      });

      // Create and download file
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `IdeaForge_Registrations_${timestamp}.csv`;
      
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
      const url = `${import.meta.env.VITE_API_BASE_URL}/Ideaforge/participants/${id}`;
      await axios.delete(url);
      fetchRegistrations();
    } catch (err) {``
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/Ideaforge/participants/${id}`;
      await axios.put(url, updatedData);
      fetchRegistrations();
      setEditRow(null);
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed: " + (err.response?.data?.message || err.message));
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

  // Golden Listbox Dropdown Component
  const GoldenListbox = ({ value, onChange, options, className = "", buttonClassName = "" }) => (
    <Listbox value={value} onChange={onChange}>
      <div className={`relative ${className}`}>
        <Listbox.Button className={`w-full flex items-center justify-between rounded-lg bg-[#0f0f0f] border border-gray-700 px-3 py-2 text-white focus:ring-1 focus:ring-yellow-500 ${buttonClassName}`}>
          <span>{options.find(opt => opt.value === value)?.label || "Select..."}</span>
          <ChevronDown size={16} className="text-yellow-500" />
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 w-full rounded-lg bg-[#0f0f0f] border border-gray-700 shadow-lg max-h-60 overflow-y-auto z-50">
          {options.map((option) => (
            <Listbox.Option
              key={option.value}
              value={option.value}
              className={({ active, selected }) =>
                `cursor-pointer px-3 py-2 rounded-lg ${
                  active ? "bg-yellow-500 text-black" : "text-white"
                } ${selected ? "bg-yellow-600 text-black" : ""}`
              }
            >
              {option.label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );

  const renderField = (value, fieldName, isEditing, reg, field) => {
    if (isEditing) {
      if (fieldName === "ideaDescription") {
        return (
          <textarea 
            defaultValue={value} 
            onChange={(e) => (reg[field] = e.target.value)}
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full min-h-[60px] resize-vertical"
            rows={2}
          />
        );
      }
      
      if (fieldName === "finalDate" || fieldName === "registrationDate") {
        return (
          <input 
            type="date" 
            defaultValue={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => (reg[field] = e.target.value)}
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 w-full"
          />
        );
      }

      if (fieldName === "status" || fieldName === "year" || fieldName === "domain" || fieldName === "ideaType" || fieldName === "gotReferral") {
        const options = getFieldOptions(fieldName);
        return (
          <GoldenListbox
            value={value || ""}
            onChange={(newValue) => (reg[field] = newValue)}
            options={options}
            className="w-full"
            buttonClassName="px-2 py-1 text-xs"
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

    // Non-editing view - Status should always be editable with golden dropdown
    if (fieldName === "status") {
      const options = getFieldOptions("status");
      return (
        <GoldenListbox
          value={value || "pending"}
          onChange={(newValue) => handleUpdate(reg._id, { ...reg, status: newValue })}
          options={options}
          className="w-28"
          buttonClassName="px-2 py-1 text-xs"
        />
      );
    }

    if (fieldName === "finalDate" || fieldName === "registrationDate" || fieldName === "createdAt" || fieldName === "updatedAt") {
      return formatDate(value);
    }

    if (fieldName === "ideaDescription") {
      const isExpanded = expandedRows.has(reg._id);
      return (
        <div className="cursor-pointer" onClick={() => toggleRowExpand(reg._id)}>
          <div className="flex items-center justify-between">
            <span className={isExpanded ? "whitespace-normal break-words" : "truncate block max-w-xs"}>
              {value || "No description"}
            </span>
            {isExpanded ? <ChevronUp size={16} className="text-yellow-500" /> : <ChevronDown size={16} className="text-yellow-500" />}
          </div>
        </div>
      );
    }

    return <span className="whitespace-nowrap">{value || "-"}</span>;
  };

  const getFieldOptions = (fieldName) => {
    switch (fieldName) {
      case "year":
        return [
          { value: "1st Year", label: "1st Year" },
          { value: "2nd Year", label: "2nd Year" },
          { value: "3rd Year", label: "3rd Year" },
          { value: "4th Year", label: "4th Year" },
          { value: "Final Year", label: "Final Year" }
        ];
      case "domain":
        return [
          { value: "Web Development", label: "Web Development" },
          { value: "Mobile App Development", label: "Mobile App Development" },
          { value: "AI/ML", label: "AI/ML" },
          { value: "Data Science", label: "Data Science" },
          { value: "IoT", label: "IoT" },
          { value: "Cybersecurity", label: "Cybersecurity" },
          { value: "Blockchain", label: "Blockchain" },
          { value: "Cloud Computing", label: "Cloud Computing" },
          { value: "UI/UX Design", label: "UI/UX Design" },
          { value: "Other", label: "Other" }
        ];
      case "ideaType":
        return [
          { value: "existing", label: "Existing" },
          { value: "own", label: "Own Idea" }
        ];
      case "gotReferral":
        return [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" }
        ];
      case "status":
        return [
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" }
        ];
      default:
        return [];
    }
  };

  const getSerialNumber = (index) => index + 1;

  const tableFields = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "degree", label: "Degree" },
    { key: "department", label: "Department" },
    { key: "year", label: "Year" },
    { key: "domain", label: "Domain" },
    { key: "ideaType", label: "Idea Type" },
    { key: "ideaDescription", label: "Description" },
    { key: "finalDate", label: "Final Date" },
    { key: "gotReferral", label: "Got Referral" },
    { key: "referralCode", label: "Referral Code" },
    { key: "generatedReferralCode", label: "Generated Code" },
    { key: "registrationDate", label: "Registered" },
    { key: "status", label: "Status" }
  ];

  return (
    <div className="absolute top-31.5 left-66 right-0 bottom-0 p-6 overflow-auto z-10 bg-black/70 text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-yellow-500 mb-2">IdeaForge Admin Panel</h1>
        <p className="text-gray-400">Manage all IdeaForge participant registrations</p>
      </div>

      {/* Top Bar with Counters and Actions */}
      <div className="flex justify-between items-center mb-4">
        {/* Left Side: Refresh, Filter & Export */}
        <div className="flex gap-2 items-center">
          <button onClick={handleRefresh} className="p-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600">
            <RefreshCw className={`w-5 h-5 text-yellow-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setFilterOpen(!filterOpen)} className="p-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600">
            <Filter className="w-5 h-5 text-yellow-500" />
          </button>
          <button onClick={exportToExcel} className="p-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-600" title="Export to Excel">
            <Download className="w-5 h-5 text-yellow-500" />
          </button>
        </div>

        {/* Right Side: Counters */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-yellow-500 font-semibold">Total:</span>
            <span className="text-white font-bold">{counts.total}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-yellow-500">Pending:</span>
            <span className="text-white font-bold">{counts.pending}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-yellow-500">Approved:</span>
            <span className="text-white font-bold">{counts.approved}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded border border-gray-600">
            <span className="text-yellow-500">Rejected:</span>
            <span className="text-white font-bold">{counts.rejected}</span>
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
                {tableFields.find(f => f.key === filterField)?.label || "Select Field"}
              </Listbox.Button>
              <Listbox.Options className="absolute mt-1 w-full rounded-lg bg-[#0f0f0f] border border-gray-700 shadow-lg max-h-60 overflow-y-auto z-50">
                {tableFields.map((field, idx) => (
                  <Listbox.Option
                    key={idx}
                    value={field.key}
                    className={({ active, selected }) =>
                      `cursor-pointer px-3 py-2 rounded-lg ${
                        active ? "bg-yellow-500 text-black" : "text-white"
                      } ${selected ? "bg-yellow-600 text-black" : ""}`
                    }
                  >
                    {field.label}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>

          {/* Filter Value Input */}
          <input 
            type="text" 
            placeholder="Enter value" 
            className="px-3 py-2 rounded-lg bg-[#0f0f0f] border border-gray-700 text-white flex-1 focus:ring-1 focus:ring-yellow-500"
            value={filterValue} 
            onChange={(e) => setFilterValue(e.target.value)} 
          />

          {/* Status Filter with Golden Listbox */}
          <GoldenListbox
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" }
            ]}
            className="w-40"
          />

          {/* Apply Button */}
          <button 
            onClick={handleFilter} 
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-600"
          >
            Apply
          </button>

          {/* Reset Button */}
          <button 
            onClick={resetFilters} 
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 border border-gray-600"
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
                <th className="px-3 py-2 border-b border-gray-700 text-yellow-500 font-semibold text-xs">S.No</th>
                {tableFields.map(field => (
                  <th key={field.key} className="px-3 py-2 border-b border-gray-700 text-yellow-500 font-semibold text-xs whitespace-nowrap">
                    {field.label}
                  </th>
                ))}
                <th className="px-3 py-2 border-b border-gray-700 text-yellow-500 font-semibold text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((reg, idx) => {
                const isEditing = editRow === reg._id;
                
                return (
                  <tr key={reg._id} className="hover:bg-gray-800/70">
                    <td className="px-3 py-2 border-b border-gray-700 text-yellow-500 font-semibold text-xs">
                      {getSerialNumber(idx)}
                    </td>
                    
                    {tableFields.map(field => (
                      <td key={field.key} className="px-3 py-2 border-b border-gray-700 text-xs">
                        {renderField(reg[field.key], field.key, isEditing, reg, field.key)}
                      </td>
                    ))}
                    
                    <td className="px-3 py-2 border-b border-gray-700 text-xs">
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleUpdate(reg._id, reg)} className="p-1 bg-gray-800 rounded hover:bg-gray-700 border border-gray-600" title="Save">
                              <Save size={12} className="text-yellow-500" />
                            </button>
                            <button onClick={handleCancelEdit} className="p-1 bg-gray-800 rounded hover:bg-gray-700 border border-gray-600" title="Cancel">
                              <X size={12} className="text-yellow-500" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleEdit(reg._id)} className="p-1 bg-gray-800 rounded hover:bg-gray-700 border border-gray-600" title="Edit">
                            <Edit size={12} className="text-yellow-500" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(reg._id)} className="p-1 bg-gray-800 rounded hover:bg-gray-700 border border-gray-600" title="Delete">
                          <Trash2 size={12} className="text-yellow-500" />
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
        <div className="mt-4 p-3 bg-gray-800/80 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-yellow-500 font-semibold text-sm">
              Showing {filteredData.length} IdeaForge registrations
            </span>
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-yellow-500 rounded hover:bg-gray-700 border border-gray-600 text-sm"
            >
              <Download size={16} />
              Export All to Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ideaforge;