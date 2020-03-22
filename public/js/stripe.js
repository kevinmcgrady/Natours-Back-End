import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_N2rdcLrx88IyOMsw3ODYj7fO00uI2cDlEu');

export const bookTour = async tourId => {
  const spinner = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;
  const button = document.getElementById('book-tour');

  try {
    button.innerHTML = spinner;
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
    );

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });

    button.innerHTML = 'BOOK TOUR NOW!';
  } catch (error) {
    button.innerHTML = 'BOOK TOUR NOW!';
    showAlert('error', 'error');
  }

  console.log(session);
};
