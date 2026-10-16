const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["admin", "member", "guest"],
            default: "member",
        },
        avatarColor: { type: String, default: "#2563eb" },
        slackWebhook: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
