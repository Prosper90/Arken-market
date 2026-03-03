// import config
import axios from './axios';

export const respChanges = (data) => {
    if(data.success === true) {
        data.status = 'success';
    }else if(data.success === false) {
        data.status = 'error'
    }

    if(typeof data.error == 'undefined') {
        data.error = {}
    }
    return data;
}
