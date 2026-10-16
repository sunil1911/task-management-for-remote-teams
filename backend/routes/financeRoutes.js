const express = require("express");
const router = express.Router();
const {
    listExpenses,
    addExpense,
    toggleExpense,
    listInvoices,
    generateInvoice,
    updateInvoice,
    subscribe,
} = require("../controllers/financeController");
const { auth, requireWrite, requireAdmin } = require("../middleware/auth");

router.get("/expenses", auth, listExpenses);
router.post("/expenses", auth, requireWrite, addExpense);
router.put("/expenses/:id", auth, requireWrite, toggleExpense);
router.get("/invoices", auth, listInvoices);
router.post("/invoices", auth, requireWrite, generateInvoice);
router.put("/invoices/:id", auth, requireWrite, updateInvoice);
router.post("/subscribe", auth, requireAdmin, subscribe);

module.exports = router;
