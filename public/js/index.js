import '@babel/polyfill';

import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateAccountDetails } from './updateAccount';

const mapBox = document.getElementById('map');
const loginForm = document.getElementById('loginForm');
const logoutButton = document.querySelector('.nav__el--logout');
const updateDetailsForm = document.querySelector('.form.form-user-data');
const passwordForm = document.querySelector('.form.form-user-settings');

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
    e.preventDefault();

    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const photo = document.getElementById('photo').files[0];

    const form = new FormData();
    form.append('name', name);
    form.append('email', email);
    form.append('photo', photo);

    updateAccountDetails(form, 'details');
  });
}

if (passwordForm) {
  passwordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const password = document.getElementById('password').value;
    await updateAccountDetails(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    document.getElementById('password-current').value = '';
    document.getElementById('password-confirm').value = '';
    document.getElementById('password').value = '';
  });
}
