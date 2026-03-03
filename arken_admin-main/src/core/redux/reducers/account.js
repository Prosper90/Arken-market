// import constant
import {
    SET_ACCOUNT_CONNECT_WALLET,
} from '../constant';

const initialState = {
    isWalletConn: false,
    token: ''
};

const account = (state = initialState, action) => {
    switch (action.type) {
        case SET_ACCOUNT_CONNECT_WALLET:
            return {
                ...state,
                ...action.data
            }
        default:
            return state;
    }

}

export default account;