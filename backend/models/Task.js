const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        document: { type: String, default: "" },
        status: {
            type: String,
            enum: ["Todo", "In Progress", "Done"],
            default: "Todo",
        },
        columnKey: { type: String, default: "todo" },
        order: { type: Number, default: 0 },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        aiScore: { type: Number, default: 0 },
        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Board",
            required: true,
        },
        assignedTo: { type: String, default: "" },
        dueDate: { type: Date },
        timeSpent: { type: Number, default: 0 },
        estimatedHours: { type: Number, default: 0 },
        timerStartedAt: { type: Date, default: null },
        billable: { type: Boolean, default: true },
        blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
        githubPr: { type: String, default: "" },
        attachments: [
            {
                filename: String,
                originalName: String,
                url: String,
            },
        ],
        recurring: {
            enabled: { type: Boolean, default: false },
            rule: {
                type: String,
                enum: ["none", "daily", "weekly", "monthly"],
                default: "none",
            },
            lastGenerated: { type: Date },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
