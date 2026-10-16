import { useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Settings({ board, onSaved }) {
    const { isAdmin, canWrite } = useAuth();
    const [form, setForm] = useState({
        slackWebhook: board.slackWebhook || "",
        githubRepo: board.githubRepo || "",
        hourBudget: board.hourBudget || 40,
        clientName: board.clientName || "",
        clientEmail: board.clientEmail || "",
        description: board.description || "",
    });

    const save = async () => {
        await API.put(`/boards/${board._id}`, form);
        onSaved();
        alert("Board settings saved");
    };

    return (
        <div className="panel">
            <h2>Workspace settings</h2>
            <p className="muted">Roles: admin can bill, members edit, guests view.</p>
            <input
                disabled={!canWrite}
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
                disabled={!canWrite}
                placeholder="Hour budget"
                value={form.hourBudget}
                onChange={(e) => setForm({ ...form, hourBudget: e.target.value })}
            />
            <input
                disabled={!canWrite}
                placeholder="Client name"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
            <input
                disabled={!canWrite}
                placeholder="Client email"
                value={form.clientEmail}
                onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
            />
            <input
                disabled={!isAdmin}
                placeholder="Slack webhook URL"
                value={form.slackWebhook}
                onChange={(e) => setForm({ ...form, slackWebhook: e.target.value })}
            />
            <input
                disabled={!canWrite}
                placeholder="GitHub repo (org/name)"
                value={form.githubRepo}
                onChange={(e) => setForm({ ...form, githubRepo: e.target.value })}
            />
            {canWrite && <button onClick={save}>Save integrations</button>}
            <h3>Members</h3>
            <ul>
                {(board.members || []).map((m, i) => (
                    <li key={i}>
                        {m.user?.name || "User"} · {m.role}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Settings;
