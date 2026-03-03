// import package
import io from 'socket.io-client';

// import lib
import config from './index';

const socket = io(config.SOCKET_URL);

const createSocketUser = (userId) => {
    socket.emit('CREATEROOM', userId)
}

socket.on('userAsset', function (data) {
})

// socketContext.socket.on('openOrder', (data) => {
//     console.log("----data--", data)
//     if (data.pairId == tradePair.pairId) {
//         // setPendingOrder(data.result)
//     }
// })

export {
    socket,
    createSocketUser
}