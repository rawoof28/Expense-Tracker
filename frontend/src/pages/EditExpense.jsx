import { useState } from "react";
import axios from "axios";

function EditExpense({
  expense,
  fetchExpenses,
  setEditingExpense,
}) {
  const [title, setTitle] =
    useState(expense.title);

  const [amount, setAmount] =
    useState(expense.amount);

  const [category, setCategory] =
    useState(expense.category);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/expenses/${expense._id}`,
        {
          title,
          amount,
          category,
        }
      );

      fetchExpenses();

      setEditingExpense(null);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <h2>Edit Expense</h2>

      <input
        type="text"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <input
        type="number"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value)
        }
      />

      <select
        value={category}
        onChange={(e) =>
          setCategory(e.target.value)
        }
      >
        <option>Food</option>
        <option>Travel</option>
        <option>Shopping</option>
      </select>

      <button type="submit">
        Update Expense
      </button>
    </form>
  );
}

export default EditExpense;