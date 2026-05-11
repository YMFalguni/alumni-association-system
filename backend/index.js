const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Alumni = require("./models/Alumni");
const Event = require("./models/Event");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(` ${req.method} ${req.path}`);
    next();
});

app.get('/api/stats', async (req, res) => {
    try {
        const totalAlumni = await Alumni.countDocuments();
        const employedCount = await Alumni.countDocuments({ employmentStatus: 'Employed' });
        const activeEvents = await Event.countDocuments();

        res.json({
            totalAlumni,
            employedCount,
            activeEvents
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error fetching stats" });
    }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/alumni", require("./routes/alumni"));
app.use('/api/events', require('./routes/events'));

app.get("/", (req, res) => {
    res.send("Alumni Platform Backend Running");
});

mongoose.set("bufferCommands", false);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected✅");
    } catch (err) {
        console.error("MongoDB connection failed", err);
        process.exit(1);
    }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});