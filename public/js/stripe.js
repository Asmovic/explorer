/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe('pk_test_51JmMF0DH2H6rPT87fhVzUJndhWdOfDDSpPJbcksx2G212bMRXN9bLP26QXdjaHULisisnUJUDzNcXIUOZvIQQfYt00xc4RNtcz');


export const bookTour = async (tourId)=>{
    try{
         // Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // Create checkout form + charge card
    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    })
    } catch(err){
        showAlert('error', err.message);
    }
   
}