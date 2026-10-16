const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
    {
        board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
        clientName: { type: String, required: true },
        clientEmail: { type: String, default: "" },
        items: [
            {
                description: String,
                hours: Number,
                rate: Number,
                amount: Number,
            },
        ],
        expenses: { type: Number, default: 0 },
        total: { type: Number, required: true },
        status: {
            type: String,
            enum: ["draft", "sent", "paid"],
            default: "draft",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
