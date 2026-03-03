// import constant
import {
    OPEN_CONNECT_WALLET,
    CLOSE_CONNECT_WALLET,
} from '../constant';

export const openConnectWallet = (dispatch) => {
    dispatch({
        type: OPEN_CONNECT_WALLET,
        isConnetWallet: true
    })
    return true
}

export const closeConnectWallet = (dispatch) => {
    dispatch({
        type: CLOSE_CONNECT_WALLET,
        isConnetWallet: false
    })
    return true
}