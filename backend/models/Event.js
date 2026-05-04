const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventSchema = new Schema({
    title: {
        type: String,   
        required: true
    },
    description: {
        type: String,
        required: true
    },  
    date: {
        type: Date,
        required: true
    },
    location: { 
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    }
});

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;