const express = require("express");

const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const router = express.Router();

// Add Expense
router.post("/", addExpense);

// Get Expenses of Logged-in User
router.get("/:userId", getExpenses);

// Update Expense
router.put("/:id", updateExpense);

// Delete Expense
router.delete("/:id", deleteExpense);

module.exports = router;