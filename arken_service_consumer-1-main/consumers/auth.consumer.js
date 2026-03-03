const { getChannel } = require('../rabbit');;
const { getMergedMarketsHandler,verifyTelegramWebAppHandler,disconnectWalletHandler,getUserByTelegramIdHandler,getDappKeyHandler,getUniqueIdHandler,getHomeTodayNewsHandler,getUserProfileHandler,getTelegramGroupListHandler,updateGroupCommissionHandler,getCompletedBetsForUserHandler,getActiveBetsForUserHandler,verifyWalletAppHandler,userbetplaceHandler,getMergedMarketByIdHandler,userDepositListHandler,UniqueIdHandler,verify_UniqueIdHandler,getCurrenyListHandler,userWithdrawHandler,userBalanceHandler, getUserTotalWinningsHandler,usertelegramId,getAddress,creat_new_wallet,send_otp,resend_otp,verify_otp,get_deposit_list,getReferralInfoHandler,createUserMarketHandler,submitUMAAssertionHandler,joinPrivateMarketHandler,disputeMarketHandler,getUserMarketsHandler} = require('../services/auth.service');
// const { getMergedMarketsHandler,verifyTelegramWebAppHandler,getHomeTodayNewsHandler,getUserProfileHandler,getTelegramGroupListHandler,updateGroupCommissionHandler,getCompletedBetsForUserHandler,getActiveBetsForUserHandler,verifyWalletAppHandler,userbetplaceHandler,userDepositListHandler,getCurrenyListHandler,userWithdrawHandler,userBalanceHandler, getUserTotalWinningsHandler,usertelegramId, getMergedMarketByIdHandler} = require('../services/auth.service');
const queuename = require("../queue/queuename");

// Callback set by index.js after the bot is ready.
// Called with (telegramId, amount, currency) after a deposit is recorded.
let _onDepositSuccess = null;
function setDepositSuccessCallback(fn) {
  _onDepositSuccess = fn;
}

