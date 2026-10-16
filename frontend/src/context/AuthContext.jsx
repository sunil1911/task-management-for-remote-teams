import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("token"));

    useEffect(() => {
        if (!token) return;
        API.get("/auth/me")
            .then((res) => {
                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
            })
            .catch(() => {
                logout();
            });
    }, [token]);

    const login = (payload) => {
        localStorage.setItem("token", payload.token);
        localStorage.setItem("user", JSON.stringify(payload.user));
        setToken(payload.token);
        setUser(payload.user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            token,
            login,
            logout,
            canWrite: user && user.role !== "guest",
            isAdmin: user?.role === "admin",
        }),
        [user, token]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
