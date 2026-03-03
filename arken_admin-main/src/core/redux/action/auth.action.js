// import package
// import jwt from "jsonwebtoken";

// import config
import * as config from '../../config/';

// import lib
import { getAuthToken } from '../../lib/localStorage';
import { isEmpty } from '../../lib/typeCheck';
import { toastAlert } from '../../lib/toastAlert';

export const isLogin = () => {
    let token = getAuthToken();
    if (!isEmpty(token)) {
        return true
    }
    return false;
}

export const decodeJwt = (token) => {
    // try {
    //     if (!isEmpty(token)) {
    //         token = token.replace('Bearer ', '')
    //         const decoded = jwt.verify(token, SECRET_KEY.JWT);
    //         if (decoded) {
    //             return {
    //                 status: true
    //             }
    //         }
    //         return {
    //             status: false
    //         }
    //     }
    // } catch (err) {
    //     return {
    //         status: false
    //     }
    // }
}

export const isLoginNew = () => {
    // let token = getAuthToken();
    // if (!isEmpty(token)) {
    //     const jwtData = decodeJwt(token);
    //     if (jwtData.status) {
    //         return jwtData.memberType;
    //     }
    //     return false;
    // }
    return false;
}

export const isLoginChk = async (isAlert = true, data = {}) => {
    try {
        if (isLogin()) {
            return true;
        } else if (isAlert) {
            if(data.alertShow) {
                toastAlert('warning', "Please login and continue", 'userForm')
            }
            return false;
        } else {
            return false;   
        }
    } catch (err) {
        console.log('err : ', err);
        return false;
    }
}

export const isLoginCheck = async (data = {}) => {
    try {
        if (isLogin()) {
            return true;
        } else if (data.alertShow) {
            toastAlert('warning', "Please login and continue", 'isLoginCheck '+new Date())
            return false;
        } else {
            return false;   
        }
    } catch (err) {
        console.log('err : ', err);
        return false;
    }
}

export const addrCntChk = async (accountData) => {
    try {
        if (isEmpty(accountData)) {
            toastAlert('warning', "Kindly check wallet", 'userForm');
            return false;
        }
        else if (!accountData.isWalletConn) {
            toastAlert('warning', "Kindly check wallet", 'userForm');
            return false;
        }
        return true;
    } catch (err) {
        console.log('err : ', err);
        return false;
    }
}

export const decodeJwtNew = (token) => {
    return {
        status: false
    }
    // try {
    //     if (!isEmpty(token)) {
    //         token = token.replace('Bearer ', '')
    //         const decoded = jwt.verify(token, config.SECRET_KEY.JWT);
    //         if (decoded) {
    //             return {
    //                 memberType: decoded.memberType,
    //                 status: true
    //             }
    //         }
    //         return {
    //             status: false
    //         }
    //     }
    // } catch (err) {
    //     return {
    //         status: false
    //     }
    // }
}