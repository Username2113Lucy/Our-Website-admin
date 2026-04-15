import React, { useState, useRef, useEffect } from "react";

// Add these missing imports that are being used in the code
import axios from "axios"; // For API calls

import {
    FileText,
    FileSpreadsheet,
    Printer,
    Download,
    User,
    Phone,
    Building,
    School,
    GraduationCap,
    BookOpen,
    DollarSign,
    Signature,
    CreditCard,
    Save,
    RefreshCw
} from "lucide-react";

function Billing() {
    const [activeTab, setActiveTab] = useState("manual");
    const [billData, setBillData] = useState({
        billNo: "",
        date: new Date().toISOString().split('T')[0],
        studentName: "",
        contact: "",
        collegeName: "",
        degree: "",
        department: "",
        items: [
            { id: 1, title: "Course Registration", amount: "", totalCost: "" }
        ],
        totalAmount: "0.00",
        amountPaid: "",
        balanceDue: "0.00",
        statement: "Registration fee is non-refundable"
    });

    const billRef = useRef();

    // Generate a unique bill number
    const generateBillNo = () => {
        const prefix = "BILL";
        const timestamp = Date.now().toString().slice(-6);
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${randomNum}`;
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBillData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle item changes
    const handleItemChange = (id, field, value) => {
        setBillData(prev => {
            const updatedItems = prev.items.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };

                    // Calculate total cost if both amount and quantity are provided
                    if (field === 'quantity' || field === 'amount') {
                        const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(item.quantity) || 1;
                        const amount = field === 'amount' ? parseFloat(value) || 0 : parseFloat(item.amount) || 0;
                        updatedItem.totalCost = (quantity * amount).toFixed(2);
                    }

                    return updatedItem;
                }
                return item;
            });

            // Calculate totals
            const totalAmount = updatedItems.reduce((sum, item) => {
                return sum + (parseFloat(item.totalCost) || 0);
            }, 0);

            const amountPaid = parseFloat(prev.amountPaid) || 0;
            const balance = (totalAmount - amountPaid).toFixed(2);

            return {
                ...prev,
                items: updatedItems,
                totalAmount: totalAmount.toFixed(2),
                balance: balance
            };
        });
    };

    // Add new item row
    const addItem = () => {
        setBillData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    id: prev.items.length + 1,
                    title: "",
                    quantity: "1",
                    amount: "",
                    totalCost: ""
                }
            ]
        }));
    };

    // Remove item row
    const removeItem = (id) => {
        if (billData.items.length <= 1) return;
        setBillData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    // Reset form
    const resetForm = () => {
        setBillData({
            billNo: generateBillNo(),
            date: new Date().toISOString().split('T')[0],
            studentName: "",
            contact: "",
            collegeName: "",
            degree: "",
            department: "",
            items: [
                { id: 1, title: "Course Registration", quantity: "1", amount: "", totalCost: "" }
            ],
            totalAmount: "0.00",
            amountPaid: "",
            balance: "0.00",
            statement: "Registration fee is non-refundable"
        });
    };

    // Print bill
    const printBill = () => {
        window.print();
    };

    // Download bill as PDF
    const downloadBill = () => {
        alert("PDF generation feature would be implemented here with a library like jsPDF");
        // Implementation would use jsPDF or similar library
    };

    // Save bill
    const saveBill = () => {
        // Here you would typically save to database
        console.log("Saving bill data:", billData);
        alert("Bill saved successfully!");
    };

    // Update your generateBill function to save to database
    const generateBill = async () => {
        if (!billData.studentName || !billData.contact) {
            alert("Please fill in student name and contact details");
            return;
        }

        // Auto-generate bill number if empty
        if (!billData.billNo) {
            setBillData(prev => ({ ...prev, billNo: generateBillNo() }));
        }

        // Save to database first
        await saveBillToDatabase();

        // Then print
        printBill();
    };

    // Add these state variables after useState declarations
    const [allBills, setAllBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    // Update your saveBill function to include PDF generation
    const saveBillToDatabase = async () => {
        try {
            if (!billData.studentName || !billData.contact) {
                alert("Please fill in student name and contact details");
                return;
            }

            setLoading(true);

            // Prepare data for backend
            const billToSave = {
                ...billData,
                totalAmount: parseFloat(billData.totalAmount) || 0,
                amountPaid: parseFloat(billData.amountPaid) || 0,
                balanceDue: parseFloat(billData.balanceDue) || 0,
                items: billData.items.map(item => ({
                    ...item,
                    quantity: parseInt(item.quantity) || 1,
                    amount: parseFloat(item.amount) || 0,
                    totalCost: parseFloat(item.totalCost) || 0
                }))
            };

            // Auto-generate bill number if empty
            if (!billToSave.billNo) {
                billToSave.billNo = generateBillNo();
            }

            // Use the NEW endpoint that creates AND downloads PDF
            const response = await axios.post(
                `${API_BASE_URL}/billing/create-and-download`,
                billToSave,
                { responseType: 'blob' }
            );

            // Create and download the PDF blob
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Bill_${billToSave.billNo}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            alert("Bill saved and PDF downloaded successfully!");
            resetForm();

        } catch (error) {
            console.error("Error saving bill:", error);
            alert(error.response?.data?.message || "Failed to save bill");
        } finally {
            setLoading(false);
        }
    };

    const generatePDFDirectly = async () => {
        try {
            if (!billData.studentName || !billData.contact) {
                alert("Please fill in student name and contact details");
                return;
            }

            // Prepare data for PDF generation
            const billForPDF = {
                ...billData,
                totalAmount: parseFloat(billData.totalAmount) || 0,
                amountPaid: parseFloat(billData.amountPaid) || 0,
                balanceDue: parseFloat(billData.balanceDue) || 0,
                items: billData.items.map(item => ({
                    ...item,
                    quantity: parseInt(item.quantity) || 1,
                    amount: parseFloat(item.amount) || 0,
                    totalCost: parseFloat(item.totalCost) || 0
                }))
            };

            // Auto-generate bill number if empty
            if (!billForPDF.billNo) {
                billForPDF.billNo = generateBillNo();
            }

            // Use the direct PDF generation endpoint
            const response = await axios.post(
                `${API_BASE_URL}/billing/generate-pdf`,
                billForPDF,
                { responseType: 'blob' }
            );

            // Create and download the PDF
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Bill_${billForPDF.billNo}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF");
        }
    };

    // Add this function to your Billing component
    const generatePDF = async (billId) => {
        try {
            // Open PDF in new tab/download
            window.open(`${API_BASE_URL}/billing/generate-pdf/${billId}`, '_blank');

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF");
        }
    };


    const fetchAllBills = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/billing/all`);
            if (response.data.success) {
                setAllBills(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching bills:", error);
        } finally {
            setLoading(false);
        }
    };

    // Add this useEffect hook after all state declarations
    useEffect(() => {
        if (activeTab === "database") {
            fetchAllBills();
        }
    }, [activeTab]);



    return (
        <div
            className="absolute top-31.5 left-66 right-0 bottom-0 p-6 overflow-auto z-10 text-white"
            style={{
                backgroundImage: "url('/image/billing.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backgroundBlendMode: 'overlay'
            }}
        >
            {/* Header */}
            <div className="mb-6 bg-black/60 p-4 ">
                <h1 className="text-2xl font-bold text-yellow-500 mb-2 flex items-center gap-2">
                    {/* <FileText className="w-8 h-8" /> */}
                    Billing System
                </h1>
                <p className="text-gray-300">Generate and manage student bills</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-yellow-600 pb-2">
                <button
                    onClick={() => setActiveTab("manual")}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${activeTab === "manual"
                        ? "bg-yellow-600 text-black font-semibold"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                        } transition-colors`}
                >
                    <FileText size={16} />
                    Manual Billing
                </button>
                <button
                    onClick={() => setActiveTab("database")}
                    className={`px-4 py-2 rounded flex items-center gap-2 ${activeTab === "database"
                        ? "bg-yellow-600 text-black font-semibold"
                        : "bg-gray-800 text-white hover:bg-gray-700"
                        } transition-colors`}
                >
                    <FileSpreadsheet size={16} />
                    Database Billing
                </button>
            </div>

            {/* Manual Billing Form */}
            {activeTab === "manual" && (
                <div className="space-y-6">


                    {/* Bill Header Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/60 p-4 rounded-lg border border-gray-700">
                            <label className="block text-yellow-500 text-sm font-semibold mb-2">
                                Bill Number
                            </label>
                            <input
                                type="text"
                                name="billNo"
                                value={billData.billNo}
                                onChange={handleInputChange}
                                placeholder="Auto-generated"
                                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                        </div>

                        <div className="bg-black/60 p-4 rounded-lg border border-gray-700">
                            <label className="block text-yellow-500 text-sm font-semibold mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={billData.date}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                        </div>
                    </div>

                    {/* Student Information */}
                    <div className="bg-black/60 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-yellow-500 mb-4 flex items-center gap-2">
                            <User size={20} />
                            Student Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm mb-2">Student Name *</label>
                                <input
                                    type="text"
                                    name="studentName"
                                    value={billData.studentName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="Enter student name"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm mb-2">Contact Number *</label>
                                <input
                                    type="tel"
                                    name="contact"
                                    value={billData.contact}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="Enter contact number"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm mb-2">College Name</label>
                                <input
                                    type="text"
                                    name="collegeName"
                                    value={billData.collegeName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="Enter college name"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm mb-2">Degree</label>
                                <select
                                    name="degree"
                                    value={billData.degree}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                                >
                                    <option value="">Select Degree</option>
                                    <option value="B.E">B.E</option>
                                    <option value="B.Tech">B.Tech</option>
                                    <option value="M.E">M.E</option>
                                    <option value="M.Tech">M.Tech</option>
                                    <option value="B.Sc">B.Sc</option>
                                    <option value="M.Sc">M.Sc</option>
                                    <option value="B.Com">B.Com</option>
                                    <option value="M.Com">M.Com</option>
                                    <option value="BBA">BBA</option>
                                    <option value="MBA">MBA</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm mb-2">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={billData.department}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="Enter department"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bill Items Table */}
                    <div className="bg-black/60 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-yellow-500 flex items-center gap-2">
                                <BookOpen size={20} />
                                Bill Items
                            </h3>
                            <button
                                onClick={addItem}
                                className="px-3 py-1 bg-yellow-500 text-black text-sm rounded hover:bg-yellow-600 transition-colors"
                            >
                                + Add Item
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-3 py-2 border-b border-gray-700 text-yellow-500 text-sm">S.No</th>
                                        <th className="px-3 py-2 border-b border-gray-700 text-yellow-500 text-sm">Title / Description</th>
                                        <th className="px-3 py-2 border-b border-gray-700 text-yellow-500 text-sm">Quantity</th>
                                        <th className="px-3 py-2 border-b border-gray-700 text-yellow-500 text-sm">Amount (₹)</th>
                                        <th className="px-3 py-2 border-b border-gray-700 text-yellow-500 text-sm">Total Cost (₹)</th>
                                        <th className="px-3 py-2 border-b border-gray-700 text-yellow-500 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billData.items.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-800/50">
                                            <td className="px-3 py-2 border-b border-gray-700 text-gray-300">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2 border-b border-gray-700">
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                                                    className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white text-sm"
                                                    placeholder="Item description"
                                                />
                                            </td>
                                            <td className="px-3 py-2 border-b border-gray-700">
                                                <input
                                                    type="number"
                                                    value={item.quantity || "1"}
                                                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                    className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white text-sm"
                                                    min="1"
                                                    step="1"
                                                />
                                            </td>
                                            <td className="px-3 py-2 border-b border-gray-700">
                                                <input
                                                    type="number"
                                                    value={item.amount}
                                                    onChange={(e) => handleItemChange(item.id, 'amount', e.target.value)}
                                                    className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white text-sm"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="px-3 py-2 border-b border-gray-700 text-yellow-500 font-semibold">
                                                ₹{item.totalCost || "0.00"}
                                            </td>
                                            <td className="px-3 py-2 border-b border-gray-700">
                                                {billData.items.length > 1 && (
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded hover:bg-red-600/30 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-black/60 p-4 rounded-lg border border-gray-700">
                            <label className="block text-yellow-500 text-sm font-semibold mb-2">
                                Total Amount (₹)
                            </label>
                            <div className="text-2xl font-bold text-yellow-500">
                                ₹{billData.totalAmount}
                            </div>
                        </div>

                        <div className="bg-black/60 p-4 rounded-lg border border-gray-700">
                            <label className="block text-yellow-500 text-sm font-semibold mb-2">
                                Amount Paid (₹)
                            </label>
                            <input
                                type="number"
                                name="amountPaid"
                                value={billData.amountPaid}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setBillData(prev => ({
                                        ...prev,
                                        amountPaid: value,
                                        balance: (parseFloat(prev.totalAmount) - parseFloat(value || 0)).toFixed(2)
                                    }));
                                }}
                                className="w-full px-3 py-2 text-2xl font-bold text-green-500 rounded bg-gray-800 border border-gray-600 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>

                        <div className="bg-black/60 p-4 rounded-lg border border-gray-700">
                            <label className="block text-yellow-500 text-sm font-semibold mb-2">
                                Balance Due (₹)
                            </label>
                            <div className={`text-2xl font-bold ${parseFloat(billData.balance) > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                ₹{billData.balance}
                            </div>
                        </div>
                    </div>



                    {/* Generate Button */}
<div className="flex justify-center gap-4">
  <button
    onClick={generatePDFDirectly}  // Use this for PDF only
    className="px-8 py-3 bg-yellow-500 text-black text-lg font-bold rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-3 shadow-lg"
  >
    <Download size={24} />
    GENERATE PDF ONLY
  </button>
  
  <button
    onClick={saveBillToDatabase}  // This saves AND downloads PDF
    className="px-8 py-3 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3 shadow-lg"
  >
    <Save size={24} />
    SAVE & DOWNLOAD PDF
  </button>
</div>
                </div>
            )}

            {/* Database Billing Tab */}
            {activeTab === "database" && (
                <div className="bg-black/60 p-6 rounded-lg border border-gray-700">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-yellow-500 mb-4 flex items-center gap-2">
                            <FileSpreadsheet size={24} />
                            All Generated Bills
                        </h3>

                        {/* Add table for displaying bills */}
                        <div className="overflow-x-auto rounded-lg border border-gray-700">
                            <table className="w-full text-left text-white text-sm">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-gray-700 text-yellow-500">Bill No</th>
                                        <th className="px-4 py-3 border-b border-gray-700 text-yellow-500">Date</th>
                                        <th className="px-4 py-3 border-b border-gray-700 text-yellow-500">Student</th>
                                        <th className="px-4 py-3 border-b border-gray-700 text-yellow-500">College</th>
                                        <th className="px-4 py-3 border-b border-gray-700 text-yellow-500">Total (₹)</th>
                                        <th className="px-4 py-3 border-b border-gray-700 text-yellow-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                                                Loading bills...
                                            </td>
                                        </tr>
                                    ) : allBills.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                                                No bills found
                                            </td>
                                        </tr>
                                    ) : (
                                        allBills.map((bill) => (
                                            <tr key={bill._id} className="hover:bg-gray-800/50 border-b border-gray-700">
                                                <td className="px-4 py-3 font-mono text-yellow-500">{bill.billNo}</td>
                                                <td className="px-4 py-3">{new Date(bill.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold">{bill.studentName}</div>
                                                    <div className="text-xs text-gray-400">{bill.contact}</div>
                                                </td>
                                                <td className="px-4 py-3">{bill.collegeName}</td>
                                                <td className="px-4 py-3 font-semibold text-yellow-500">₹{bill.totalAmount?.toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <button className="px-3 py-1 bg-yellow-500 text-black text-sm rounded hover:bg-yellow-600">
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Billing;