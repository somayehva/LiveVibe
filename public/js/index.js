const eventContainer = document.querySelector('.row');
const learnMoreBtn = document.querySelectorAll('.learn-more-btn');
const searchBar = document.querySelector('#search-bar');
const searchBarinput = document.querySelector('#search-bar-input');
const flashDisplay = document.querySelector('.flash-display');
const navContainer = document.querySelector('.container-fluid');

// check user status/login
window.addEventListener('load', async () => {
    try {
        const res = await fetch('/checkUserLogin');
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
                    <form class="d-flex" role="search" id="search-bar">
                        <input class="form-control me-2" type="search" placeholder="Search Your Event" aria-label="Search"
                            id="search-bar-input">
                        <button class="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </div>
        `
        }
    } catch (err) {
        console.error(err)
    }
})


// load all the events
window.addEventListener("load", async () => {
    try {
        searchBarinput.value = ''
        const res = await fetch('/getEvents');
        const allEvents = await res.json();
        const newArrayEvents = allEvents.reduce((uniqueEvents, event) => {
            const eventName = event.name;
            if (!uniqueEvents.some(existingEvent => existingEvent.name === eventName)) {
                uniqueEvents.push(event);
            }
            return uniqueEvents;
        }, []);
        newArrayEvents.forEach(event => {
            eventContainer.innerHTML +=
                `<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
            <div class="card h-100">
                <img src="${event.image.url}" alt="" class="card-img-top img-fit">
                <div class="card-body">
                    <h5 class="card-title h-50">${event.name}</h5>
                    <p class="card-text"><i class="bi bi-calendar"></i> ${event.date}</p>
                    <p class="card-text text-muted event-location event-location-grey"><i class="bi bi-geo-alt"></i>
                        ${event.location.city}, ${event.location.state}</p>
                    <div class="text-end">
                        <a href="eventDetails.html?eventId=${event.id}" class="btn btn-outline-primary learn-more-btn btn-sm"
                            data-event-id=${event.id}>Learn more</a>
                    </div>
                </div>
            </div>
        </div>`
        })
    } catch (err) {
        console.error(err)
    }
});


// searchBar event
// i need to use reduce just bc once i search and click on a desired event and then when i come back and delete the searchBar value it will display all the similar events as well, unless i could clear the searchBar value;which i cant apparanetally lol
searchBar.addEventListener('keyup', async (e) => {
    try {
        const searchString = e.target.value.toLowerCase();
        const res = await fetch('/getEvents');
        const allEvents = await res.json();
        const newArrayEvents = allEvents.reduce((uniqueEvents, event) => {
            const eventName = event.name;
            if (!uniqueEvents.some(existingEvent => existingEvent.name === eventName)) {
                uniqueEvents.push(event);
            }
            return uniqueEvents;
        }, []);

        const filteredEvents = newArrayEvents.filter((singleEvent) => {
            return (
                singleEvent.name.toLowerCase().includes(searchString)
            )
        })
        eventContainer.innerHTML = '';
        filteredEvents.forEach((singleEvent) => {
            eventContainer.innerHTML +=
                `<div class="col-lg-3 col-md-4 col-sm-6 ">
                    <div class="card h-100">
                    <img src="${singleEvent.image.url}" alt=""
                        class="card-img-top img-fit">
                    <div class="card-body">
                        <h5 class="card-title h-50">${singleEvent.name}</h5>
                        <p class="card-text"><i class="bi bi-calendar"></i> ${singleEvent.date}</p>
                        <p class="card-text text-muted event-location"><i class="bi bi-geo-alt"></i> ${singleEvent.location.city}, ${singleEvent.location.state}</p>
                        <div class="text-end">
                            <a href="eventDetails.html?eventId=${singleEvent.id}" class="btn btn-outline-primary learn-more-btn btn-sm" data-event-id=${singleEvent.id}>Learn more</a>
                        </div>
                    </div>
                    </div>
                    </div>`
        })
    } catch (err) {
        console.error(err)
    }
})


// log out
window.addEventListener('click', async function (event) {
    try {
        if (event.target.classList.contains('log-out')) {
            const res = await fetch('/logout', {
                method: 'POST',
                credentials: 'include',
            })
            if (res.ok) {
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
                window.location.href = 'index.html';
            } else {
                console.error('Logout failed');
            }
            // })
        }

    } catch (err) {
        console.error(err)
    }
})