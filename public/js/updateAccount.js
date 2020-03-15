import axios from 'axios';
import { showAlert } from './alerts';

export const updateAccountDetails = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:8000/api/v1/users/update-me',
      data: {
        name,
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account updated');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
