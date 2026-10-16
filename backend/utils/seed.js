const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Board = require("../models/Board");
const Task = require("../models/Task");

const colors = ["#2563eb", "#7c3aed", "#db2777", "#059669"];

async function seedIfEmpty() {
    const count = await User.countDocuments();
    if (count > 0) return;

    const password = await bcrypt.hash("admin123", 10);
    const memberPass = await bcrypt.hash("member123", 10);
    const guestPass = await bcrypt.hash("guest123", 10);

    const admin = await User.create({
        name: "Asha Patel",
        email: "admin@team.com",
        password,
        role: "admin",
        avatarColor: colors[0],
    });
    const member = await User.create({
        name: "Rahul Mehta",
        email: "member@team.com",
        password: memberPass,
        role: "member",
        avatarColor: colors[1],
    });
    await User.create({
        name: "Guest Viewer",
        email: "guest@team.com",
        password: guestPass,
        role: "guest",
        avatarColor: colors[2],
    });

    const board = await Board.create({
        boardName: "Remote Teams",
        description: "Sprint board for distributed collaboration",
        hourBudget: 80,
        clientName: "Acme Corp",
        clientEmail: "billing@acme.test",
        members: [
            { user: admin._id, role: "admin" },
            { user: member._id, role: "member" },
        ],
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 6);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const standup = await Task.create({
        title: "Daily standup notes",
        description: "Capture blockers and wins.",
        document: "<p>Use this card as a living standup doc.</p>",
        board: board._id,
        columnKey: "todo",
        status: "Todo",
        priority: "Medium",
        assignedTo: "Rahul Mehta",
        dueDate: tomorrow,
        estimatedHours: 0.5,
        order: 0,
        recurring: { enabled: true, rule: "daily" },
    });

    await Task.create({
        title: "Fix onboarding email flow",
        description: "Blocked until API keys rotate.",
        board: board._id,
        columnKey: "in-progress",
        status: "In Progress",
        priority: "High",
        assignedTo: "Asha Patel",
        dueDate: yesterday,
        estimatedHours: 4,
        order: 0,
        blockedBy: [standup._id],
        githubPr: "https://github.com/acme/app/pull/42",
    });

    await Task.create({
        title: "Weekly client review",
        description: "Prepare metrics and timesheet summary.",
        board: board._id,
        columnKey: "todo",
        status: "Todo",
        priority: "High",
        assignedTo: "Asha Patel",
        dueDate: nextWeek,
        estimatedHours: 2,
        order: 1,
        recurring: { enabled: true, rule: "weekly" },
    });

    console.log("Demo users ready: admin@team.com / admin123");
}

module.exports = { seedIfEmpty };
