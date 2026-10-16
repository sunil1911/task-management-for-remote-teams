import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function startOfWeek() {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
}

function Timesheets({ boardId, hourBudget }) {
    const { canWrite } = useAuth();
    const [summary, setSummary] = useState(null);
    const [from] = useState(startOfWeek().toISOString());

    const load = async () => {
        if (!boardId) return;
        const res = await API.get("/time/summary", { params: { board: boardId, from } });
        setSummary(res.data);
    };

    useEffect(() => {
        load();
    }, [boardId, from]);

    const exportCsv = () => {
        const rows = [["User/Task", "Minutes"]];
        Object.entries(summary?.byUser || {}).forEach(([k, v]) => rows.push([k, v]));
        rows.push([]);
        Object.entries(summary?.byTask || {}).forEach(([k, v]) => rows.push([k, v]));
        const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "timesheet.csv";
        a.click();
    };

    if (!summary) return <p>Loading timesheet…</p>;

    const hours = (summary.totalMinutes || 0) / 60;
    const budget = hourBudget || 40;

    return (
        <div className="panel">
            <div className="panel-head">
                <h2>Weekly timesheet</h2>
                <button onClick={exportCsv}>Export CSV</button>
            </div>
            <p>
                {hours.toFixed(1)}h logged this week · {summary.billableMinutes / 60}h billable · budget {budget}h
            </p>
            <div className="budget-bar">
                <div style={{ width: `${Math.min(100, (hours / budget) * 100)}%` }} />
            </div>
            <h3>By teammate</h3>
            <ul>
                {Object.entries(summary.byUser).map(([name, mins]) => (
                    <li key={name}>
                        {name}: {(mins / 60).toFixed(2)}h
                    </li>
                ))}
            </ul>
            <h3>By task</h3>
            <ul>
                {Object.entries(summary.byTask).map(([name, mins]) => (
                    <li key={name}>
                        {name}: {(mins / 60).toFixed(2)}h
                    </li>
                ))}
            </ul>
            {!canWrite && <p className="muted">Guest view — timers are read only.</p>}
        </div>
    );
}

export default Timesheets;
