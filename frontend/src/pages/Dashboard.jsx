import { useState, useEffect } from "react";
import axios from "axios";
import AddExpense from "./AddExpense";
import Sidebar from "./Sidebar";
import "./Dashboard.css";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  // EDIT EXPENSE STATE (✅ THIS WAS MISSING)
  const [editingExpense, setEditingExpense] = useState(null);

  // Allowance

  const [allowance, setAllowance] = useState(() => {
    return (
      localStorage.getItem(`allowance_${user?.id}`) || "0"
    );
  });

  const [tempAllowance, setTempAllowance] = useState("");
  const [editingAllowance, setEditingAllowance] = useState(false);

  // FETCH
  const fetchExpenses = async () => {
    try {

      const res = await axios.get(
        `http://localhost:5000/expenses/${user.id}`
      );

      setExpenses(res.data);

    } catch (err) {

      console.log(err);

    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // DELETE
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.log(err);
    }
  };

  // FORMAT DATE
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  // TOTAL SPENT
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = expenses.filter((e) => {
    const date = new Date(e.date);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const totalSpent = currentMonthExpenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const monthlyRevenue = Number(allowance || 0);
  const remaining = monthlyRevenue - totalSpent;

  // PROGRESS %
  const spentPercent =
    monthlyRevenue > 0
      ? Math.min((totalSpent / monthlyRevenue) * 100, 100)
      : 0;

  // COLOR
  const progressColor =
    spentPercent < 60
      ? "#22c55e"
      : spentPercent < 80
        ? "#f59e0b"
        : "#ef4444";

  // WARNING
  const isWarning = spentPercent >= 80 && spentPercent < 100;
  const isExceeded = spentPercent >= 100;

  // GROUP (sorted newest to oldest)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const groupedExpenses = sortedExpenses.reduce((acc, e) => {
    const month = new Date(e.date).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    acc[month] = acc[month] || [];
    acc[month].push(e);
    return acc;
  }, {});

  // SAVE ALLOWANCE
  const saveAllowance = () => {
    localStorage.setItem(
      `allowance_${user.id}`,
      tempAllowance
    );

    setAllowance(tempAllowance);
    setEditingAllowance(false);
  };

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="main-content">

        {/* HEADER */}
        <div className="topbar">
          <h2>Dashboard</h2>
          <p>Manage your expenses efficiently</p>
        </div>

        {/* ALLOWANCE */}
        <div className="allowance-box">
          <h4>Monthly Allowance</h4>

          {!editingAllowance ? (
            <div className="allowance-view">
              <h3>₹{allowance || 0}</h3>
              <button onClick={() => {
                setTempAllowance(allowance);
                setEditingAllowance(true);
              }}>
                Edit
              </button>
            </div>
          ) : (
            <div className="allowance-edit">
              <input
                type="number"
                value={tempAllowance}
                onChange={(e) => setTempAllowance(e.target.value)}
              />
              <button onClick={saveAllowance}>Save</button>
              <button onClick={() => setEditingAllowance(false)}>Cancel</button>
            </div>
          )}
        </div>

        {/* PROGRESS */}
        <div className="progress-box">
          <div className="progress-header">
            <h4>Spending Progress</h4>
            <span>₹{totalSpent} / ₹{monthlyRevenue}</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${spentPercent}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>

          <p>{spentPercent.toFixed(1)}% used</p>
        </div>

        {/* WARNING */}
        {isWarning && (
          <div className="warning-box warning">
            ⚠️ Warning: You have used more than 80% of your allowance!
          </div>
        )}

        {isExceeded && (
          <div className="warning-box danger">
            🚨 Alert: You have exceeded your monthly allowance!
          </div>
        )}

        {/* CARDS */}
        <div className="row g-4 mt-3">

          <div className="col-md-4">
            <div className="stats-card revenue">
              <h6>Monthly Allowance</h6>
              <h2>₹{monthlyRevenue}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stats-card spent">
              <h6>Total Spent</h6>
              <h2>₹{totalSpent}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="stats-card remain">
              <h6>Remaining</h6>
              <h2>₹{remaining}</h2>
            </div>
          </div>

        </div>

        {/* ADD EXPENSE */}
        <div className="card shadow mt-4 p-4">
          <h4>Add Expense</h4>

          <AddExpense
            fetchExpenses={fetchExpenses}
            editingExpense={editingExpense}
            setEditingExpense={setEditingExpense}
          />
        </div>

        {/* TABLE */}
        <div className="card shadow mt-4 p-4">
          <h4>Monthly Expenses</h4>

          {Object.keys(groupedExpenses)
            .sort((a, b) => new Date(b) - new Date(a))
            .map((month) => (
              <div key={month}>
                <h5>{month}</h5>

                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Payment</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {groupedExpenses[month].map((e) => (
                      <tr key={e._id}>
                        <td>{formatDate(e.date)}</td>
                        <td>{e.description}</td>
                        <td>{e.category}</td>
                        <td>{e.paymentMethod}</td>
                        <td>₹{e.amount}</td>

                        <td>
                          <button
                            className="btn btn-warning btn-sm me-2"
                            onClick={() => setEditingExpense(e)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(e._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            ))}

        </div>

      </div>
    </div>
  );
}

export default Dashboard;