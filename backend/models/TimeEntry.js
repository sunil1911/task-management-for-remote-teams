const mongoose = require("mongoose");

const timeEntrySchema = new mongoose.Schema(
    {
        task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
        board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
        userName: { type: String, required: true },
        minutes: { type: Number, required: true },
        note: { type: String, default: "" },
        billable: { type: Boolean, default: true },
        startedAt: { type: Date, default: Date.now },
        endedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("TimeEntry", timeEntrySchema);
