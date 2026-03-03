import io from "socket.io-client";
import { env } from "../core/service/envconfig";
var token = sessionStorage.getItem('socketToken');
var userid = '';
if(token)
{
  let tokensplit = token.split("_");
  userid = tokensplit[0];
}
else
{
  userid =  new Date().getTime();
}
export const socket = io(env.socketUrl,{
  transports:['websocket', 'polling'],
  query: { user_id: userid },
  reconnection: true,
});

