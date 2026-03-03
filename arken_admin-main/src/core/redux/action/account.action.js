// import constant
import {
    SET_ACCOUNT_CONNECT_WALLET
} from '../../redux/constant';

// import lib
import { setWalletConn, getWalletConn } from '../../lib/localStorage';
// import { toastAlert } from '../lib/toastAlert';

// import Web3 from 'web3';
// import '@metamask/legacy-web3';
// import WalletConnectProvider from "@walletconnect/web3-provider";
// import { BscConnector } from '@binance-chain/bsc-connector';

// import config from '../config';

// const providerWC = new WalletConnectProvider({
//     infuraId: config.infuraId, // Required
// });
// const bsc = new BscConnector({
//     supportedChainIds: [97] // later on 1 ethereum mainnet and 3 ethereum ropsten will be supported
// })
// let Web3 = window.web3;

export const walletConn = (dispatch, data) => {
    try {
        if(dispatch) {
            setWalletConn(data.wallet)
            dispatch({
                type: SET_ACCOUNT_CONNECT_WALLET,
                data
            })
        }
        return true
    } catch (err) {
        console.log('walletConn err : ', err);
        return false
    }
}

export const walletDisConn = async (dispatch, data) => {
    try {
        const walletConnDet = getWalletConn();
        if( walletConnDet === 'Metamask' || 
            walletConnDet === 'Binance Wallet' || 
            walletConnDet === 'Wallet Connect'
        ) {
            if(walletConnDet === 'Binance Wallet') {
                // await bsc.deactivate();
            }
        }
        setWalletConn(false);
        dispatch({
            type: SET_ACCOUNT_CONNECT_WALLET,
            data
        })
        return true
    } catch (err) {
        return false
    }
}
