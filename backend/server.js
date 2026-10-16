const path = require("path");
const fs = require("fs");
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const taskRoutes = require("./routes/taskRoutes");
const boardRoutes = require("./routes/boardRoutes");
const authRoutes = require("./routes/authRoutes");
const timeRoutes = require("./routes/timeRoutes");
const financeRoutes = require("./routes/financeRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { seedIfEmpty } = require("./utils/seed");
const { generateRecurringTasks } = require("./utils/recurring");

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});

app.set("io", io);
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(uploadsDir));

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/boards", boardRoutes);
app.use("/time", timeRoutes);
app.use("/finance", financeRoutes);
app.use("/ai", aiRoutes);

app.get("/", (_req, res) => {
    res.send("Task Management Backend Running");
});

io.on("connection", (socket) => {
    socket.on("join-board", ({ boardId, user }) => {
        if (socket.data.boardId) {
            socket.leave(socket.data.boardId);
        }
        socket.join(String(boardId));
        socket.data.boardId = String(boardId);
        socket.data.user = user;
        const room = io.sockets.adapter.rooms.get(String(boardId)) || new Set();
        const people = [...room]
            .map((id) => io.sockets.sockets.get(id)?.data.user)
            .filter(Boolean);
        io.to(String(boardId)).emit("presence", people);
    });

    socket.on("cursor", (payload) => {
        if (payload?.boardId) {
            socket.to(String(payload.boardId)).emit("cursor", payload);
        }
    });

    socket.on("disconnect", () => {
        const boardId = socket.data.boardId;
        if (!boardId) return;
        const room = io.sockets.adapter.rooms.get(boardId) || new Set();
        const people = [...room]
            .map((id) => io.sockets.sockets.get(id)?.data.user)
            .filter(Boolean);
        io.to(boardId).emit("presence", people);
    });
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB Connected");
        await seedIfEmpty();
        await generateRecurringTasks();
        setInterval(() => {
            generateRecurringTasks().catch(() => {});
        }, 60 * 1000);
    })
    .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
