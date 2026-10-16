const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema(
    {
        key: { type: String, required: true },
        title: { type: String, required: true },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const memberSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
            type: String,
            enum: ["admin", "member", "guest"],
            default: "member",
        },
    },
    { _id: false }
);

const boardSchema = new mongoose.Schema(
    {
        boardName: { type: String, required: true },
        description: { type: String, default: "" },
        columns: {
            type: [columnSchema],
            default: () => [
                { key: "todo", title: "Todo", order: 0 },
                { key: "in-progress", title: "In Progress", order: 1 },
                { key: "done", title: "Done", order: 2 },
            ],
        },
        members: [memberSchema],
        hourBudget: { type: Number, default: 40 },
        slackWebhook: { type: String, default: "" },
        githubRepo: { type: String, default: "" },
        clientName: { type: String, default: "" },
        clientEmail: { type: String, default: "" },
        billingPlan: {
            type: String,
            enum: ["free", "per-seat", "flat-rate"],
            default: "free",
        },
        seats: { type: Number, default: 3 },
        billingStatus: {
            type: String,
            enum: ["inactive", "active"],
            default: "inactive",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Board", boardSchema);
