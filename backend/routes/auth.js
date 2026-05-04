const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const mongoose = require("mongoose");
const Alumni = require('../models/Alumni'); 
const Event = require('../models/Event');
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware for fetching user from token
const fetchuser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }
};

// Admin Stats Route - Real-time data with Yearly Placement Trends
router.get('/adminstats', fetchuser, async (req, res) => {
    try {
        const totalAlumni = await Alumni.countDocuments();
        const employedCount = await Alumni.countDocuments({ employmentStatus: "Employed" });
        const activeEvents = await Event.countDocuments();

        // Career Distribution (Pie Chart)
        const careerDistribution = await Alumni.aggregate([
            { $group: { _id: "$employmentStatus", count: { $sum: 1 } } }
        ]);

        // Yearly Placement Data (Bar Chart) - Year-wise percentage calculation
        const yearlyPlacements = await Alumni.aggregate([
            {
                $group: {
                    _id: "$graduationYear",
                    totalInYear: { $sum: 1 },
                    placedCount: {
                        $sum: { $cond: [{ $eq: ["$employmentStatus", "Employed"] }, 1, 0] }
                    },
                    higherStudiesCount: {
                        $sum: { $cond: [{ $eq: ["$employmentStatus", "Higher Studies"] }, 1, 0] }
                    },
                    businessCount: {
                        $sum: { $cond: [{ $eq: ["$employmentStatus", "Own Business"] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    totalInYear: 1,
                    placedCount: 1,
                    placementPercentage: {
                        $cond: [
                            { $gt: ["$totalInYear", 0] },
                            { $round: [{ $multiply: [{ $divide: ["$placedCount", "$totalInYear"] }, 100] }, 1] },
                            0
                        ]
                    },
                    higherStudiesCount: 1,
                    businessCount: 1
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Overall Placement Percentage
        const overallPlacementPercentage = totalAlumni > 0 
            ? parseFloat(((employedCount / totalAlumni) * 100).toFixed(1))
            : 0;

        // Average Salary Calculation
        const salaryStats = await Alumni.aggregate([
            { $match: { salary: { $exists: true, $ne: null, $gt: 0 } } },
            {
                $group: {
                    _id: null,
                    avgSalary: { $avg: "$salary" },
                    salaryCount: { $sum: 1 },
                    maxSalary: { $max: "$salary" },
                    minSalary: { $min: "$salary" }
                }
            }
        ]);

        const averageSalary = salaryStats.length > 0 
            ? parseFloat((salaryStats[0].avgSalary / 100000).toFixed(2)) 
            : 0;

        // Department Distribution
        const departmentDistribution = await Alumni.aggregate([
            {
                $group: {
                    _id: "$department",
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalAlumni,
            employedCount,
            activeEvents,
            careerDistribution,
            yearlyPlacements,
            overallPlacementPercentage,
            averageSalary,
            departmentDistribution
        });
    } catch (error) {
        console.error("Error in adminstats route:", error);
        res.status(500).json({ error: error.message });
    }
});

// Route 1: Create a new alumni (Register)
router.post(
    "/createalumni",
    [
        body("firstName").isLength({ min: 3 }),
        body("lastName").isLength({ min: 3 }),
        body("email").isEmail(),
        body("password").isLength({ min: 5 }),
        body("phoneNumber").isLength({ min: 10 }),
        body("graduationYear").isInt({ min: 1970, max: 2100 }),
        body("department").notEmpty(),
        body("employmentStatus").notEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            console.log("=============== REGISTRATION REQUEST ===============");
            console.log("Request Body:", req.body);
            
            let user = await Alumni.findOne({ email: req.body.email });
            if (user) {
                console.log("User already exists:", req.body.email);
                return res.status(400).json({ error: "User already exists" });
            }
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            
            console.log("Creating new Alumni with data...");
            user = await Alumni.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hashedPassword,
                phoneNumber: req.body.phoneNumber,
                graduationYear: req.body.graduationYear,
                department: req.body.department,
                employmentStatus: req.body.employmentStatus,
                salary: req.body.salary ? parseInt(req.body.salary) : undefined,
                role: "alumni",
            });
            
            console.log("✅ ALUMNI CREATED SUCCESSFULLY!");
            console.log("Saved Record:", user);
            console.log("Alumni ID:", user._id);
            console.log("Database:", user.constructor.db.name);
            console.log("Collection:", user.constructor.collection.name);
            console.log("=============== END REGISTRATION ===============");
            
            const payload = { user: { id: user.id, role: user.role } };
            const authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
            res.json({ authToken, success: true, message: "Alumni registered successfully" });
        } catch (err) {
            console.error("❌ ERROR creating alumni:", err.message);
            console.error("Full Error:", err);
            res.status(500).json({ error: err.message || "Internal Server Error" });
        }
    }
);

// Route 2: Alumni Login
router.post("/alumnilogin", async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await Alumni.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) return res.status(400).json({ error: "Invalid credentials" });
        
        const payload = { user: { id: user.id, role: user.role || "alumni" } };
        const authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
        res.json({ authToken, user: { id: user.id, firstName: user.firstName, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// Route 3: Admin login
router.post("/adminlogin", async (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@college.com" && password === "admin123") {
        const payload = { user: { id: "admin_id_01", role: "admin" } };
        const authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
        return res.json({ success: true, authToken, role: "admin" });
    }
    res.status(400).json({ success: false, error: "Invalid Admin Credentials" });
});

// Route 4: Get details of logged-in user
router.get("/getuser", fetchuser, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
            return res.status(401).json({ error: "Invalid authentication token" });
        }
        const user = await Alumni.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Error fetching logged-in user:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route 4b: Alias for logged-in alumni profile
router.get("/me", fetchuser, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
            return res.status(401).json({ error: "Invalid authentication token" });
        }
        const user = await Alumni.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Error fetching logged-in user via /me:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route 5: Get all alumni (for debugging)
router.get("/getalumni", async (req, res) => {
    try {
        const allAlumni = await Alumni.find({});
        console.log("Total alumni in DB:", allAlumni.length);
        res.json({ total: allAlumni.length, alumni: allAlumni });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put("/updatealumni/:id", fetchuser, async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, graduationYear, department, employmentStatus, salary } = req.body;
        
        const newAlumniData = {};
        if (firstName) newAlumniData.firstName = firstName;
        if (lastName) newAlumniData.lastName = lastName;
        if (phoneNumber) newAlumniData.phoneNumber = phoneNumber;
        if (graduationYear) newAlumniData.graduationYear = graduationYear;
        if (department) newAlumniData.department = department;
        if (employmentStatus) newAlumniData.employmentStatus = employmentStatus;
        if (salary) newAlumniData.salary = parseInt(salary);

        let user = await Alumni.findById(req.params.id);
        if (!user) return res.status(404).send("User Not Found");

        // Token madhla user ani update honara user same asave
        if (user._id.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        user = await Alumni.findByIdAndUpdate(req.params.id, { $set: newAlumniData }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

//  Route: Generate AI Insights using Gemini
router.post('/generate-analytics-insights', fetchuser, async (req, res) => {
    try {
        const { stats } = req.body;
        
        // Use gemini-pro as it has the widest availability
        const model = genAI.getGenerativeModel({ model:  "gemini-1.5-flash" });
        
        const prompt = `Analyze these Alumni stats: Total Alumni: ${stats.totalAlumni}, Placement: ${stats.placementRate}%, Avg Salary: ${stats.avgSalary}L. Provide 3 career development recommendations for the college.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ insight: text });

    } catch (error) {
        // Detailed logging to help you debug
        console.error("Gemini AI Error:", error.message);
        
        // Send a friendly message back so the frontend doesn't break
        res.status(500).json({ 
            insight: "The AI analyst is currently updating. Please try again in a moment.",
            error: error.message 
        });
    }
});

module.exports = router;
