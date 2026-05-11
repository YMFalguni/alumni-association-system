const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
    sender: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Alumni',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'responded'],
        default: 'unread'
    },
    referenceId: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

ContactMessageSchema.index({ 'sender.id': 1, createdAt: -1 });
ContactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);