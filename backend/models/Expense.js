const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
        userName: { type: String, required: true },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        receiptUrl: { type: String, default: "" },
        date: { type: Date, default: Date.now },
        reimbursed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
