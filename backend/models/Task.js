const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ["Todo", "In Progress", "Done"],
            default: "Todo",
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Board",
            required: true,
        },
        assignedTo: {
            type: String,
        },
        dueDate: {
            type: Date,
        },
        timeSpent: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);