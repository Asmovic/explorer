import axios from 'axios';
import { showAlert } from './alert';

const URL = 'http://localhost:3000';

export const login = async (email, password) => {
    try{
        const result = await axios({
            method: 'POST',
            url: `${URL}/api/v1/users/login`,
            data: {
                email,
                password
            }
        });
        if(result.data.status === 'success'){
            showAlert('success', 'User logged in successfully!!!');
            window.setTimeout(()=>{
                location.assign('/');
            }, 1500);
        }
    
    } catch (error){
        console.log(error.response.data.message);
        showAlert('error', error.response.data.message)
    }
}

export const logout = async (req, res) => {
    console.log('Entered Logout');
    try{
        const res = await axios({
            method: 'GET',
            url: `${URL}/api/v1/users/logout`,
        });
        console.log('data....', res);
        if(res.data.status === 'success') location.reload(true);
    } catch (err){
        console.log('error...', err);
        showAlert('error', 'Error logging user out. Try again!!!');
    }
    
}

/* eslint-disable */
/* import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    console.log('login front.')
    const res = await axios({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout'
    });
    if ((res.data.status === 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
}; */