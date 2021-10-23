/* eslint-disable */
import axios from 'axios';
const stripe = Stripe('pk_test_51JmMF0DH2H6rPT87fhVzUJndhWdOfDDSpPJbcksx2G212bMRXN9bLP26QXdjaHULisisnUJUDzNcXIUOZvIQQfYt00xc4RNtcz');

const URL = 'http://localhost:3000';

export const bookTour = async (tourId)=>{
    // Get checkout session from API
    const session = await axios(`${URL}/api/v1/bookings/checkout-session/${tourId}`)

    console.log('session', session);

    // Create checkout form + charge card
}