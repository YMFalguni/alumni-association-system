const express = require("express");
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const Alumni = require("../models/Alumni");
const ContactMessage = require("../models/ContactMessage");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ROUTE 1: Get all alumni details using: GET "/api/alumni/fetchall". Login required.
router.get('/fetchall', fetchUser, async (req, res) => {
    try {
        const alumni = await Alumni.find().select("-password");
        res.json(alumni);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 1b: Get current logged-in alumni details using: GET "/api/alumni/me". Login required.
router.get('/me', fetchUser, async (req, res) => {
    console.log('🔍 /api/alumni/me route called');
    console.log('User from token:', req.user);
    console.log('Headers:', req.headers);
    try {
        const alumni = await Alumni.findById(req.user.id).select("-password");
        console.log('Found alumni:', alumni ? 'YES' : 'NO');
        console.log('Alumni data:', alumni);
        if (!alumni) {
            console.log('Alumni not found for ID:', req.user.id);
            return res.status(404).json({ error: "User not found" });
        }
        console.log('Returning alumni data');
        res.setHeader('Content-Type', 'application/json');
        res.json(alumni);
    } catch (error) {
        console.error('Error in /me route:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ROUTE 2: Update an existing alumni using: PUT "/api/alumni/updatealumni/:id". Login required.
router.put('/updatealumni/:id', fetchUser, async (req, res) => {
    const { firstName, lastName, phoneNumber, email, employmentStatus, department, graduationYear, salary } = req.body;
    try {
        // Create a newAlumni object with updated fields
        const newAlumni = {};
        if (firstName) { newAlumni.firstName = firstName };
        if (lastName) { newAlumni.lastName = lastName };
        if (email) { newAlumni.email = email };
        if (phoneNumber) { newAlumni.phoneNumber = phoneNumber };
        if (employmentStatus) { newAlumni.employmentStatus = employmentStatus };
        if (department) { newAlumni.department = department };
        if (graduationYear) { newAlumni.graduationYear = graduationYear };
        if (salary) { newAlumni.salary = parseInt(salary) };

        // Find the alumni to be updated and update it
        let alumni = await Alumni.findById(req.params.id);
        if (!alumni) { return res.status(404).send("Not Found") }

        // Security Check: Only allow user to update their own profile (or add Admin check)
        if (alumni._id.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        alumni = await Alumni.findByIdAndUpdate(req.params.id, { $set: newAlumni }, { new: true });
        res.json({ alumni });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Delete an alumni profile using: DELETE "/api/alumni/deletealumni/:id". Login required.
router.delete('/deletealumni/:id', fetchUser, async (req, res) => {
    try {
        let alumni = await Alumni.findById(req.params.id);
        if (!alumni) {
            return res.status(404).json({ error: "Alumni not found" });
        }

        // Allow deletion if user is Admin OR if user is deleting their own profile
        if (req.user.role !== 'admin' && alumni._id.toString() !== req.user.id) {
            return res.status(403).json({ error: "Admin access required to delete this alumni" });
        }

        alumni = await Alumni.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Alumni profile has been deleted", alumni });
    } catch (error) {
        console.error("Delete alumni error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ROUTE 4: Generate AI summary for alumni profile using: POST "/api/alumni/generate-summary/:id". Login required.
router.post('/generate-summary/:id', fetchUser, async (req, res) => {
    try {
        const alumni = await Alumni.findById(req.params.id).select("-password");
        if (!alumni) {
            return res.status(404).json({ error: "Alumni not found" });
        }

        // Allow summary generation for own profile or admin
        if (req.user.role !== 'admin' && alumni._id.toString() !== req.user.id) {
            return res.status(403).json({ error: "Access denied" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Summarize this alumni profile for the directory:
        Name: ${alumni.firstName} ${alumni.lastName}
        Email: ${alumni.email}
        Graduation Year: ${alumni.graduationYear}
        Department: ${alumni.department}
        Employment Status: ${alumni.employmentStatus}
        Salary: ${alumni.salary ? `₹${alumni.salary}` : 'Not specified'}
        Phone: ${alumni.phoneNumber || 'Not provided'}
        
        Please provide a concise, professional summary suitable for an alumni directory.`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        res.json({ summary });
    } catch (error) {
        console.error("AI Summary generation error:", error);
        res.status(500).json({ error: "Failed to generate summary" });
    }
});

// ROUTE 5: Generate AI-powered placement improvement suggestions using: POST "/api/alumni/generate-placement-insights"
router.post('/generate-placement-insights', fetchUser, async (req, res) => {
    try {
        // Only allow admin to generate insights
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Admin access required" });
        }

        const { stats, yearlyPlacements, departmentDistribution } = req.body;

        // Validate required data
        if (!stats || !yearlyPlacements || !departmentDistribution) {
            return res.status(400).json({ error: "Missing required analytics data" });
        }

        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
        
        console.log('🤖 Using AI model: models/gemini-2.5-flash');
        console.log('📊 Processing analytics data:', { stats, yearlyPlacements: yearlyPlacements?.length, departmentDistribution: departmentDistribution?.length });
        
        // Create a comprehensive prompt with all the analytics data
        const prompt = `As an AI career counselor and placement strategist, analyze this alumni placement data and provide specific, actionable recommendations to improve the overall placement rate. Focus on data-driven insights and practical strategies.

Current Statistics:
- Total Alumni: ${stats.totalAlumni}
- Current Placement Rate: ${stats.placementRate}%
- Average Salary: ${stats.avgSalary ? stats.avgSalary + ' Lakhs' : 'Not available'}
- Active Events: ${stats.activeEvents}

Yearly Placement Trends:
${yearlyPlacements.map(year => 
    `Year ${year._id}: ${year.placementPercentage}% placement rate (${year.placedCount}/${year.totalInYear} students)`
).join('\n')}

Department Distribution:
${departmentDistribution.map(dept => 
    `${dept._id}: ${dept.count} alumni`
).join('\n')}

Please provide:
1. Overall assessment of current placement performance
2. Specific strategies to improve placement rates
3. Department-wise recommendations if applicable
4. Timeline-based action items (short-term, medium-term, long-term)
5. Expected impact of each recommendation

Format the response as a professional report with clear sections and actionable insights. Keep it concise but comprehensive.`;

        const result = await model.generateContent(prompt);
        const insights = result.response.text();

        res.json({ insights });
    } catch (error) {
        console.error("AI Placement insights generation error:", error);
        res.status(500).json({ error: "Failed to generate placement insights" });
    }
});

// ROUTE 6: Debug endpoint to list available Gemini models
router.get('/list-models', fetchUser, async (req, res) => {
    try {
        // Only allow admin to list models
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Admin access required" });
        }

        // Try to list models, but if it fails, provide known working models
        try {
            const models = await genAI.listModels();
            const modelNames = models.map(model => ({
                name: model.name,
                displayName: model.displayName,
                supportedMethods: model.supportedGenerationMethods
            }));

            res.json({ availableModels: modelNames });
        } catch (listError) {
            // If listModels fails, provide known working models
            const knownModels = [
                { name: "models/gemini-2.5-flash", displayName: "Gemini 2.5 Flash", supportedMethods: ["generateContent"] },
                { name: "models/gemini-2.0-flash", displayName: "Gemini 2.0 Flash", supportedMethods: ["generateContent"] },
                { name: "models/gemini-pro-latest", displayName: "Gemini Pro Latest", supportedMethods: ["generateContent"] }
            ];
            
            res.json({ 
                availableModels: knownModels,
                note: "Using fallback model list due to API restrictions"
            });
        }
    } catch (error) {
        console.error("Error in list-models:", error);
        res.status(500).json({ error: "Failed to list models" });
    }
});


// ROUTE 7: Handle contact form submissions using: POST "/api/alumni/contact". Login required.
router.post('/contact', fetchUser, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Please provide a valid email address" });
        }

        // Get the sender's information from the token
        const sender = await Alumni.findById(req.user.id).select("firstName lastName email");
        if (!sender) {
            return res.status(404).json({ error: "Sender not found" });
        }

        // Generate unique reference ID
        const referenceId = `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        // Save the contact message to database
        const contactMessage = new ContactMessage({
            sender: {
                id: req.user.id,
                name: `${sender.firstName} ${sender.lastName}`,
                email: sender.email
            },
            name,
            email,
            subject,
            message,
            referenceId
        });

        await contactMessage.save();

        console.log('📧 New Contact Form Submission Saved:');
        console.log('Reference ID:', referenceId);
        console.log('From:', `${sender.firstName} ${sender.lastName} (${sender.email})`);
        console.log('Subject:', subject);

        res.json({
            success: true,
            message: "Thank you for your message! We will get back to you soon.",
            referenceId
        });

    } catch (error) {
        console.error("Contact form submission error:", error);
        res.status(500).json({ error: "Failed to send message. Please try again." });
    }
});

// ROUTE 8: Get all contact messages (Admin only) using: GET "/api/alumni/contact-messages". Login required.
router.get('/contact-messages', fetchUser, async (req, res) => {
    try {
        // Only allow admin to view contact messages
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Admin access required" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const messages = await ContactMessage.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender.id', 'firstName lastName email');

        const total = await ContactMessage.countDocuments();

        res.json({
            messages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalMessages: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error("Error fetching contact messages:", error);
        res.status(500).json({ error: "Failed to fetch contact messages" });
    }
});

// ROUTE 9: Update contact message status (Admin only) using: PUT "/api/alumni/contact-messages/:id". Login required.
router.put('/contact-messages/:id', fetchUser, async (req, res) => {
    try {
        // Only allow admin to update message status
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Admin access required" });
        }

        const { status } = req.body;

        if (!['unread', 'read', 'responded'].includes(status)) {
            return res.status(400).json({ error: "Invalid status. Must be 'unread', 'read', or 'responded'" });
        }

        const message = await ContactMessage.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ error: "Contact message not found" });
        }

        res.json({
            success: true,
            message: "Contact message status updated successfully",
            data: message
        });

    } catch (error) {
        console.error("Error updating contact message:", error);
        res.status(500).json({ error: "Failed to update contact message" });
    }
});

module.exports = router;