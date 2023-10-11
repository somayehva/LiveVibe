var loginCredentials = localStorage.getItem('loginCredentials');
const eventDetailsContainer = document.querySelector('event-details-container');
const detailsDiv = document.querySelector('.details');
const eventName = document.querySelector('.event-name');
const eventLocation = document.querySelector('.event-location');
const eventDate = document.querySelector('.event-date');
const eventPrice = document.querySelector('.event-price');
const eventImg = document.querySelector('.event-img');
const eventRegistrationBtn = document.querySelector('.event-registration')
// const ticketForm = document.querySelector('.ticket-form');
const navContainer = document.querySelector('.container-fluid');
const disabledBtn = document.querySelector('.disabled-register-btn-container');
const registerEventBtn = document.querySelector('.register-event-btn');
const formFirstname = document.querySelector('#first-name');
const formLastname = document.querySelector('#last-name');
const formEmail = document.querySelector('#email');
const formEventdate = document.querySelector('#form-event-date');
const formEventLocation = document.querySelector('#form-event-location');
var userId;
var formData;
var eventDetails;
// Parse the stored data (JSON) into a JavaScript object
// formData = JSON.parse(loginCredentials);

// // Access the form input values from the local storage
// const { firstName, lastName, email, upcomingEvents } = formData;
// formLastname.value = lastName;
// formFirstname.value = firstName;
// formEmail.value = email;
// console.log("first one", eventDetails)

window.addEventListener('load', async () => {
    try {
        const res = await fetch('http://localhost:3000/checkUserLogin');
        const data = await res.json();
        if (data.message === 'true') {
            navContainer.innerHTML =
                `
                <a class="navbar-brand" href="index.html">LiveVibe</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link" href="./userProfile.html">Profile</a>
                        </li>
                        <li class="nav-item">
                             <a type="button" class="nav-link log-out">Log Out</a>
                        </li>
                    </ul>
                </div>
        `
        }
    } catch (err) {
        console.error(err)
    }
})

window.addEventListener('load', async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const eventId = params.get("eventId");
        const res = await fetch(`http://localhost:3000/getEvents/${eventId}`);
        eventDetails = await res.json();

        if (localStorage.getItem('loginCredentials') !== null) {
            formData = JSON.parse(loginCredentials);
            const { firstName, lastName, email, upcomingEvents } = formData;
            formLastname.value = lastName;
            formFirstname.value = firstName;
            formEmail.value = email;
            formEventdate.value = `${eventDetails.date.slice(0, 10)}`;
            formEventLocation.value = `${eventDetails.location.city}, ${eventDetails.location.state}`
        }




        // console.log("second one", eventDetails)
        eventName.innerText = `Artist: ${eventDetails.name}`;
        eventLocation.innerText = `Location: ${eventDetails.location.city}, ${eventDetails.location.state}`;
        eventDate.innerText = `Date: ${eventDetails.date.slice(0, 10)}`;
        if (eventDetails.price.min === 0.00 && eventDetails.price.max === 0.00) {
            eventPrice.innerHTML = `
            <ul>
            <li>General Admission: TBA </li>
            <li>VIP: TBA </li>
            <ul>
            `
            disabledBtn.innerHTML = `
            <button type="button" class="btn btn-secondary" disabled>Registration coming soon</button>
            `
        } else {
            eventPrice.innerHTML = `
            <ul>
            <li>General Admission: $${eventDetails.price.min} USD</li>
            <li>VIP: $${eventDetails.price.max} USD</li>
            <ul>
            `
            disabledBtn.innerHTML = `
            <button type="button" class="btn btn-primary edit-user mt-3 event-registration"
            data-bs-toggle="modal" data-bs-target="#exampleModal"
            data-bs-whatever="@getbootstrap">Register for this event</button>

            `
        }
        eventImg.src = eventDetails.image.url;
    }
    catch (e) {
        console.log(`this is you error somayeh: ${e}`)
    }

})

window.addEventListener('click', function (event) {
    if (event.target.classList.contains('event-registration')) {
        if (localStorage.getItem('loginCredentials') === null) {
            window.location.href = 'userLogin.html'
        }
    }
})

