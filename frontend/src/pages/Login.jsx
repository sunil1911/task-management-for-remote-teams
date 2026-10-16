import { useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
    const { token, login } = useAuth();
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({
        name: "",
        email: "admin@team.com",
        password: "admin123",
        role: "member",
    });
    const [error, setError] = useState("");

    if (token) return <Navigate to="/" replace />;

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const url = mode === "login" ? "/auth/login" : "/auth/register";
            const res = await API.post(url, form);
            login(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Could not continue");
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={submit}>
                <p className="eyebrow">Remote teams</p>
                <h1>TaskFlow</h1>
                <p className="muted">Trello + Notion hybrid for live collaboration.</p>
                {error && <div className="alert error">{error}</div>}
                {mode === "register" && (
                    <input
                        placeholder="Full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                )}
                <input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {mode === "register" && (
                    <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="guest">Guest (read only)</option>
                    </select>
                )}
                <button type="submit">{mode === "login" ? "Sign in" : "Create account"}</button>
                <button
                    type="button"
                    className="ghost"
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                >
                    {mode === "login" ? "Need an account?" : "Have an account?"}
                </button>
                <div className="demo-box">
                    <b>Demo logins</b>
                    <span>admin@team.com / admin123</span>
                    <span>member@team.com / member123</span>
                    <span>guest@team.com / guest123</span>
                </div>
            </form>
        </div>
    );
}

export default Login;
