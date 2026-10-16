import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Kanban from "../components/Kanban";
import AiBanner from "../components/AiBanner";
import Timesheets from "./Timesheets";
import Gantt from "./Gantt";
import Money from "./Money";
import Settings from "./Settings";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
    autoConnect: false,
});

function Workspace() {
    const { user, logout, canWrite } = useAuth();
    const [boards, setBoards] = useState([]);
    const [selected, setSelected] = useState("");
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [tab, setTab] = useState("board");
    const [presence, setPresence] = useState([]);
    const [cursors, setCursors] = useState({});
    const [digest, setDigest] = useState(null);

    const board = useMemo(
        () => boards.find((b) => b._id === selected),
        [boards, selected]
    );

    const loadBoards = async (keepId) => {
        const res = await API.get("/boards");
        setBoards(res.data);
        const next =
            keepId && res.data.some((b) => b._id === keepId)
                ? keepId
                : res.data[0]?._id || "";
        setSelected(next);
        return next;
    };

    const loadTasks = async (boardId = selected) => {
        if (!boardId) {
            setTasks([]);
            return;
        }
        const res = await API.get(`/tasks/board/${boardId}`, {
            params: {
                keyword: search || undefined,
                status: statusFilter,
                priority: priorityFilter,
            },
        });
        setTasks(res.data);
    };

    const reload = async () => {
        const id = await loadBoards(selected);
        await loadTasks(id);
        if (id) {
            const ai = await API.get("/ai/digest", { params: { board: id } });
            setDigest(ai.data);
        }
    };

    useEffect(() => {
        API.get("/auth/users").then((res) => setUsers(res.data));
        loadBoards();
        socket.connect();
        socket.on("presence", setPresence);
        socket.on("board:changed", () => {
            loadBoards(selected);
            loadTasks(selected);
        });
        socket.on("cursor", (payload) => {
            setCursors((prev) => ({ ...prev, [payload.email]: payload }));
        });
        const move = (e) => {
            if (!selected || !user) return;
            socket.emit("cursor", {
                boardId: selected,
                email: user.email,
                name: user.name,
                color: user.avatarColor,
                x: e.clientX,
                y: e.clientY,
            });
        };
        window.addEventListener("mousemove", move);
        return () => {
            window.removeEventListener("mousemove", move);
            socket.off("presence");
            socket.off("board:changed");
            socket.off("cursor");
        };
    }, []);

    useEffect(() => {
        if (selected && user) {
            socket.emit("join-board", {
                boardId: selected,
                user: {
                    name: user.name,
                    email: user.email,
                    color: user.avatarColor,
                    role: user.role,
                },
            });
            loadTasks(selected);
            API.get("/ai/digest", { params: { board: selected } }).then((res) =>
                setDigest(res.data)
            );
        }
    }, [selected, search, statusFilter, priorityFilter, user]);

    const addBoard = async () => {
        const boardName = prompt("Board name");
        if (!boardName) return;
        await API.post("/boards", { boardName });
        reload();
    };

    const renameBoard = async () => {
        const boardName = prompt("New name", board?.boardName);
        if (!boardName) return;
        await API.put(`/boards/${selected}`, { boardName });
        reload();
    };

    const deleteBoard = async () => {
        if (boards.length <= 1) {
            alert("Keep at least one board");
            return;
        }
        if (!window.confirm("Delete board and tasks?")) return;
        await API.delete(`/boards/${selected}`);
        reload();
    };

    const addColumn = async () => {
        const title = prompt("Column title", "Review");
        if (!title) return;
        await API.post(`/boards/${selected}/columns`, { title });
        reload();
    };

    return (
        <div className="app-shell" onClick={() => {}}>
            {Object.values(cursors)
                .filter((c) => c.email !== user?.email)
                .map((c) => (
                    <div
                        key={c.email}
                        className="live-cursor"
                        style={{ left: c.x, top: c.y, background: c.color }}
                    >
                        {c.name}
                    </div>
                ))}
            <header className="navbar">
                <div className="navbar-top">
                    <div>
                        <h1>TaskFlow</h1>
                        <p>Remote team OS · {user?.name} ({user?.role})</p>
                    </div>
                    <div className="presence">
                        {presence.map((p) => (
                            <span
                                key={p.email}
                                className="avatar"
                                style={{ background: p.color || "#2563eb" }}
                                title={`${p.name} viewing`}
                            >
                                {p.name?.[0]}
                            </span>
                        ))}
                        <button className="ghost" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </div>
                <div className="navbar-tools">
                    <input
                        placeholder="Search tasks"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All status</option>
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                        <option value="All">All priority</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                </div>
            </header>
            <div className="main">
                <aside className="sidebar">
                    <h3>Boards</h3>
                    {canWrite && <button onClick={addBoard}>Add board</button>}
                    {canWrite && selected && (
                        <>
                            <button className="rename-board-btn" onClick={renameBoard}>
                                Rename
                            </button>
                            <button className="ghost" onClick={addColumn}>
                                Add column
                            </button>
                            <button className="delete-board-btn" onClick={deleteBoard}>
                                Delete board
                            </button>
                        </>
                    )}
                    <ul>
                        {boards.map((item) => (
                            <li
                                key={item._id}
                                className={item._id === selected ? "active-board" : ""}
                                onClick={() => setSelected(item._id)}
                            >
                                {item.boardName}
                            </li>
                        ))}
                    </ul>
                    <div className="tabs">
                        {[
                            ["board", "Kanban"],
                            ["gantt", "Timeline"],
                            ["time", "Time"],
                            ["money", "Billing"],
                            ["settings", "Settings"],
                        ].map(([id, label]) => (
                            <button
                                key={id}
                                className={tab === id ? "" : "ghost"}
                                onClick={() => setTab(id)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </aside>
                <section className="content">
                    {tab === "board" && board && (
                        <>
                            <AiBanner digest={digest} />
                            <Kanban
                                board={board}
                                tasks={tasks}
                                reload={reload}
                                users={users}
                            />
                        </>
                    )}
                    {tab === "gantt" && <Gantt tasks={tasks} />}
                    {tab === "time" && (
                        <Timesheets boardId={selected} hourBudget={board?.hourBudget} />
                    )}
                    {tab === "money" && board && <Money board={board} />}
                    {tab === "settings" && board && (
                        <Settings board={board} onSaved={reload} />
                    )}
                    {!board && <p className="panel">Create a board to start.</p>}
                </section>
            </div>
        </div>
    );
}

export default Workspace;
