import axios from './axios';
import { respChanges } from './responseModify';
import { env } from './envconfig';
const backendHost = env.apiHost2

export const getMethod = async (data) => {
    try {
        
        let respData = await axios({
            'method': 'get',
            'url': backendHost+data.apiUrl
        });
        return respChanges(respData.data);
    }
    catch (err) {
        return {
            status: 'error',
            message: err.response.data.message,
            error: err.response.data.errors
        }
    }
}

export const postMethod = async (data) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': backendHost+data.apiUrl,
            data: data.payload ? data.payload : {}
        });
        return respChanges(respData.data);
    }
    catch (err) {
        return {
            status: 'error',
           message: err.response.data.message,
            error: err.response.data.errors
        }
    }
}

export const fileUpload = async (data) => {
    try {
        const config = {
            headers: {
              "content-type": "multipart/form-data",
            },
          };
        let respData = await axios({
            'method': 'post',
            'url': data.apiUrl,
            data: data.payload ? data.payload : {}
        });
        return respChanges(respData.data);
    }
    catch (err) {
        return {
            status: 'error',
            message: err.response.data.message,
            error: err.response.data.errors
        }
    }
}

