const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Login required" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
        const user = await User.findById(payload.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

const requireWrite = (req, res, next) => {
    if (req.user?.role === "guest") {
        return res.status(403).json({ message: "Guests have read-only access" });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
    }
    next();
};

module.exports = { auth, requireWrite, requireAdmin };
