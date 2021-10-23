import axios from 'axios';
import { showAlert } from './alert';
const URL = 'http://localhost:3000';


// - type is either 'password' || 'data'
export const updateSettings = async (data, type)=>{
    try{
        let res='';
        if(type === 'data'){
            res = await axios({
                method: 'PATCH',
                headers: data.getHeaders(),
                url: `${URL}/api/v1/users/updateMe`,
                data
            })
        }else{
            res = await axios({
                method: 'PATCH',
                url: `${URL}/api/v1/users/updateMyPassword`,
                data
            })
        }
       
        if(res.data.status === 'success'){
            console.log('updating.... showAlert')
            showAlert('success', `${type.toUpperCase()} updated successfully!!!`);
        }
    }catch(error){
        showAlert('error', error.response.data.message);
    }
}