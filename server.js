const express = require('express');
const app = express();
const fetch = require("node-fetch");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./models/users');
const passport = require('passport');
const localStrategy = require('passport-local');
const flash = require('connect-flash');
const mongoStore = require('connect-mongo');
require('dotenv').config();
// console.log(process.env) // remove this after you've confirmed it is working

const apiUrl = `https://app.ticketmaster.com/discovery/v2/events.json?classificationName=music&dmaId=324&apikey=${process.env.TICKETMASTER_API_KEY}`;

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'my-secret',  // a secret string used to sign the session ID cookie
    resave: false,  // don't save session if unmodified thats for true
    saveUninitialized: false,  // don't create session until something stored
    store: mongoStore.create({
        mongoUrl: `mongodb://${process.env.MONGODB_HOSTNAME}:${process.env.MONGODB_PORT}/concert-app`,
    })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// here we are saying we want you to use localStrategy that we downloaded;
// and with the local stra the auth is going to be on the User model
passport.use(new localStrategy({
    usernameField: 'email'
}, User.authenticate()));

passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});


const isLoggedIn = function (req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/userLogin');
    }
    next();
}


const storeReturnTo = function (req, res, next) {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

mongoose.connect(`mongodb://${process.env.MONGODB_HOSTNAME}:${process.env.MONGODB_PORT}/concert-app`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
    })
    .catch((error) => {
        console.error('Error connecting to the database:', error);
    });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


function desiredImage(image) {
    return image.ratio === "16_9" && image.width === 640 && image.height === 360
}

app.get('/checkUserLogin', (req, res) => {
    if (req.isAuthenticated()) {
        res.send({ message: 'true' })
    } else {
        res.send({ message: 'false' })
    }
})


// landing page
app.get('/getEvents', async (req, res) => {
    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const concerts = await response.json();
            const events = concerts._embedded.events.map(event => {
                return {
                    id: event.id,
                    name: event.name,
                    date: event.dates.start.localDate,
                    location:
                    {
                        city: event._embedded.venues[0].city.name,
                        state: event._embedded.venues[0].state.stateCode
                    },
                    price: {
                        min: (event.priceRanges && event.priceRanges[0]) ? event.priceRanges[0].min : 0.00,
                        max: (event.priceRanges && event.priceRanges[0]) ? event.priceRanges[0].max : 0.00
                    },
                    image: {
                        url: (event.images.find(desiredImage)).url
                    }
                };
            });
            res.send(events);
        } else {
            res.status(response.status).send(`Error: ${response.statusText}`);
        }
    } catch (e) {
        res.status(400).send(`Error: ${e}`);
    }
});




// details page for each event
app.get('/getEvents/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${process.env.TICKETMASTER_API_KEY}`);
        if (response.ok) {
            const event = await response.json();
            const concertDetails = {
                id: event.id,
                // url: event.url,
                name: event.name,
                date: event.dates.start.dateTime,
                location:
                {
                    city: event._embedded.venues[0].city.name,
                    state: event._embedded.venues[0].state.stateCode,
                    venues: event._embedded.venues.map(venue => {
                        return {
                            name: venue.name
                        }
                    })
                },
                price: {
                    min: (event.priceRanges && event.priceRanges[0]) ? event.priceRanges[0].min : 0.00,
                    max: (event.priceRanges && event.priceRanges[0]) ? event.priceRanges[0].max : 0.00
                },
                image: {
                    url: (event.images.find(desiredImage)).url

                }
            };
            res.send(concertDetails)
        }
    } catch (e) {
        res.status(400).send(`Error: ${e}`)
    }
})

// creating new user
app.post('/userRegistration', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber } = req.body;
        const matchingUsers = await User.findOne({ email: email })
        if (matchingUsers) {
            res.status(403).json({ message: 'User Already Exists' });
        } else {
            const savedUser = await User.create({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: phoneNumber
            })
            // Log the user in to initiate the session
            req.login(savedUser, (err) => {
                if (err) {
                    console.error('Error logging in user:', err);
                    return res.status(500).json({ message: 'Failed to sign up the user' });
                }
                res.status(200).json({ message: 'User registered and logged in successfully', savedUser });
            });
        }
    }
    catch (e) {
        res.status(400).send(`Error: ${e}`)
    }
});


