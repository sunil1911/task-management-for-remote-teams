import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Workspace from "./pages/Workspace";

function Private({ children }) {
    const { token } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/*"
                element={
                    <Private>
                        <Workspace />
                    </Private>
                }
            />
        </Routes>
    );
}

export default App;
