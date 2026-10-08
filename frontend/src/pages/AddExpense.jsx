
import { useState, useEffect } from "react";
import axios from "axios";

function AddExpense({
  fetchExpenses,
  editingExpense,
  setEditingExpense,
}) {
  
  const emptyForm = {
    date: "",
    description: "",
    category: "Food",
    paymentMethod: "Cash",
    amount: "",
  };
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingExpense) {
      setForm({
        date: editingExpense.date
          ? editingExpense.date.split("T")[0]
          : "",
        description: editingExpense.description || "",
        category: editingExpense.category || "Food",
        paymentMethod:
          editingExpense.paymentMethod || "Cash",
        amount: editingExpense.amount || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingExpense]);

//
  
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingExpense(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingExpense) {
        await axios.put(
          `http://localhost:5000/expenses/${editingExpense._id}`,
          form
        );

        alert("Expense updated successfully");
      } else {
       await axios.post(
  "http://localhost:5000/expenses",
  {
    ...form,
    userId: user.id,
  }
);

        alert("Expense added successfully");
      }

      resetForm();
      fetchExpenses();
    } catch (err) {
      console.log(err);
      alert("Operation failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <div className="row g-3">

        <div className="col-md-2">
          <input
            type="date"
            name="date"
            className="form-control"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-3">
          <input
            type="text"
            name="description"
            className="form-control"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-2">
          <select
            name="category"
            className="form-select"
            value={form.category}
            onChange={handleChange}
          >
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Entertainment</option>
            <option>Others</option>
          </select>
        </div>

        <div className="col-md-2">
          <select
            name="paymentMethod"
            className="form-select"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Net Banking</option>
          </select>
        </div>

        <div className="col-md-2">
          <input
            type="number"
            name="amount"
            className="form-control"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-1 d-grid">
          <button
            type="submit"
            className={`btn ${
              editingExpense
                ? "btn-warning"
                : "btn-success"
            }`}
          >
            {editingExpense ? "Update" : "Add"}
          </button>
        </div>

      </div>

      {editingExpense && (
        <div className="mt-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetForm}
          >
            Cancel
          </button>
        </div>
      )}

    </form>
  );
}

export default AddExpense;
