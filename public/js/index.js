import '@babel/polyfill';

import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateAccountDetails } from './updateAccount';

const mapBox = document.getElementById('map');
const loginForm = document.getElementById('loginForm');
const logoutButton = document.querySelector('.nav__el--logout');
const updateDetailsForm = document.querySelector('.form.form-user-data');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  // Event listener on login form.
  loginForm.addEventListener('submit', e => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    e.preventDefault();
    login(email, password);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', e => {
    logout();
  });
}

if (updateDetailsForm) {
  updateDetailsForm.addEventListener('submit', e => {
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    e.preventDefault();
    updateAccountDetails(name, email);
  });
}
