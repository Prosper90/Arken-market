// import constant
import {
    SET_READ_DATA,
    SET_COMMON_DATA
} from '../constant/';
import config from '../../config/';

export const ReadDataSave = (dispatch, data) => {
    try {
        dispatch({
            type: SET_READ_DATA,
            data
        })
        return true
    } catch (err) {
        return false
    }
}

export const CommonDataSave = (dispatch, newData, oldData) => {
    const data = {
        ...oldData,
        ...newData
    }
    if(data.loader === true) {
        data.loadersTarget.push(data.loaderTargetVal)
    } else {
        const index = data.loadersTarget.findIndex(e => e === data.loaderTargetVal);
        if(index > -1) {
            delete data.loadersTarget[index]
            data.loadersTarget = data.loadersTarget.filter((a) => a);
        }
    }
    try {
        dispatch({
            type: SET_COMMON_DATA,
            data
        })
        return true
    } catch (err) {
        return false
    }
}

export const onError = async (e) => {
    // return e.target.src = 'http://localhost:2053/imgLoad.png';
    return e.target.src = config.API_URL+'/imgLoad.png';
}