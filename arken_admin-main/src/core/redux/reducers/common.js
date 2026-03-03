// import constant
import {
    SET_READ_DATA,
    SET_COMMON_DATA,
} from '../constant';

const initialState = {
    serviceFee: 0
};

const initialStateCommon = {
    loader: false,
    loadersTarget: [],
    settingsData: {},
    token: ''
};

export const read = (state = initialState, action) => {
    switch (action.type) {
        case SET_READ_DATA:
            return {
                ...state,
                ...action.data
            }
        default:
            return state;
    }

}

export const common = (state = initialStateCommon, action) => {
    console.log('common action : ', action);
    switch (action.type) {
        case SET_COMMON_DATA:
            return {
                ...state,
                ...action.data
            }
        default:
            return state;
    }

}

// export default read;