async function startAuthConsumer() {
  const channel = getChannel();
  const QUEUE = 'user_queue';
  const QUEUEBOT = 'bot_queue';
  const QUEUEDEPOSIT = 'deposit_queue';
  const UNIQUEID ="unique_id_queue"
  const WALETQUEUE ="new_wallet_queue"
  const IDBOT ="ID_queue";
  const QUEUEBET = 'bet_queue';
  const QUEUECURRENCY = 'currency_queue';
  const QUEUEUSERWITHDRAW = 'user_withdraw_queue';
  const QUEUEUSERBALANCE = 'userBalance_queue';
  const QUEUECOMMISION = 'commision_queue';
  const ADDRESSBOT ="Address_queue"
  const QUEUEMARKETS = 'markets_queue';
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.assertQueue(QUEUEBOT, { durable: true });
  await channel.assertQueue(QUEUEBET, { durable: true });
  await channel.assertQueue(QUEUEUSERWITHDRAW, { durable: true });
  await channel.assertQueue(QUEUEDEPOSIT, { durable: true });
  await channel.assertQueue(UNIQUEID, { durable: true });
  await channel.assertQueue(IDBOT, { durable: true });
  await channel.assertQueue(WALETQUEUE, { durable: true });
  await channel.assertQueue(ADDRESSBOT, { durable: true });
  await channel.assertQueue(QUEUECURRENCY, { durable: true });
  await channel.assertQueue(QUEUEUSERBALANCE, { durable: true });
  await channel.assertQueue(QUEUECOMMISION, { durable: true });
  await channel.assertQueue(QUEUEMARKETS, { durable: true });

 channel.consume(QUEUE, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
         if (data.action === queuename.getmergedmarkets) {
        result = await getMergedMarketsHandler(data);
      }
      // else if (data.action === queuename.UpdateMarket) {
      //   result = await updateMarketHandler(data);
      // }

     if (!data.action) {
  console.error("❌ Consumer error: missing action in message:", data);
}

// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      // console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });
 channel.consume(QUEUEBOT, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
         if (data.action === queuename.telegramwebapp) {
        result = await verifyTelegramWebAppHandler(data);
      }
      else if (data.action === queuename.verifyWallet) {
        result = await verifyWalletAppHandler(data);
      }
      else if (data.action === queuename.userbetplace) {
        result = await userbetplaceHandler(data);
      }

     if (!data.action) {
  console.error("❌ Consumer error: missing action in message:", data);
}

// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      // console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });
 channel.consume(QUEUEBET, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
       if (data.action === queuename.userbetplace) {
        result = await userbetplaceHandler(data);
      }
       else if (data.action === queuename.getActiveBetsForUser) {
        result = await getActiveBetsForUserHandler(data);
      }
       else if (data.action === queuename.getCompletedBetsForUser) {
        result = await getCompletedBetsForUserHandler(data);
      }
       else if (data.action === queuename.getUserProfile) {
        result = await getUserProfileHandler(data);
      }

     if (!data.action) {
  console.error("❌ Consumer error: missing action in message:", data);
}

// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      // console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });

   channel.consume(QUEUEDEPOSIT, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
       if (data.action === queuename.Deposit) {
        result = await userDepositListHandler(data);
        // After successful deposit, notify the user via Telegram bot
        if (result?.success && _onDepositSuccess) {
          try {
            _onDepositSuccess(
              data.telegramId,
              data.depositAmount,
              data.currencySymbol || (data.WaletName === "metamask" ? "USDC" : "SOL")
            );
          } catch (notifyErr) {
            console.error("Deposit notification callback error:", notifyErr.message);
          }
        }
      }
      console.log(result,"result")
     if (!data.action) {
        console.error("❌ Consumer error: missing action in  message:", data);
         }

// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      // console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });
   channel.consume(UNIQUEID, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
   console.log(data.action,"---------------")
       if (data.action === queuename.saveUniqueId) {
        result = await UniqueIdHandler(data);
      }

        if (data.action === queuename.verifyUniqueId) {
        result = await verify_UniqueIdHandler(data);
      }

       if (data.action === queuename.getDappKey) {
        result = await getDappKeyHandler(data);
      }
         if (data.action === queuename.getUniqueId) {
        result = await getUniqueIdHandler(data);
      }
      
        if (data.action === queuename.disconnectWallet) {
        result = await disconnectWalletHandler(data);
      }
        if (data.action === queuename.getUserByTelegramId) {
        result = await getUserByTelegramIdHandler(data);
      }
      console.log(result,"result")
     if (!data.action) {
        console.error("❌ Consumer error: missing action in  message:", data);
         }

// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      // console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });
  
   channel.consume(IDBOT, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
     console.log(data,"datadatadata")
       if (data.action === queuename.ID_queue) {
        result = await usertelegramId(data);
      }
      console.log(result,"result")
     if (!data.action) {
        console.error("❌ Consumer error: missing action in  message:", data);
         }
// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      // console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });
   channel.consume(WALETQUEUE, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
     console.log(data,"datadatadata")
       if (data.action === queuename.createWalletNew) {
        result = await creat_new_wallet(data);
      }
       if (data.action === queuename.send_otp) {
        result = await send_otp(data);
      }
       if (data.action === queuename.verify_otp) {
        result = await verify_otp(data);

      } if (data.action === queuename.resend_otp) {
        result = await resend_otp(data);
      }
      if (data.action === queuename.get_deposit_list) {
        result = await get_deposit_list(data);
      }
      
      console.log(result,"result")
     if (!data.action) {
        console.error("❌ Consumer error: missing action in  message:", data);
         }
// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      // console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });


   channel.consume(ADDRESSBOT, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
     console.log(data,"addressquire",data.action, queuename.Address_queue)
       if (data.action === queuename.Address_queue) {
        result = await getAddress(data);
      }
      console.log(result,"result")
     if (!data.action) {
        console.error("❌ Consumer error: missing action in  message:", data);
         }
// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      // console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });



   channel.consume(QUEUECURRENCY, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
       if (data.action === queuename.getCurrenyList) {
        result = await getCurrenyListHandler(data);
      }
     if (!data.action) {
        console.error("❌ Consumer error: missing action in  message:", data);
         }

// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      // console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });
  

  channel.consume(QUEUEUSERWITHDRAW, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
       if (data.action === queuename.userWithdraw) {
        result = await userWithdrawHandler(data);
      }
     if (!data.action) {
  console.error("❌ Consumer error: missing action in message:", data);
}

// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      // console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });

   channel.consume(QUEUECOMMISION, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;

       if (data.action === queuename.getTelegramGroupList) {
        result = await  getTelegramGroupListHandler(data);
      }
       else if (data.action === queuename.updateGroupCommission) {
        result = await updateGroupCommissionHandler(data);
      }
       else if (data.action === queuename.getUserTotalWinnings) {
        result = await getUserTotalWinningsHandler(data);
      }
       else if (data.action === queuename.getReferralInfo) {
        result = await getReferralInfoHandler(data);
      }
     if (!data.action) {
        console.error("❌ Consumer error: missing action in  message:", data);
         }

// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      // console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });



 channel.consume(QUEUEUSERBALANCE, async (msg) => {
    try {
console.log("enter fundaiont oiiipoipo============")          

      const data = JSON.parse(msg.content.toString());
      let result = null;
         if (data.action === queuename.userBalance) {
console.log("enter fundaiont oiiipoipo============")          
        result = await userBalanceHandler(data);
      }
         if (data.action === queuename.getHomeTodayNews) {         
        result = await getHomeTodayNewsHandler(data);
      }
         if (data.action === queuename.getMergedMarketById) {         
        result = await getMergedMarketByIdHandler(data);
      }
     if (!data.action) {
  console.error("❌ Consumer error: missing action in message:", data);
}

// validate result
if (!result || typeof result !== "object") {
  result = {
    status: false,
    message: "Invalid handler output",
    action: data.action || "UNKNOWN_ACTION"
  };
}

// send response
channel.sendToQueue(
  msg.properties.replyTo,
  Buffer.from(JSON.stringify(result)),
  { correlationId: msg.properties.correlationId }
);

channel.ack(msg);
    } catch (err) {
      console.error(' Consumer error:', err);
      channel.ack(msg);
    }
  });
  channel.consume(QUEUEMARKETS, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;

      if (data.action === queuename.createUserMarket) {
        result = await createUserMarketHandler(data);
      } else if (data.action === queuename.submitUMAAssertion) {
        result = await submitUMAAssertionHandler(data);
      } else if (data.action === queuename.joinPrivateMarket) {
        result = await joinPrivateMarketHandler(data);
      } else if (data.action === queuename.disputeMarket) {
        result = await disputeMarketHandler(data);
      } else if (data.action === queuename.getUserMarkets) {
        result = await getUserMarketsHandler(data);
      }

      if (!data.action) {
        console.error("❌ Consumer error: missing action in message:", data);
      }

      if (!result || typeof result !== "object") {
        result = {
          status: false,
          message: "Invalid handler output",
          action: data.action || "UNKNOWN_ACTION",
        };
      }

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(result)),
        { correlationId: msg.properties.correlationId }
      );

      channel.ack(msg);
    } catch (err) {
      console.error("Markets consumer error:", err);
      channel.ack(msg);
    }
  });
}


module.exports = { startAuthConsumer, setDepositSuccessCallback };
