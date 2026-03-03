// import packages
import axios from 'axios';

// import lib
import { link } from '../config/index';
import { getAuthToken } from '../lib/localStorage'
console.log( link.apiService.main," link.apiService.main")
axios.defaults.baseURL = link.apiService.main;
axios.defaults.headers.common['Authorization'] = getAuthToken();

export const setAuthorization = (token) => {
    axios.defaults.headers.common['Authorization'] = "Bearer "+token;
}

export const removeAuthorization = () => {
    delete axios.defaults.headers.common["Authorization"];
}

export const handleResp = (respData, type = 'success') => {
    try {
        if (type == 'success' && respData && respData.data) {
            return respData.data
        } else if (type == 'error' && respData && respData.response && respData.response.data) {
            return respData.response.data
        } else {
            return {
                'status': 'FAILED',
                'message': 'Something went wrong'
            }
        }
    } catch (err) {
        return {
            'status': 'FAILED',
            'message': 'Something went wrong'
        }
    }
}

export default axios;
