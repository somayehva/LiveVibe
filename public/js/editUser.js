const updatingForm = document.querySelector('#updating-form');
const firstNameInput = document.querySelector('#first-name');
const lastNameInput = document.querySelector('#last-name');
const emailInput = document.querySelector('#email');
const phoneNumberInput = document.querySelector('#phone-number');
// const userResults = document.querySelector('.user-results');
const alertContainer = document.querySelector('.alert-container');
// var resStatus;
// var resOk;

updatingForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const email = emailInput.value;
    const phoneNumber = phoneNumberInput.value;
    fetch('http://localhost:3000/:userId', {
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
        .then((data) => {
            localStorage.clear();
            const userFormData = {
                firstName,
                lastName,
                email,
                phoneNumber
            };
            alertContainer.innerHTML =
                ` <div class="alert alert-success alert-dismissible fade show" role="alert">${data.message}!</div>`
            localStorage.setItem('userFormData', JSON.stringify(userFormData));
            setTimeout(() => {
                window.location.href = 'userProfile.html';
            }, "1000");

            updatingForm.reset();
        })
        .catch((res) => {
            res.json()
                .then((data) => {
                    alertContainer.innerHTML =
                        ` <div class="alert alert-danger alert-dismissible fade show" role="alert">${data.message}!
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
                    updatingForm.reset();
                });
        });
})