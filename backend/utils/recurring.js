const Task = require("../models/Task");

function nextDue(from, rule) {
    const date = new Date(from || Date.now());
    if (rule === "daily") date.setDate(date.getDate() + 1);
    if (rule === "weekly") date.setDate(date.getDate() + 7);
    if (rule === "monthly") date.setMonth(date.getMonth() + 1);
    return date;
}

async function generateRecurringTasks() {
    const templates = await Task.find({ "recurring.enabled": true });
    const created = [];

    for (const task of templates) {
        const last = task.recurring.lastGenerated || task.createdAt;
        const due = nextDue(last, task.recurring.rule);
        if (due > new Date()) continue;

        const copy = await Task.create({
            title: task.title,
            description: task.description,
            document: task.document,
            status: "Todo",
            columnKey: "todo",
            priority: task.priority,
            board: task.board,
            assignedTo: task.assignedTo,
            dueDate: due,
            estimatedHours: task.estimatedHours,
            billable: task.billable,
            recurring: { enabled: false, rule: "none" },
        });
        task.recurring.lastGenerated = new Date();
        await task.save();
        created.push(copy);
    }

    return created;
}

module.exports = { generateRecurringTasks };
