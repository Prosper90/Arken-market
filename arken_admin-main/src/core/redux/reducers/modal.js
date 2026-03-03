// import constant
import {
    OPEN_CONNECT_WALLET,
    CLOSE_CONNECT_WALLET,
} from '../constant';

const initialState = {
    isConnetWallet: false,
};

const modal = (state = initialState, action) => {
    switch (action.type) {
        case OPEN_CONNECT_WALLET:
            return {
                ...state,
                isConnetWallet: action.isConnetWallet
            };
        case CLOSE_CONNECT_WALLET:
            return {
                ...state,
                isConnetWallet: action.isConnetWallet
            };
        default:
            return state;
    }

}

export default modal;