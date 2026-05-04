const express = require("express");
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const isAdmin = require('../middleware/isAdmin');
const Event = require("../models/Event");
const { body, validationResult } = require("express-validator");

// ROUTE 1: Fetch all events using: GET "/api/events/fetchall". Login required.
router.get('/fetchall', fetchUser, async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Add a new event using: POST "/api/events/addevent". Admin only.
router.post('/addevent', [fetchUser, isAdmin], [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 }),
    body('date', 'Enter a valid date').isISO8601().toDate(),
    body('location'),
    body('capacity')
], async (req, res) => {
    try {
        const { title, description, date, location, capacity } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const event = new Event({
            title, description, date, location, capacity: parseInt(req.body.capacity)
        });
        const savedEvent = await event.save();
        res.json(savedEvent);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Delete an event using: DELETE "/api/events/deleteevent/:id". Admin only.
router.delete('/deleteevent/:id', [fetchUser, isAdmin], async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) { return res.status(404).send("Not Found") }

        event = await Event.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Event has been deleted", event: event });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;