window.addEventListener('submit', async function (event) {
    try {
        if (event.target.classList.contains('ticket-form')) {
            formData = JSON.parse(loginCredentials);
            event.preventDefault();
            const params = new URLSearchParams(window.location.search);
            const eventId = params.get("eventId");
            userId = formData.userId;
            // const { firstName, lastName, email, userId } = formData;
            // // console.log(firstName, lastName)
            // formLastname.value = lastName;
            // const phoneNumber = formData.phoneNumber;
            // const upcomingEvents = formData.upcomingEvents;
            var ticketType;
            function displayTicketType() {
                var ticketOptionsInputs = document.querySelectorAll('.form-check-input');
                ticketOptionsInputs.forEach(ticketOption => {
                    if (ticketOption.checked) {
                        ticketType = ticketOption.value;
                    }
                })
            }
            displayTicketType()
            const ticketQty = document.getElementById('ticket-qty').value;
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    seatingOptions: ticketType,
                    ticketQty: ticketQty
                })
            }
            const res = await fetch(`/eventRegistration/${userId}/${eventId}`, config);
            user = await res.json();
            localStorage.clear();
            loginCredentials = {
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                upcomingEvents: user.upcomingEvents,
            };
            localStorage.setItem('loginCredentials', JSON.stringify(loginCredentials));
            // ticketForm.reset();
            window.location.href = 'userProfile.html';
        }
    } catch (err) {
        console.error(err)
    }
})


window.addEventListener('click', function (event) {
    try {
        if (event.target.classList.contains('log-out')) {
            fetch('http://localhost:3000/logout', {
                method: 'POST',
                credentials: 'include',
            })
                .then(response => {
                    if (response.ok) {
                        localStorage.clear();
                        navContainer.innerHTML =
                            `
                            <a class="navbar-brand" href="index.html">LiveVibe</a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                                <li class="nav-item">
                                    <a class="nav-link" href="signUp.html">Sign Up</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="userLogin.html">Log in</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link">Add Event</a>
                                </li>
                            </ul>
                            <form class="d-flex" role="search" id="search-bar">
                                <input class="form-control me-2" type="search" placeholder="Search Your Event"
                                    aria-label="Search" id="search-bar-input">
                                <button class="btn btn-outline-success" type="submit">Search</button>
                            </form>
                        </div>                
                        `
                        // Logout successful, do any necessary cleanup or redirect
                        window.location.href = 'index.html'; // Redirect to the login page
                    } else {
                        console.error('Logout failed');
                    }
                })
        }

    } catch (err) {
        console.error(err)
    }
})


{/* <div class="modal fade custom-style" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel"
aria-hidden="true">
<div class="modal-dialog">
    <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Registering for this event
            </h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal"
                aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <form id="row g-3" class="ticket-form">
                <div class="col-md-12 mb-3">
                    <label for="first-name" class="form-label">First Name</label>
                    <input type="text" class="form-control first-name" id="first-name"
                        name="first-name" disabled readonly>
                </div>
                <div class="col-md-12 mb-3">
                    <label for="last-name" class="form-label">Last Name</label>
                    <input type="text" class="form-control last-name" id="last-name"
                        name="lastName">
                </div>
                <div class="col-md-12 mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control email" id="email"
                        aria-describedby="emailHelp" name="email" disabled readonly>
                </div>
                <div class="col-12 mb-3">
                    <label for="event-name-date" class="form-label">Event Date</label>
                    <input type="text" class="form-control event-name-date"
                        id="event-name-date" name="event-name-date" disabled readonly>
                </div>
                <div class="col-12 mb-3">
                    <label for="event-location" class="form-label">Event Location</label>
                    <input type="text" class="form-control event-location"
                        id="event-location" name="event-location" disabled readonly>
                </div>
                <div class="col-12 mb-3">Choose your ticket type:
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="flexRadioDefault"
                        id="flexRadioDefault1" value="General Admission">
                    <label class="form-check-label" for="flexRadioDefault1">
                        General Admission

                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="flexRadioDefault"
                        id="flexRadioDefault2" value="VIP">
                    <label class="form-check-label" for="flexRadioDefault2">
                        VIP
                    </label>
                </div>
                <div class="form-outline mt-3">
                    <label class="form-label" for="ticket-qty">Number of Tickets</label>
                    <input type="number" id="ticket-qty" class="form-control seats"
                        name="seats">
                </div>
                <div class="modal-footer mt-3">
                    <button type="button" class="btn btn-secondary"
                        data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary update-user-submit-btn">Buy
                        Tickets</button>
                </div>
            </form>
        </div>
    </div>
</div>
</div> */}