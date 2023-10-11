const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userRegistrationSchema = new mongoose.Schema({
    // User schema fields...
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    upcomingEvents: [{
        eventId: {
            type: String,
            required: false
        },
        eventName: {
            type: String,
            required: false
        },
        eventDate: {
            type: Date,
            required: false
        },
        eventLocation: {
            type: Object,
            required: false,
        },
        eventCost: {
            type: String,
            required: false
        },
    }]
});
// Add the passportLocalMongoose plugin with the usernameField option set to 'email'
userRegistrationSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', userRegistrationSchema);
