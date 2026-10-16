const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function tokenFor(user) {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "dev-secret",
        { expiresIn: "7d" }
    );
}

function publicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
    };
}

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password required" });
        }
        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hash,
            role: ["admin", "member", "guest"].includes(role) ? role : "member",
            avatarColor: ["#2563eb", "#7c3aed", "#db2777", "#059669", "#ea580c"][
                Math.floor(Math.random() * 5)
            ],
        });
        res.status(201).json({ user: publicUser(user), token: tokenFor(user) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: (email || "").toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        res.json({ user: publicUser(user), token: tokenFor(user) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const me = async (req, res) => {
    res.json(publicUser(req.user));
};

const listUsers = async (req, res) => {
    const users = await User.find().select("name email role avatarColor");
    res.json(users);
};

module.exports = { register, login, me, listUsers };
