const loginCredentials = localStorage.getItem('loginCredentials');
const userDetailsDiv = document.querySelector('.user-details');
const spanName = document.querySelector('.username-span');
const userFirstName = document.querySelector('.first-name');
const userLastName = document.querySelector('.last-name');
const userEmail = document.querySelector('.email');
const userPhoneNumber = document.querySelector('.phone-number');
const userUpcomingEvents = document.querySelector('.upcoming-events');
const updateForm = document.querySelector('#update-form');
const updateUserSubmitBtn = document.querySelector('.update-user-submit-btn');
const navContainer = document.querySelector('.container-fluid');
const alertContainer = document.querySelector('.alert-container');
var userId;
var formData;

formData = JSON.parse(loginCredentials);
const { firstName, lastName, email, phoneNumber, upcomingEvents } = formData;
spanName.textContent = `${firstName} ${lastName}`;
userFirstName.value = firstName;
userLastName.value = lastName;
userEmail.value = email;
userPhoneNumber.value = phoneNumber;
if (!upcomingEvents || !upcomingEvents.length) {
    userUpcomingEvents.textContent = "You have NO upcoming events";
}
else {
    userUpcomingEvents.textContent = "";
    upcomingEvents.forEach(event => {
        const eventDetails =
            `<p class="mt-3">${event.eventName}, Date: ${event.eventDate.slice(0, 10)}</p>
            <button class="btn btn-secondary details-btn" data-event-id=${event.eventId}>Learn more</button>
        <button class="btn btn-danger delete-btn" data-event-id=${event.eventId}>Delete Event</button>`
        userUpcomingEvents.innerHTML += `<li>${eventDetails}</li>`;
    });
}


// check user status/login
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
                            <a type="button" class="nav-link log-out">Log Out</a>
                        </li>
                        <li class="nav-item">
                        <a type="button" class="nav-link edit-user" data-bs-toggle="modal"
                        data-bs-target="#exampleModal" data-bs-whatever="@getbootstrap">Edit Profile</a>
                        </li>
                    </ul>
                </div>
        `
        }
    } catch (err) {
        console.error(err)
    }
})



// event for either "more details" or "delete event"
userUpcomingEvents.addEventListener('click', function (event) {
    try {
        if (event.target.classList.contains('details-btn')) {
            const eventId = event.target.getAttribute('data-event-id');
            fetch(`http://localhost:3000/getEvents/${eventId}`)
                .then((res) => {
                    if (!res.ok) {
                        return Promise.reject(res);
                    }
                    return res.json();
                })
                .then(function (eventDetails) {
                    eventName.innerText = `Name: ${eventDetails.name}`;
                    eventLocation.innerText = `Location: ${eventDetails.location.city}, ${eventDetails.location.state}`;
                    eventDate.innerText = `Date: ${eventDetails.date.slice(0, 10)}`;
                    eventPrice.innerText = `Price Range from: $${eventDetails.price.min} USD to $${eventDetails.price.max} USD`;
                })
            window.location.href = `eventDetails.html?eventId=${eventId}`;

        } else if (event.target.classList.contains('delete-btn')) {
            const eventId = event.target.getAttribute('data-event-id');
            userId = formData.userId;
            fetch(`http://localhost:3000/eventDelete/${userId}/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((res) => {
                    if (!res.ok) {
                        return Promise.reject(res);
                    }
                    return res.json();
                })
                .then(function (result) {
                    localStorage.clear();
                    const loginCredentials = {
                        userId: result.user._id,
                        firstName: result.user.firstName,
                        lastName: result.user.lastName,
                        email: result.user.email,
                        phoneNumber: result.user.phoneNumber,
                        upcomingEvents: result.user.upcomingEvents,
                    };
                    localStorage.setItem('loginCredentials', JSON.stringify(loginCredentials));
                    if (!result.user.upcomingEvents || !result.user.upcomingEvents.length) {
                        userUpcomingEvents.textContent = "You have NO upcoming events";
                    }
                    else {
                        userUpcomingEvents.textContent = "";
                        result.user.upcomingEvents.forEach(event => {
                            const eventDetails =
                                `<p>Event: ${event.eventName}, Date: ${event.eventDate}</p>
                        <button class="btn btn-secondary details-btn" data-event-id=${event.eventId}>Learn more</button>
                        <button class="btn btn-danger delete-btn" data-event-id=${event.eventId}>Delete Event</button>`
                            userUpcomingEvents.innerHTML += `<li>${eventDetails}</li>`;
                        });
                    }
                })
        }

    } catch (err) {
        console.log(err)
    }

})

updateForm.addEventListener('submit', function (event) {
    const formData = JSON.parse(loginCredentials);
    userId = formData.userId;
    event.preventDefault();
    const firstName = userFirstName.value;
    const lastName = userLastName.value;
    const email = userEmail.value;
    const phoneNumber = userPhoneNumber.value;
    fetch(`http://localhost:3000/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            email: email,
            phoneNumber: phoneNumber
        })
    })
        .then((res) => {
            if (!res.ok) {
                return Promise.reject(res);
            }
            return res.json();
        })
        .then((result) => {
            localStorage.clear();
            const loginCredentials = {
                userId: result.updatedUser._id,
                firstName: result.updatedUser.firstName,
                lastName: result.updatedUser.lastName,
                email: result.updatedUser.email,
                phoneNumber: result.updatedUser.phoneNumber,
                upcomingEvents: result.updatedUser.upcomingEvents,
            };
            localStorage.setItem('loginCredentials', JSON.stringify(loginCredentials));
            setTimeout(() => {
                window.location.href = 'userProfile.html';
            }, "1000");
            updateForm.reset();
            if (!result.updatedUser.upcomingEvents || !result.updatedUser.upcomingEvents.length) {
                userUpcomingEvents.textContent = "You have NO upcoming events";
            }
            else {
                userUpcomingEvents.textContent = "";
                // Display each upcoming event individually
                result.updatedUser.upcomingEvents.forEach(event => {
                    const eventDetails = `Event Name: ${event.eventName}, Date: ${event.eventDate}`;
                    userUpcomingEvents.innerHTML += `<li>${eventDetails}</li>`;
                });
            }
        })
        .catch((res) => {
            res.json()
                .then((result) => {
                    alertContainer.innerHTML =
                        ` <div class="alert alert-danger alert-dismissible fade show" role="alert">${result.message}!
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
                    updateForm.reset();
                });
        });
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