const Expense = require("../models/Expense");

const validateExpensePayload = (payload) => {
  const { userId, date, description, category, paymentMethod, amount } = payload;

  if (!userId || !date || !description || !category || !paymentMethod || amount === undefined) {
    return "All expense fields are required";
  }

  if (Number(amount) <= 0) {
    return "Expense amount must be greater than zero";
  }

  return null;
};

// ADD EXPENSE
const addExpense = async (req, res) => {
  try {
    const validationError = validateExpensePayload(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const expense = await Expense.create({
      userId: req.body.userId,
      date: req.body.date,
      description: req.body.description,
      category: req.body.category,
      paymentMethod: req.body.paymentMethod,
      amount: Number(req.body.amount),
    });

    res.status(201).json(expense);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET USER EXPENSES
const getExpenses = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const expenses = await Expense.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE EXPENSE
const updateExpense = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "No update data provided",
      });
    }

    if (req.body.amount !== undefined && Number(req.body.amount) <= 0) {
      return res.status(400).json({
        message: "Expense amount must be greater than zero",
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(req.body.amount !== undefined ? { amount: Number(req.body.amount) } : {}),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json(updatedExpense);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);

    if (!deletedExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};

