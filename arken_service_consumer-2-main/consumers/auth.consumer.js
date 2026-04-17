const { getChannel } = require('../rabbit');
const { loginUser, forgotemailHandler,resendemailotpHandler,createPlatformfeeHandler,getPlatformFeeSettingsHandler,getUserManagementListHandler,getAdminDashboardHandler,createMarketHandler,deleteMarketHandler,updateMarketHandler,getAllMarketsHandler,getMarketHandler,getCombinedAllMarketsHandler,forgototpverifyHandler,forgotpasswordHandler,getAdminHandler,getDepositList,getWithdrawlist,verifyTokenHandler,adminloggHandler,dashboardcountsHandler, getAllEventsHandler, getEventHandler,UpdateEventHandler,deleteEventHandler,createEventHandler,currencyAddUpdate,currencyDelete, allCurrencyList,viewOneCurrency,manualSettlePredictionHandler,getPredictionManagementListHandler, exitPredictionHandler} = require('../services/auth.service');
const queuename = require("../queue/queuename");

async function startAuthConsumer() {
  const channel = getChannel();
  const QUEUE = 'auth_queue';
  const QUEUENEW = 'onboard_queue';
  const QUEUEMARKET = 'market_queue';
  const QUEUEDASH = 'dashboard_queue';
  const QUEUEDEPOSIT = 'deposit_admin_queue';
  const QUEUEWITHDRAW = 'withdraw_admin_queue';
  const QUEUECURRENCY = 'admin_currency_queue';
  const QUEUERESOL = 'resol_queue';
  const QUEUERECASHOUT = 'cashout_queue';
  const QUEUEREFEES = 'platformfee_queue';
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.assertQueue(QUEUENEW, { durable: true });
  await channel.assertQueue(QUEUEMARKET, { durable: true });
  await channel.assertQueue(QUEUEDASH, { durable: true });
  await channel.assertQueue(QUEUEDEPOSIT, { durable: true });
  await channel.assertQueue(QUEUEWITHDRAW, { durable: true });
  await channel.assertQueue(QUEUECURRENCY, { durable: true });
  await channel.assertQueue(QUEUERESOL, { durable: true });
  await channel.assertQueue(QUEUERECASHOUT, { durable: true });
  await channel.assertQueue(QUEUEREFEES, { durable: true });

  channel.consume(QUEUE, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
      if (data.action === queuename.login) {
        result = await loginUser(data);
      } 
      else if (data.action === queuename.forgotemailotp) {
        result = await forgotemailHandler(data);
      }
      else if (data.action === queuename.forgototpverify) {
        result = await forgototpverifyHandler(data);
      }
      else if (data.action === queuename.resendemailotp) {
        result = await resendemailotpHandler(data);
      }
      else if (data.action === queuename.forgotpassword) {
        result = await forgotpasswordHandler(data);
      }
      else if (data.action === queuename.getAdmin) {
        result = await getAdminHandler(data);
      }
      else if (data.action === queuename.verifyToken) {
        result = await verifyTokenHandler(data);
      }
      else if (data.action === queuename.adminlogg) {
        result = await adminloggHandler(data);
      }
      else if (data.action === queuename.dashboardcounts) {
        result = await dashboardcountsHandler(data);
      }
      else if (data.action === queuename.getAllEvents) {
        result = await getAllEventsHandler(data);
      }
      else if (data.action === queuename.getEvent) {
        result = await getEventHandler(data);
      }
      else if (data.action === queuename.updateEvent) {
        result = await UpdateEventHandler(data);
      }
      else if (data.action === queuename.deleteEvent) {
        result = await deleteEventHandler(data);
      }
      else if (data.action === queuename.createEvent) {
        result = await createEventHandler(data);
      }
    
      else if (data.action === queuename.getAllMarkets) {
        result = await getAllMarketsHandler(data);
      }
      else if (data.action === queuename.getMarket) {
        result = await getMarketHandler(data);
      }
      
      else if (data.action === queuename.deleteMarket) {
        result = await deleteMarketHandler(data);
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
  channel.consume(QUEUENEW, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
       if (data.action === queuename.getCombinedAllMarkets) {
        result = await getCombinedAllMarketsHandler(data);
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

  channel.consume(QUEUEMARKET, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
         if (data.action === queuename.createMarket) {
        result = await createMarketHandler(data);
      }
      else if (data.action === queuename.UpdateMarket) {
        console.log(queuename.UpdateMarket,'queuename.UpdateMarket==')
        result = await updateMarketHandler(data);
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

  channel.consume(QUEUEDASH, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
        if (data.action === queuename.getAdminDashboard) {
        result = await getAdminDashboardHandler(data);
      }
       else if (data.action === queuename.getUserManagementList) {
        result = await getUserManagementListHandler(data);
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
  channel.consume(QUEUERESOL, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
       if (data.action === queuename.getPredictionManagementList) {
        result = await getPredictionManagementListHandler(data);
      }
      
        else if (data.action === queuename.manualSettlePrediction) {
        result = await manualSettlePredictionHandler(data);
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

  channel.consume(QUEUEDEPOSIT, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
      console.log("-------",data.action,queuename.getDepositList,data.action === queuename.getDepositList)
      if (data.action === queuename.getDepositList) {
        result = await getDepositList(data);
      } 
      console.log(result,"resultresultresult")
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
    channel.consume(QUEUEWITHDRAW, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
      console.log("-------",data.action,queuename.getWithdrawlist,data.action === queuename.getWithdrawlist)
      if (data.action === queuename.getWithdrawlist) {
        result = await getWithdrawlist(data);
      } 
      console.log(result,"resultresultresult")
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

  
  console.log(`Auth consumer listening on queue: ${QUEUE}`);
 channel.consume(QUEUECURRENCY, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
      console.log("-------",data.action,queuename.admin_currency_queue,data.action === queuename.admin_currency_queue)
      if (data.action === queuename.currencyAddUpdate) {
        result = await currencyAddUpdate(data);
      } 
      else  if (data.action === queuename.currencyDelete) {
        result = await currencyDelete(data);
      } else  if (data.action === queuename.allCurrencyList) {
        result = await allCurrencyList(data);
      }else   if (data.action === queuename.viewOneCurrency) {
        result = await viewOneCurrency(data);
      }  
      console.log(result,"resultresultresult")
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
 channel.consume(QUEUERECASHOUT, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
     
      if (data.action === queuename.exitPrediction) {
        result = await exitPredictionHandler(data);
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
 channel.consume(QUEUEREFEES, async (msg) => {
    try {
      const data = JSON.parse(msg.content.toString());
      let result = null;
     
      if (data.action === queuename.createPlatformfee) {
        result = await createPlatformfeeHandler(data);
      } 
      if (data.action === queuename.getPlatformFeeSettings) {
        result = await getPlatformFeeSettingsHandler(data);
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


}

module.exports = { startAuthConsumer };
