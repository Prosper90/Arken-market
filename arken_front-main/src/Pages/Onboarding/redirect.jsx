import React, { useEffect, useState } from 'react'
import { env } from '../../core/sevice/envconfig'
import apiService from '../../core/sevice/detail'
import { postMethod } from '../../core/sevice/common.api'
function Redirect() {
   const [connectStatus,setconnectStatus]=useState(true)

   const saveTGId =async  ()=>{
         var obj={
             telegramId:localStorage.getItem("telegramId")
         }
      var data = {
              apiUrl: apiService.save_tg_id,
              payload: obj,
            };
            var resp = await postMethod(data);
            setdepositLoader(false);
    
            if (resp.success) {
              showSuccessToast(resp.message);
              navigate("/markets");
            } else {
              showErrorToast("Transaction failed, please try again");
            }
   }
  return (
    <div>
  <p className='text=white'>Connected Wallet Succfully</p>
    <button >
      Return to Telegram
   </button>
    </div>
  )
}

export default Redirect
