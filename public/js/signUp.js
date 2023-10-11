const signUpForm = document.querySelector('#signup-form');
const firstNameInput = document.querySelector('#first-name');
const lastNameInput = document.querySelector('#last-name');
const emailInput = document.querySelector('#email');
const phoneNumberInput = document.querySelector('#phone-number');
const userResults = document.querySelector('.user-results');
const alertContainer = document.querySelector('#alert-container');

// var resStatus;
// var resOk;

// const errorExtraction = function (err) {
//     const error = ((JSON.parse(err.message)).message);
//     alertContainer.innerHTML =
//         ` <div class="alert alert-danger alert-dismissible fade show" role="alert">${error}!
// <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
//     loginForm.reset();
// }

const errorExtraction = function (err) {
    const error = (JSON.parse(err.message).message);
    alertContainer.innerHTML =
        ` <div class="alert alert-danger alert-dismissible fade show" role="alert">${error}!
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
    signUpForm.reset();
}

signUpForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const email = emailInput.value;
    const phoneNumber = phoneNumberInput.value;
    wretch("/userRegistration")
        .post({ firstName: firstName, lastName: lastName, email: email, phoneNumber: phoneNumber })
        .notFound(err => { errorExtraction(err) })
        .badRequest(err => errorExtraction(err))
        .unauthorized(err => errorExtraction(err))
        .forbidden(err => errorExtraction(err))
        .timeout(err => errorExtraction(err))
        .internalError(err => errorExtraction(err))
        .error(418, err => errorExtraction(err))
        .fetchError(err => errorExtraction(err))
        .json(data => {
            localStorage.clear();
            const loginCredentials = {
                userId: data.savedUser._id,
                firstName: data.savedUser.firstName,
                lastName: data.savedUser.lastName,
                email: data.savedUser.email,
                phoneNumber: data.savedUser.phoneNumber,
                upcomingEvents: data.savedUser.upcomingEvents,
            };
            localStorage.setItem('loginCredentials', JSON.stringify(loginCredentials));
            setTimeout(() => {
                window.location.href = 'userProfile.html';
            }, "1000");
            signUpForm.reset();
        })
        .catch(err => console.log(err));

})




// signUpForm.addEventListener('submit', function (event) {
//     event.preventDefault();
//     const firstName = firstNameInput.value;
//     const lastName = lastNameInput.value;
//     const email = emailInput.value;
//     const phoneNumber = phoneNumberInput.value;
//     fetch('http://localhost:3000/userRegistration', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             firstName: firstName,
//             lastName: lastName,
//             email: email,
//             phoneNumber: phoneNumber
//         })
//     })
//         .then((res) => {
//             if (!res.ok) {
//                 return Promise.reject(res);
//             }
//             return res.json();
//         })
//         .then((data) => {
//             localStorage.clear();
//             const loginCredentials = {
//                 userId: data.savedUser._id,
//                 firstName: data.savedUser.firstName,
//                 lastName: data.savedUser.lastName,
//                 email: data.savedUser.email,
//                 phoneNumber: data.savedUser.phoneNumber,
//                 upcomingEvents: data.savedUser.upcomingEvents,
//             };
//             // alertContainer.innerHTML =
//             //     ` <div class="alert alert-success alert-dismissible fade show" role="alert">${data.message}!</div>`
//             localStorage.setItem('loginCredentials', JSON.stringify(loginCredentials));
//             setTimeout(() => {
//                 window.location.href = 'userProfile.html';
//             }, "1000");
//             signUpForm.reset();
//         })
//         .catch((res) => {
//             res.json()
//                 .then((data) => {
//                     alertContainer.innerHTML =
//                         ` <div class="alert alert-danger alert-dismissible fade show" role="alert">${data.message}!
//                 <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
//                     signUpForm.reset();
//                 });
//         });
// })
