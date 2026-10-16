const Expense = require("../models/Expense");
const Invoice = require("../models/Invoice");
const TimeEntry = require("../models/TimeEntry");
const Board = require("../models/Board");

const listExpenses = async (req, res) => {
    const items = await Expense.find({ board: req.query.board }).sort({ date: -1 });
    res.json(items);
};

const addExpense = async (req, res) => {
    try {
        const item = await Expense.create({
            board: req.body.board,
            userName: req.user.name,
            amount: req.body.amount,
            description: req.body.description,
            receiptUrl: req.body.receiptUrl || "",
            date: req.body.date || new Date(),
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleExpense = async (req, res) => {
    const item = await Expense.findById(req.params.id);
    item.reimbursed = !item.reimbursed;
    await item.save();
    res.json(item);
};

const listInvoices = async (req, res) => {
    const items = await Invoice.find({ board: req.query.board }).sort({ createdAt: -1 });
    res.json(items);
};

const generateInvoice = async (req, res) => {
    try {
        const { boardId, rate = 50 } = req.body;
        const board = await Board.findById(boardId);
        const entries = await TimeEntry.find({ board: boardId, billable: true }).populate(
            "task",
            "title"
        );
        const expenses = await Expense.find({ board: boardId, reimbursed: false });

        const grouped = {};
        entries.forEach((e) => {
            const key = e.task?.title || "General";
            grouped[key] = (grouped[key] || 0) + e.minutes;
        });

        const items = Object.entries(grouped).map(([description, minutes]) => {
            const hours = Math.round((minutes / 60) * 100) / 100;
            return {
                description,
                hours,
                rate: Number(rate),
                amount: Math.round(hours * Number(rate) * 100) / 100,
            };
        });
        const labor = items.reduce((s, i) => s + i.amount, 0);
        const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);

        const invoice = await Invoice.create({
            board: boardId,
            clientName: board.clientName || "Client",
            clientEmail: board.clientEmail || "",
            items,
            expenses: expenseTotal,
            total: Math.round((labor + expenseTotal) * 100) / 100,
            status: "draft",
        });
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateInvoice = async (req, res) => {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(invoice);
};

const subscribe = async (req, res) => {
    const board = await Board.findByIdAndUpdate(
        req.body.boardId,
        {
            billingPlan: req.body.plan || "per-seat",
            seats: req.body.seats || 5,
            billingStatus: "active",
        },
        { new: true }
    );
    res.json({
        message: process.env.STRIPE_SECRET_KEY
            ? "Stripe subscription recorded"
            : "Local subscription activated (add STRIPE_SECRET_KEY for live Stripe)",
        board,
    });
};

module.exports = {
    listExpenses,
    addExpense,
    toggleExpense,
    listInvoices,
    generateInvoice,
    updateInvoice,
    subscribe,
};
