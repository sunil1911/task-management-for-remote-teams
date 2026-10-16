import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Money({ board }) {
    const { canWrite, isAdmin } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [form, setForm] = useState({ amount: "", description: "" });
    const [receipt, setReceipt] = useState("");

    const load = async () => {
        if (!board?._id) return;
        const [e, i] = await Promise.all([
            API.get("/finance/expenses", { params: { board: board._id } }),
            API.get("/finance/invoices", { params: { board: board._id } }),
        ]);
        setExpenses(e.data);
        setInvoices(i.data);
    };

    useEffect(() => {
        load();
    }, [board?._id]);

    const addExpense = async () => {
        await API.post("/finance/expenses", {
            board: board._id,
            amount: Number(form.amount),
            description: form.description,
            receiptUrl: receipt,
        });
        setForm({ amount: "", description: "" });
        load();
    };

    const invoice = async () => {
        await API.post("/finance/invoices", { boardId: board._id, rate: 60 });
        load();
    };

    const subscribe = async (plan) => {
        await API.post("/finance/subscribe", { boardId: board._id, plan, seats: 8 });
        load();
        alert("Subscription saved locally. Add STRIPE_SECRET_KEY for live Stripe.");
    };

    return (
        <div className="split">
            <div className="panel">
                <h2>Expenses & receipts</h2>
                {canWrite && (
                    <div className="composer">
                        <input
                            placeholder="Amount"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        />
                        <input
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <input
                            placeholder="Receipt URL or uploaded path"
                            value={receipt}
                            onChange={(e) => setReceipt(e.target.value)}
                        />
                        <button onClick={addExpense}>Log expense</button>
                    </div>
                )}
                <ul className="list">
                    {expenses.map((item) => (
                        <li key={item._id}>
                            <div>
                                <b>${item.amount}</b> {item.description}
                                <div className="tiny">
                                    {item.userName} · {item.reimbursed ? "reimbursed" : "pending"}
                                </div>
                            </div>
                            {canWrite && (
                                <button
                                    className="ghost"
                                    onClick={async () => {
                                        await API.put(`/finance/expenses/${item._id}`);
                                        load();
                                    }}
                                >
                                    Toggle paid
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="panel">
                <div className="panel-head">
                    <h2>Client invoices</h2>
                    {canWrite && <button onClick={invoice}>Generate from hours</button>}
                </div>
                {invoices.map((inv) => (
                    <div className="invoice" key={inv._id}>
                        <b>
                            {inv.clientName} · ${inv.total}
                        </b>
                        <p className="tiny">{inv.status}</p>
                        {inv.items.map((it, idx) => (
                            <p key={idx}>
                                {it.description}: {it.hours}h × ${it.rate}
                            </p>
                        ))}
                        {canWrite && (
                            <button
                                className="ghost"
                                onClick={async () => {
                                    await API.put(`/finance/invoices/${inv._id}`, { status: "sent" });
                                    load();
                                }}
                            >
                                Mark sent
                            </button>
                        )}
                    </div>
                ))}
                {isAdmin && (
                    <div className="billing">
                        <h3>Team subscription</h3>
                        <p>
                            Plan: {board.billingPlan} · {board.billingStatus} · {board.seats} seats
                        </p>
                        <button onClick={() => subscribe("per-seat")}>Per-seat</button>
                        <button className="ghost" onClick={() => subscribe("flat-rate")}>
                            Flat rate
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Money;
