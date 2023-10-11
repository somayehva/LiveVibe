const loginForm = document.querySelector('#login-form');
const lastNameInput = document.querySelector('#last-name');
const emailInput = document.querySelector('#email');
const alertContainer = document.querySelector('#alert-container');

const errorExtraction = function (err) {
    const error = (JSON.parse(err.message).message);
    alertContainer.innerHTML =
        ` <div class="alert alert-danger alert-dismissible fade show" role="alert">${error}!
<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    loginForm.reset();
}



loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const lastName = lastNameInput.value;
    const email = emailInput.value;
    wretch("/userLogin")
        .post({ lastName: lastName, email: email })
        .notFound(err => { errorExtraction(err) })
        .badRequest(err => errorExtraction(err))
        .unauthorized(err => errorExtraction(err))
        .forbidden(err => errorExtraction(err))
        .timeout(err => errorExtraction(err))
        .internalError(err => errorExtraction(err))
        .error(418, err => errorExtraction(err))
        .fetchError(err => errorExtraction(err))
        .json(result => {
            localStorage.clear();
            const loginCredentials = {
                userId: result.foundUser._id,
                firstName: result.foundUser.firstName,
                lastName: result.foundUser.lastName,
                email: result.foundUser.email,
                phoneNumber: result.foundUser.phoneNumber,
                upcomingEvents: result.foundUser.upcomingEvents.map(userEvent => {
                    return {
                        eventId: userEvent.eventId,
                        eventName: userEvent.eventName,
                        eventDate: userEvent.eventDate
                    }
                })
            };
            localStorage.setItem('loginCredentials', JSON.stringify(loginCredentials));
            window.location.href = 'userProfile.html';
            loginForm.reset();
        })
        .catch(err => console.log(err));

})

// loginForm.addEventListener('submit', (event) => {
//     event.preventDefault();
//     const lastName = lastNameInput.value;
//     const email = emailInput.value;

//     fetch('http://localhost:3000/userLogin', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         credentials: 'include',
//         body: JSON.stringify({
//             lastName: lastName,
//             email: email
//         })
//     })
//         .then(function (res) {
//             if (!res.ok) {
//                 return Promise.reject(res);
//             }
//             return res.json();
//         })
//         .then((result) => {
//             localStorage.clear();
//             const loginCredentials = {
//                 userId: result.foundUser._id,
//                 firstName: result.foundUser.firstName,
//                 lastName: result.foundUser.lastName,
//                 email: result.foundUser.email,
//                 phoneNumber: result.foundUser.phoneNumber,
//                 upcomingEvents: result.foundUser.upcomingEvents.map(userEvent => {
//                     return {
//                         eventId: userEvent.eventId,
//                         eventName: userEvent.eventName,
//                         eventDate: userEvent.eventDate
//                     }
//                 })
//             };
//             localStorage.setItem('loginCredentials', JSON.stringify(loginCredentials));
//             window.location.href = 'userProfile.html';
//             loginForm.reset();

//         })
//         .catch((res) => {
//             res.json()
//                 .then((data) => {
//                     alertContainer.innerHTML =
//                         ` <div class="alert alert-danger alert-dismissible fade show" role="alert">${data.message}!
//                     <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
//                     loginForm.reset();
//                 });
//         });
// })