// User log in
app.post('/userLogin', async (req, res) => {
    try {
        const { email, lastName } = req.body;
        const foundUser = await User.findOne({ email, lastName });
        if (!foundUser) {
            return res.status(404).json({ message: 'User Not Found' });
        }
        // Use Passport's req.login() to initiate the session for the found user
        req.login(foundUser, (err) => {
            if (err) {
                console.error('Error logging in user:', err);
                return res.status(500).json({ message: 'Failed to log in user' });
            }
            res.status(200).json({ message: 'User logged in successfully', foundUser: foundUser });
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(400).send(`Error: ${error}`);
    }
});



// registering for an event for a specific user
app.post('/eventRegistration/:userId/:eventId', async (req, res) => {
    try {
        var concertDetails = {};
        var totalCost;
        const userId = req.params.userId;
        const eventId = req.params.eventId;
        const user = await User.findById(userId);
        const eventResponse = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=${process.env.TICKETMASTER_API_KEY}`)
        if (eventResponse.ok) {
            const event = await eventResponse.json();
            concertDetails = {
                id: event.id,
                name: event.name,
                date: event.dates.start.dateTime,
                location:
                {
                    city: event._embedded.venues[0].city.name,
                    state: event._embedded.venues[0].state.stateCode,
                    venues: event._embedded.venues.map(venue => {
                        return {
                            name: venue.name
                        }
                    })
                },
                price: {
                    min: event.priceRanges[0].min,
                    max: event.priceRanges[0].max
                }
            };
        }
        const numberOfSeats = req.body.ticketQty;
        const seatingOptions = req.body.seatingOptions;
        if (seatingOptions === "General Admission") {
            totalCost = (concertDetails.price.min) * numberOfSeats
        } else if (seatingOptions === "VIP") {
            totalCost = (concertDetails.price.max) * numberOfSeats
        }
        const userEvent = {
            eventId: concertDetails.id,
            eventName: concertDetails.name,
            eventDate: concertDetails.date,
            eventLocation: concertDetails.location,
            eventCost: `Total Cost: $${Math.round(totalCost)} USD for ${numberOfSeats} seat(s) for ${seatingOptions}`
        };
        user.upcomingEvents.push(userEvent);
        user.save();
        res.send(user)
    } catch (e) {
        res.status(400).send(`Error: ${e}`);

    }
})

// updating a user info
app.put('/:userId', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber } = req.body;
        const updatingUser = await User.findByIdAndUpdate(req.params.userId, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNumber: phoneNumber
        })
        const updatedUser = await User.findById(req.params.userId)
            .then(updatedUser => {
                res.status(200).json({ message: 'User updated successfully', updatedUser });
            })
            .catch(error => {
                console.error('Error updating user:', error);
                res.status(500).json({ error: 'Internal server error' });
            });
    }
    catch (e) {
        res.status(400).send(`Error: ${e}`)
    }
})


// deleting an event for a sepecific user
app.delete('/eventDelete/:userId/:eventId', async (req, res) => {
    const userId = req.params.userId;
    const eventId = req.params.eventId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const eventResponse = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=${process.env.TICKETMASTER_API_KEY}`);
        if (!eventResponse.ok) {
            return res.status(404).json({ message: 'Event is no longer available' });
        }
        // Find the index of the event in the user's upcomingEvents array
        const eventIndex = user.upcomingEvents.findIndex((e) => e.eventId === eventId);
        if (eventIndex === -1) {
            return res.status(404).json({ message: 'Event not found in user\'s upcoming events' });
        }
        user.upcomingEvents.splice(eventIndex, 1);
        await user.save();
        res.status(200).json({ message: 'Event successfully deleted', user });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err) }
        req.session.destroy((err) => {
            res.clearCookie('connect.sid');
            res.sendStatus(200)
        });
    });
});



app.listen(`${process.env.SERVER_PORT}`, () => {
    console.log(`Server is listening on port ${process.env.SERVER_PORT}`);
});




