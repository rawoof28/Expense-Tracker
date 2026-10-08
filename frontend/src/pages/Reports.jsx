import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import "./Reports.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function Reports() {
  const [expenses, setExpenses] = useState([]);
  
  // Applied filter state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Dropdown filter states
  const [filterType, setFilterType] = useState("monthly"); // monthly, yearly, custom
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      if (!user?.id) return;
      const res = await axios.get(`http://localhost:5000/expenses/${user.id}`);
      setExpenses(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleReset = () => {
    setFilterType("custom");
    setSelectedMonth("");
    setSelectedYear("");
    setFromDate("");
    setToDate("");
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 10}, (_, i) => currentYear - 5 + i);

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setSelectedMonth("");
    setSelectedYear("");
    setFromDate("");
    setToDate("");
  };

  const handleMonthChange = (e) => {
    const m = e.target.value;
    setSelectedMonth(m);
    if (filterType === 'monthly') {
      updateDateRangeFromDropdowns(m, selectedYear);
    }
  };

  const handleYearChange = (e) => {
    const y = e.target.value;
    setSelectedYear(y);
    if (filterType === 'monthly' || filterType === 'yearly') {
      updateDateRangeFromDropdowns(filterType === 'monthly' ? selectedMonth : "", y);
    }
  };

  const updateDateRangeFromDropdowns = (m, y) => {
    if (!y && (m || filterType === 'yearly')) {
      y = new Date().getFullYear().toString();
      setSelectedYear(y);
    }
    if (m !== "" && y !== "") {
      const firstDay = new Date(y, m, 1).toISOString().split('T')[0];
      const lastDay = new Date(y, parseInt(m) + 1, 0).toISOString().split('T')[0];
      setFromDate(firstDay);
      setToDate(lastDay);
    } else if (y !== "" && m === "") {
      const firstDay = new Date(y, 0, 1).toISOString().split('T')[0];
      const lastDay = new Date(y, 11, 31).toISOString().split('T')[0];
      setFromDate(firstDay);
      setToDate(lastDay);
    } else {
      setFromDate("");
      setToDate("");
    }
  };

  // ---------------- SAFE FILTER ----------------
  const filteredExpenses = expenses.filter((e) => {
    if (!e.date) return false;

    const expenseDateStr = e.date.split("T")[0];

    if (fromDate && expenseDateStr < fromDate) {
      return false;
    }

    if (toDate && expenseDateStr > toDate) {
      return false;
    }

    return true;
  });

  // ---------------- TOTALS ----------------
  const totalSpent = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  const totalTransactions = filteredExpenses.length;

  // ---------------- CATEGORY ----------------
  const categoryTotals = {};

  filteredExpenses.forEach((e) => {
    if (!e.category) return;
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + Number(e.amount || 0);
  });

  const topCategory =
    Object.keys(categoryTotals).length > 0
      ? Object.keys(categoryTotals).reduce((a, b) =>
        categoryTotals[a] > categoryTotals[b] ? a : b
      )
      : "-";

  // ---------------- AVG PER DAY ----------------
  // Calculate average spent per day based on unique dates in the filtered expenses
  const uniqueDates = new Set(filteredExpenses.map((e) => e.date?.split("T")[0]).filter(Boolean));
  const days = uniqueDates.size > 0 ? uniqueDates.size : 1;
  const avgPerDay = (totalSpent / days).toFixed(0);

  // ---------------- PIE DATA ----------------
  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#6366f1", "#f59e0b", "#10b981",
          "#ef4444", "#3b82f6", "#8b5cf6",
        ],
      },
    ],
  };

  // ---------------- BAR DATA (MONTHLY TREND) ----------------
  const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trendData = {};
  shortMonths.forEach(m => trendData[m] = 0);

  filteredExpenses.forEach((e) => {
    if (!e.date) return;
    const parts = e.date.split("T")[0].split("-");
    if (parts.length >= 2) {
      const monthIndex = parseInt(parts[1], 10) - 1;
      const m = shortMonths[monthIndex];
      if (m) {
        trendData[m] += Number(e.amount || 0);
      }
    }
  });

  const barData = {
    labels: shortMonths,
    datasets: [
      {
        label: "Expenses",
        data: shortMonths.map(m => trendData[m]),
        backgroundColor: "#6366f1",
      },
    ],
  };

  let periodLabel = "All Time";
  if (fromDate || toDate) {
    periodLabel = `${fromDate || "Start"} to ${toDate || "End"}`;
  }

  // report download handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // ---- Title ----
    doc.setFontSize(18);
    doc.text("Expense Report", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Period: ${periodLabel}`, 14, 27);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);

    // ---- Summary section ----
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Summary", 14, 42);

    autoTable(doc, {
      startY: 46,
      theme: "plain",
      styles: { fontSize: 10 },
      body: [
        ["Total Spent", `Rs. ${totalSpent}`],
        ["Transactions", `${totalTransactions}`],
        ["Avg/Day", `Rs. ${avgPerDay}`],
        ["Top Category", `${topCategory}`],
      ],
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    });

    // ---- Category breakdown ----
    let nextY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Category Breakdown", 14, nextY);

    autoTable(doc, {
      startY: nextY + 4,
      head: [["Category", "Amount", "Percentage"]],
      body: Object.entries(categoryTotals).map(([cat, amt]) => {
        const percentage = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(0) : 0;
        return [cat, `Rs. ${amt}`, `${percentage}%`];
      }),
      headStyles: { fillColor: [99, 102, 241] }, // matches your #6366f1 accent
      styles: { fontSize: 10 },
    });

    // ---- Transactions table ----
    nextY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Recent Transactions", 14, nextY);

    autoTable(doc, {
      startY: nextY + 4,
      head: [["Date", "Description", "Category", "Payment", "Amount"]],
      body: filteredExpenses.map((e) => [
        e.date ? e.date.split("T")[0] : "-",
        e.description || "-",
        e.category || "-",
        e.paymentMethod || "-",
        `Rs. ${e.amount || 0}`,
      ]),
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9 },
      didDrawPage: (data) => {
        // page numbers in the footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      },
    });

    // ---- Save ----
    const filename = `expense-report-${periodLabel.replace(/\s+/g, "-")}.pdf`;
    doc.save(filename);
  };
  
  const handleDownloadCSV = () => {
    const headers = ["Date", "Description", "Category", "Payment Method", "Amount"];
    const rows = filteredExpenses.map(e => [
      e.date ? e.date.split("T")[0] : "-",
      e.description ? `"${e.description.replace(/"/g, '""')}"` : "-",
      e.category || "-",
      e.paymentMethod || "-",
      e.amount || 0
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `expense-report-${periodLabel.replace(/\s+/g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content reports-page">

        {/* HEADER */}
        <div className="reports-header-section d-flex justify-content-between align-items-end">
          <div>
            <h2>REPORTS</h2>
            <p>Analyze your spending with detailed insights</p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="filter-panel">
          <h3 className="filter-panel-title">Filter By</h3>
          <div className="filter-grid">
            <div className="filter-group">
              <label>Type</label>
              <select value={filterType} onChange={handleFilterTypeChange} className="date-input">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {filterType === 'monthly' && (
              <>
                <div className="filter-group">
                  <label>Month</label>
                  <select value={selectedMonth} onChange={handleMonthChange} className="date-input">
                    <option value="">Select Month</option>
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Year</label>
                  <select value={selectedYear} onChange={handleYearChange} className="date-input">
                    <option value="">Select Year</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {filterType === 'yearly' && (
              <div className="filter-group">
                <label>Year</label>
                <select value={selectedYear} onChange={handleYearChange} className="date-input">
                  <option value="">Select Year</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}
            
            {filterType === 'custom' && (
              <>
                <div className="filter-group">
                  <label>From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="date-input"
                  />
                </div>
                
                <div className="filter-group">
                  <label>To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="date-input"
                  />
                </div>
              </>
            )}
            
            <div className="filter-actions">
              <button onClick={handleReset} className="secondary-btn">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Expense Trend</h3>
            <div className="chart-container">
              {barData.labels.length > 0 && Math.max(...barData.datasets[0].data) > 0 ? (
                <Bar data={barData} />
              ) : (
                <p>No Data</p>
              )}
            </div>
          </div>
          <div className="chart-card">
            <h3>Expense By Category</h3>
            <div className="chart-container">
              {pieData.labels.length > 0 ? (
                <Pie data={pieData} />
              ) : (
                <p>No Data</p>
              )}
            </div>
          </div>
        </div>

        {/* SUMMARY STRIP */}
        <div className="summary-strip">
          <div className="summary-card">
            <span>Total Spent</span>
            <strong>₹{totalSpent}</strong>
          </div>
          <div className="summary-card">
            <span>Transactions</span>
            <strong>{totalTransactions}</strong>
          </div>
          <div className="summary-card">
            <span>Avg Expense</span>
            <strong>₹{avgPerDay}</strong>
          </div>
          <div className="summary-card">
            <span>Top Category</span>
            <strong>{topCategory}</strong>
          </div>
        </div>

        {/* CATEGORY BREAKDOWN */}
        <div className="category-breakdown-section">
          <h3>Category Breakdown</h3>
          <div className="category-list-advanced">
            {Object.keys(categoryTotals).length === 0 ? (
              <p className="empty-text">No expenses found.</p>
            ) : (
              Object.entries(categoryTotals).map(([category, amount]) => {
                const percentage = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(0) : 0;
                return (
                  <div className="category-row" key={category}>
                    <span className="cat-name">{category}</span>
                    <strong className="cat-amt">₹{amount}</strong>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="transaction-section">
          <div className="transaction-header d-flex justify-content-between align-items-center mb-3">
            <h3 className="m-0">Recent Transactions</h3>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Payment</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.slice(0, 5).map((expense) => (
                  <tr key={expense._id}>
                    <td>
                      {expense.date ? expense.date.split("T")[0] : "-"}
                    </td>
                    <td>{expense.description || "-"}</td>
                    <td>{expense.category || "-"}</td>
                    <td>{expense.paymentMethod || "-"}</td>
                    <td className="amount">₹{expense.amount || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-table">
                    No Transactions Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER CONTROLS */}
        <div className="reports-footer d-flex justify-content-center mt-4 mb-4">
          <button onClick={handleDownloadPDF} className="download-btn mx-2">
            Download Report
          </button>
        </div>

      </div>
    </div>
  );
}

export default Reports;