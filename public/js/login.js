import axios from 'axios';
import { showAlert } from './alert';


export const login = async (email, password) => {
    try{
        const result = await axios({
            method: 'POST',
            url: `/api/v1/users/login`,
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
    try{
        const res = await axios({
            method: 'GET',
            url: `/api/v1/users/logout`,
        });

        if(res.data.status === 'success') location.reload(true);
    } catch (err){
        console.log('error...', err);
        showAlert('error', 'Error logging user out. Try again!!!');
    }
    
}

/* eslint-disable */
/* import axios from 'axios';
import { showAlert } from './alert';

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:/api/v1/users/logout'
    });
    if ((res.data.status === 'success')) location.reload(true);
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
}; */