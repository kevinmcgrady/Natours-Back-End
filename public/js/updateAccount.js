import axios from 'axios';
import { showAlert } from './alerts';

const submitButton = document.querySelector('.form-user-data .btn--green');
const passwordSubmitButton = document.querySelector(
  '.form-user-settings .btn--green',
);

const spinner = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;

export const updateAccountDetails = async (data, type) => {
  const button = type === 'password' ? passwordSubmitButton : submitButton;
  try {
    const url = type === 'password' ? 'update-password' : 'update-me';
    button.innerHTML = spinner;
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${url}`,
      data,
    });
    button.innerHTML = 'Save settings';

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated`);
    }
  } catch (error) {
    button.innerHTML = 'Save settings';
    showAlert('error', error.response.data.message);
  }
};
