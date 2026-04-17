const common = require("../utils/common");
var adminDB = require("../models/admin");
var adminloginhistoryDB = require("../models/adminloginhistory");
const mongoose = require("mongoose");
var mailtempDB = require("../models/mailtemplate");
var antiPhishing = require("../models/antiphising");
var TelegramGroup = require("../models/telegramGroup");
var Prediction = require("../models/predictions");
var AdminWallet = require("../models/adminWallet");
var usersDB = require("../models/users");
var userPublicWallet = require("../models/publicWallet");
var UserWalletDB = require("../models/userWallet");
var AdminWalletHistory = require("../models/AdminWalletHistory");
var PlatformFeeSettings = require("../models/PlatformFeeSettings");
var Event = require("../models/Events");
const Market = require("../models/markets");
var depositDB = require("../models/deposit");
var WithdrawDB = require("../models/withdraw");
var orderDB = require("../models/orderPlace");
var orderConfirmDB = require("../models/confirmOrder");
var mail = require("../utils/mailhelper");
let jwt = require("jsonwebtoken");
const useragent = require("useragent");
const key = require("../config/key");
const depositList = require("../models/depositList");
const currencyDB = require("../models/currency")
const jwt_secret = key.JWT_TOKEN_SECRET;
const userWalletDB = require("../models/userWallet");
const moment = require("moment");
const markets = require("../models/markets");
const MarketDataRetrieved = [
  "id",
  "bestBid",
  "slug",
  "bestAsk",
  "groupItemTitle",
  "volume",
  "active",
  "closed",
  "outcomes",
  "outcomePrices",
  "archived",
  "umaResolutionStatuses",
  "umaResolutionStatus",
  "acceptingOrders",
  "question",
  "conditionId",
  "volumeNum",
  "startDate",
  "endDate",
  "startTime",
  "closedTime",
  "liquidity",
  "liquidityNum",
  "category",

];
const eventDataRetrieved = [
  "id",
  "title",
  "slug",
  "startDate",
  "endDate",
  "startTime",
  "endTime",
  "active",
  "closed",
  "archived",
];


async function updateAdminCredentials() {
  const email = "admin@arkenmarket.com";
  const password = "Arken@@543";

  const encryptedEmail = common.encrypt(email);
  const encryptedPassword = common.encrypt(password);

  await adminDB.updateOne(
    {},
    {
      $set: {
        email: encryptedEmail,
        password: encryptedPassword,
        status: 1,
        tfa_status: 0
      }
    }
  );

  console.log("✅ Admin credentials updated");
}

async function loginUser(data) {
  try {
    const { email, password, ip_address, user_agent } = data;

  //  await updateAdminCredentials()

    const ua = useragent.parse(user_agent || "");

    const admin_data = await adminDB.findOne({
      email: common.encrypt(email),
    });

    if (!admin_data) {
      return { status: false, Message: "Admin Not found" };
    }

    if (common.encrypt(password) !== admin_data.password) {
      return {
        status: false,
        Message: "Authentication failed, Incorrect Password",
      };
    }

    if (admin_data.tfa_status === 1) {
      return {
        status: true,
        Message: "Please enter 2FA code",
        token: common.encryptionLevel(admin_data._id.toString()),
        tfa: admin_data.tfa_status,
      };
    }

    if (admin_data.status == 0) {
      return {
        status: false,
        Message: "Account has been deactivated by SuperAdmin",
      };
    }

    const isBrave =
      user_agent?.includes("Brave") ||
      (ua.family === "Chrome" && user_agent?.includes("Brave"));

    const browser = isBrave ? "Brave" : ua.family || "Unknown";
    const os = ua.os.toString() || "Unknown";
    const platform = ua.platform || "Unknown";

    const loginHistory = {
      ipAddress: ip_address,
      browser: browser,
      OS: os,
      platform: platform,
      useremail: common.decrypt(admin_data.email),
      createdDate: new Date(),
    };

    await adminloginhistoryDB.create(loginHistory);

    const payload = { _id: admin_data._id };
    const token = jwt.sign(payload, jwt_secret, { expiresIn: 300 * 60 });

    return {
      status: true,
      Message: "Welcome back! You’ve successfully logged in",
      token: token,
      admin_data: admin_data,
      tfa: admin_data.tfa_status,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      Message: "Something went wrong, please try again later",
    };
  }
}
async function forgotemailHandler(data) {
  try {
    const { email } = data;
    const findemail = common.encrypt(email);

    const responce = await adminDB.findOne({ email: findemail });

    if (!responce) {
      return { status: false, Message: "Email id not found" };
    }

    const fou_digit = Math.floor(1000 + Math.random() * 9000);

    await adminDB.updateOne(
      { _id: responce._id },
      { $set: { forgotEmailotp: fou_digit, forgotPass: 1 } },
      { upsert: true }
    );

    const resData = await mailtempDB.findOne({ key: "OTP" });
    if (!resData) {
      return { status: false, Message: "Please try again later" };
    }

    const findDetails = await antiPhishing.findOne({ userid: data.userId });
    const APCODE = `Antiphising Code - ${findDetails ? findDetails.APcode : ""}`;
    const reciver = process.env.ADMIN_EMAIL;

    const etempdataDynamic = resData.body
      .replace(/###OTP###/g, fou_digit)
      .replace(/###USERNAME###/g, email)
      .replace(/###APCODE###/g, findDetails && findDetails.Status == "true" ? APCODE : "")
      .replace(/###PROJECT_NAME###/g, process.env.PROJECT_NAME || "CapitalEXC")
      .replace(/###LOGO_URL###/g, process.env.LOGO_URL || "https://res.cloudinary.com/dmjw7pe6k/image/upload/v1758172290/CapitalEXC_tzn4t4.png")
      .replace(/###SUPPORT_EMAIL###/g, process.env.SUPPORT_EMAIL || "support@capitalexc.io")
      .replace(/###TERMS_URL###/g, process.env.TERMS_URL || "https://capitalexc.blfdemo.online/terms")
      .replace(/###PRIVACY_URL###/g, process.env.PRIVACY_URL || "https://capitalexc.blfdemo.online/privacy")
      .replace(/###HELP_CENTER_URL###/g, process.env.HELP_CENTER_URL || "https://capitalexc.blfdemo.online/support")
      .replace(/###SECURITY_URL###/g, process.env.SECURITY_URL || "https://capitalexc.blfdemo.online/security")
      .replace(/###ADMIN_URL###/g, process.env.ADMIN_URL || "https://capitalexc.blfdemo.online/capitalexc_admin/")
      .replace(/###COPYRIGHT_TEXT###/g, process.env.COPYRIGHT_TEXT || "Copyright ©2025");

    const mailRes = await mail.sendMail({
      from: { name: process.env.FROM_NAME, address: process.env.FROM_EMAIL },
      to: reciver,
      subject: resData.Subject,
      html: etempdataDynamic,
    });

    if (!mailRes) {
      return { status: false, Message: "Email not verified, please try later" };
    }

    return { status: true, Message: "Email verified, OTP sent to your email", email, emailOtp: fou_digit };

  } catch (err) {
    return { status: false, Message: "Internal server", error: err.message };
  }
}
async function forgototpverifyHandler(data) {
  try {
    const { email, emailOtp } = data;
    const encryptEmail = common.encrypt(email);

    let findUser = await adminDB.findOne({ email: encryptEmail });

    if (!findUser) {
      return { status: false, Message: "User not found" };
    }

    if (findUser.forgotEmailotp == emailOtp) {
      let verifyUser = await adminDB.updateOne(
        { email: encryptEmail },
        { $set: { status: "active" } }
      );

      if (verifyUser.acknowledged === true) {
        return {
          status: true,
          Message: "OTP verified successfully, Reset your password.",
        };
      } else {
        return {
          status: false,
          Message: "OTP not verified, Please try again later.",
        };
      }
    } else {
      return {
        status: false,
        Message: "OTP not verified, Please try again later.",
      };
    }

  } catch (e) {
    return {
      status: false,
      Message: "Internal server error",
      error: e.message
    };
  }
}

async function resendemailotpHandler(data) {
  try {
    const { email } = data;
    const emailNew = email;
    const findemail = common.encrypt(emailNew);

    const response = await adminDB.findOne({ email: findemail });

    if (!response) {
      return { status: false, Message: "Email id not found" };
    }

    const fou_digit = Math.floor(1000 + Math.random() * 9000);

    await adminDB.updateOne(
      { _id: response._id },
      {
        $set: {
          forgotEmailotp: fou_digit,
          forgotPass: 1,
        },
      },
      { upsert: true }
    );

    const resData = await mailtempDB.findOne({ key: "OTP" });

    if (!resData) {
      return {
        status: false,
        Message: "Email template not found. Please try again later.",
      };
    }

    const findDetails = await antiPhishing.findOne({
      userid: response._id,
    });

    const APCODE = `Antiphising Code - ${findDetails ? findDetails.APcode : ""}`;
    const reciver = process.env.ADMIN_EMAIL;

    const etempdataDynamic = resData.body
      .replace(/###OTP###/g, fou_digit)
      .replace(/###USERNAME###/g, email)
      .replace(/###APCODE###/g, findDetails && findDetails.Status == "true" ? APCODE : "")
      .replace(/###PROJECT_NAME###/g, process.env.PROJECT_NAME || "CapitalEXC")
      .replace(/###LOGO_URL###/g, process.env.LOGO_URL || "https://res.cloudinary.com/dmjw7pe6k/image/upload/v1758172290/CapitalEXC_tzn4t4.png")
      .replace(/###SUPPORT_EMAIL###/g, process.env.SUPPORT_EMAIL || "support@capitalexc.io")
      .replace(/###TERMS_URL###/g, process.env.TERMS_URL || "https://capitalexc.blfdemo.online/terms")
      .replace(/###PRIVACY_URL###/g, process.env.PRIVACY_URL || "https://capitalexc.blfdemo.online/privacy")
      .replace(/###HELP_CENTER_URL###/g, process.env.HELP_CENTER_URL || "https://capitalexc.blfdemo.online/support")
      .replace(/###SECURITY_URL###/g, process.env.SECURITY_URL || "https://capitalexc.blfdemo.online/security")
      .replace(/###ADMIN_URL###/g, process.env.ADMIN_URL || "https://capitalexc.blfdemo.online/capitalexc_admin/")
      .replace(/###COPYRIGHT_TEXT###/g, process.env.COPYRIGHT_TEXT || "Copyright ©2025");

    const mailRes = await mail.sendMail({
      from: {
        name: process.env.FROM_NAME,
        address: process.env.FROM_EMAIL,
      },
      to: reciver,
      subject: resData.Subject,
      html: etempdataDynamic,
    });

    if (mailRes != null) {
      return {
        status: true,
        Message: "A new OTP has been sent to your email.",
      };
    } else {
      return {
        status: false,
        Message: "Failed to send OTP. Please try again later.",
      };
    }

  } catch (err) {
    return {
      status: false,
      Message: "Internal server error",
      error: err.message,
    };
  }
}
async function forgotpasswordHandler(data) {
  try {
    const { email, password, confimPassword } = data;

    if (password && confimPassword && email) {
      if (password == confimPassword) {

        const userMail = common.encrypt(email);

        const users = await adminDB.findOne({ email: userMail });

        if (users) {
          if (users.forgotPass == 1) {

            const lock = common.encrypt(password);

            const updatepass = await adminDB.updateOne(
              { _id: users._id },
              {
                $set: {
                  password: lock,
                  forgotPass: 0,
                },
              }
            );

            if (updatepass.acknowledged === true) {
              return {
                status: true,
                Message: "Password changed successfully",
              };
            } else {
              return {
                status: false,
                Message: "Please try again later",
              };
            }
          } else {
            return {
              status: false,
              Message: "Password reset not allowed. Please verify OTP first.",
            };
          }
        } else {
          return { status: false, Message: "User not found" };
        }

      } else {
        return {
          status: false,
          Message: "Password and confirm password are not same !",
        };
      }
    } else {
      return { status: false, Message: "Oops!, Enter all fields" };
    }

  } catch (error) {
    return {
      status: false,
      Message: "Oops!, Something went wrong",
      error: error.message
    };
  }
}
async function getAdminHandler(data) {
  try {
    const { userId } = data;

    const getAdmin = await adminDB.findOne({ _id: userId });

    if (getAdmin) {
      return {
        status: true,
        Message: "",
        data: getAdmin,
        email: common.decrypt(getAdmin.email),
      };
    } else {
      return {
        status: false,
        Message: "Something went wrong, please try again later",
        data: {},
      };
    }
  } catch (err) {
    console.error(err, "Error in getAdmin");
    return {
      status: false,
      Message: "Server error",
      error: err.message,
    };
  }
}
async function verifyTokenHandler(data) {
  const { token } = data;

  if (!token) {
    return {
      status: false,
      message: "Token missing"
    };
  }

  try {
    jwt.verify(token, jwt_secret);
    return {
      status: true,
      message: "Token is valid"
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        status: false,
        message: "TokenExpired"
      };
    }

    return {
      status: false,
      message: "Invalid token"
    };
  }
}
async function adminloggHandler(data) {
  try {
    const { page, limit } = data;

    const pageNew = parseInt(page) || 1;
    const limitNew = parseInt(limit) || 5;
    const skip = (pageNew - 1) * limitNew;

    const logs = await adminloginhistoryDB
      .find({}, { ipAddress: 1, browser: 1, createdDate: 1, platform: 1, OS: 1 })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNew);

    if (!logs) {
      return { status: false, Message: "Something went wrong" };
    }

    const count = await adminloginhistoryDB.countDocuments({});
    const totalPages = Math.ceil(count / limitNew);

    return {
      status: true,
      Message: logs,
      totalPages: totalPages,
      currentPage: pageNew,
    };

  } catch (err) {
    return {
      status: false,
      Message: "Something went wrong",
      error: err.message,
    };
  }
}
async function dashboardcountsHandler(data) {
  try {
    const { userId } = data;

    let admin_data = await adminDB.findOne({ _id: userId });

    const userCountPromise = usersDB.find({ verifyEmail: 1 }).countDocuments();

    const depositCountPromise = depositDB
      .find({ type: 0, userId: { $ne: admin_data._id } })
      .then((data) => data.length);

    const withdrawCountPromise = WithdrawDB.find({
      type: 0,
      withdraw_type: 0,
      status: { $in: [1, 2, 3, 4] },
    }).countDocuments();

    const openOrdersCountPromise = orderDB
      .find({ status: "Active" })
      .countDocuments();

    const ordersCountPromise = orderConfirmDB
      .find({})
      .countDocuments()
      .then((data) => data);

    const cancelledCountPromise = orderDB
      .find({ status: "cancelled" })
      .countDocuments();

    const [
      userCount,
      depositCount,
      withdrawCount,
      openOrdersCount,
      ordersCount,
      cancelledCount,
    ] = await Promise.all([
      userCountPromise,
      depositCountPromise,
      withdrawCountPromise,
      openOrdersCountPromise,
      ordersCountPromise,
      cancelledCountPromise,
    ]);

    return {
      status: true,
      dashboardCounts: {
        userCount,
        depositCount,
        withdrawCount,
        openOrdersCount,
        ordersCount,
        cancelledCount,
      },
    };
  } catch (e) {
    return { status: false, Message: e.message };
  }
}
async function getAllEventsHandler(data) {
  try {
    const { page = 1, limit = 5, keyword, fromDate, toDate } = data;
    let query = {};

    if (keyword) {
      query.$or = [{ title: { $regex: keyword, $options: "i" } }];
    }

    if (fromDate || toDate) {
      const dateFilter = {};

      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.$gte = start;
      }

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }

      query.createdAt = dateFilter;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { _id: -1 },
      projection: {
        __v: 0,
        updatedAt: 0,
      },
      lean: true,
    };

    const events = await Event.paginate(query, options);

    events.docs = events.docs.map((e) => ({
      ...e,
      question: e.title,
      title: undefined,
    }));

    return {
      success: true,
      message: "Events fetched successfully.",
      data: events,
    };

  } catch (error) {
    return {
      success: false,
      message: "An error occurred while fetching the Events.",
      error: error.message,
    };
  }
}
async function getEventHandler(data) {
  try {
    const id  = data.id;

    if (!id) {
      return {
        success: false,
        message: "Event ID is required.",
        data: null
      };
    }

    const event = await Event.findById(id);

    if (!event) {
      return {
        success: false,
        message: "Event not found.",
        data: null
      };
    }

    return {
      success: true,
      message: "Event fetched successfully.",
      data: event
    };

  } catch (error) {
    return {
      success: false,
      message: "An error occurred while fetching the Event.",
      error: error.message
    };
  }
}
async function UpdateEventHandler(datanew) {
  try {
    const id  = datanew.id;
    const data = datanew;
    const { question, endDate, startDate } = data;

    if (!id) {
      return {
        success: false,
        message: "Event ID is required.",
      };
    }

    const find = await Event.findById(id);

    if (!find) {
      return {
        success: false,
        message: "Event not found.",
      };
    }

    if (question) {
      data.slug = question.replace(/\s+/g, "-").toLowerCase();
      data.title = question;
    }

    await Event.updateOne({ _id: id }, data);

    return {
      success: true,
      message: "Event Updated successfully.",
    };

  } catch (error) {
    return {
      success: false,
      message: "An error occurred while Updating the Event.",
      error: error.message,
    };
  }
}
async function deleteEventHandler(data) {
  try {
    const id = data.id; 

    if (!id) {
      return {
        success: false,
        message: "Event ID is required.",
      };
    }

    const find = await Event.findById(id);

    if (!find) {
      return {
        success: false,
        message: "Event not found.",
      };
    }

    await Event.deleteOne({ _id: id });

    return {
      success: true,
      message: "Event deleted successfully.",
    };

  } catch (error) {
    return {
      success: false,
      message: "An error occurred while deleting the Event.",
      error: error.message,
    };
  }
}

async function createEventHandler(datanew) {
  try {
    const data = datanew;
    const { question, endDate, startDate } = data;

    if (!question || !endDate || !startDate) {
      return {
        success: false,
        message: "All fields are required.",
      };
    }

    data.slug = question.replace(/\s+/g, "-").toLowerCase();
    data.outcomes = data.options;
    data.title = question;

    const exists = await Event.findOne({ slug: data.slug });

    if (exists) {
      return {
        success: false,
        message: "Event with this question already exists.",
      };
    }

    const event = new Event(data);
    await event.save();


    return {
      success: true,
      message: "Event created successfully.",
      data: event,
    };

  } catch (error) {
    return {
      success: false,
      message: "An error occurred while creating the Event.",
      error: error.message,
    };
  }
}
async function getCombinedAllMarketsHandler(data) {
  try {
    let query = {};

    let { limit = 5, page = 1, keyword = "", fromDate, toDate, marketStatus } = data;

    if (keyword !== "") {
      query.$or = [
        { question: { $regex: keyword, $options: "i" } }
      ];
    }

    if (fromDate || toDate) {
      const dateFilter = {};

      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.$gte = start;
      }

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }

      query.createdAt = dateFilter;
    }

    if (marketStatus) {
      query.marketStatus = marketStatus;
    }

    limit = parseInt(limit) || 5;
    page = parseInt(page) || 1;
    const skip = (page - 1) * limit;

    const markets = await Market.find(query)
      .sort({ _id: -1 }); 

    const marketCount = await Market.countDocuments(query);

    let combineMarkets = [...markets];
    combineMarkets = combineMarkets.slice(skip, skip + limit);

    return {
      status: true,
      message: "Markets fetched successfully.",
      data: combineMarkets,
      totalPages: Math.ceil(marketCount / limit),
      total: marketCount,
      page,
      limit,
    };

  } catch (error) {
    return {
      status: false,
      message: "An error occurred while fetching the markets.",
      error: error.message,
    };
  }
}


async function getAllMarketsHandler(data) {
  try {
    const markets = await Market.find().populate("events");

    return {
      status: true,
      message: "Markets fetched successfully.",
      data: markets
    };

  } catch (error) {
    return {
      status: false,
      message: "An error occurred while fetching the markets.",
      error: error.message
    };
  }
}
async function getMarketHandler(data) {
  try {
    const id = data.id;

    if (!id) {
      throw new Error("Market ID is required.");
    }

    const market = await Market.findById(id).populate("events");

    return {
      status: true,
      message: "Market fetched successfully.",
      data: market
    };

  } catch (error) {
    return {
      status: false,
      message: "An error occurred while fetching the market.",
      error: error.message
    };
  }
}
async function updateMarketHandler(data) {
  try {
    const { id } = data;
    if (!id) throw new Error("Market ID is required.");

    const existingMarket = await Market.findById(id);
    if (!existingMarket) throw new Error("Market not found.");

    const {
      question,
      description,
      tags,
      startDate,
      endDate,
      resolution,
      options,
      liquidity,
      image,
      active,
      minimumLiquidity,
      estimatedNetworkFee,
      OracleFixedFee,
      totalLiquidity,
      totalDeduction,
    } = data;

    if (tags && tags.length < 1) throw new Error("At least one tag is required.");
    if (options && (!Array.isArray(options) || options.length < 2)) throw new Error("At least two options are required.");

    if (question) data.slug = question.trim().replace(/\s+/g, "-").toLowerCase();

    if (options && Array.isArray(options)) {
      const outcomes = [];
      const outcomePrices = [];
      const chancePercents = [];

      options.forEach((opt, index) => {
        if (!opt.value || opt.value.trim() === "") throw new Error(`Option ${index + 1} value is required`);

        const price = Number(opt.outcomePrice);
        if (isNaN(price) || price <= 0 || price >= 1) throw new Error(`Outcome price for option ${index + 1} must be between 0 and 1`);

        const chance = Number(opt.chancePercent || 0);

        outcomes.push(opt.value);
        outcomePrices.push(price);
        chancePercents.push(chance);
      });

      const totalPrice = outcomePrices.reduce((a, b) => a + b, 0);
      if (Math.abs(totalPrice - 1) > 0.01) throw new Error("Outcome prices must sum to 1");

      data.outcomes = outcomes;
      data.outcomePrices = outcomePrices;
      data.chancePercents = chancePercents;

      data.bestBid = Math.max(...outcomePrices);
      data.bestAsk = Math.min(...outcomePrices);
    }

    if (liquidity !== undefined) data.liquidity = Number(liquidity);
    if (minimumLiquidity !== undefined) data.minimumLiquidity = Number(minimumLiquidity);
    if (estimatedNetworkFee !== undefined) data.estimatedNetworkFee = Number(estimatedNetworkFee);
    if (OracleFixedFee !== undefined) data.oracleFixedFee = Number(OracleFixedFee);
    if (totalLiquidity !== undefined) data.totalLiquidity = Number(totalLiquidity);
    if (totalDeduction !== undefined) data.totalDeduction = Number(totalDeduction);

    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);

    if (active !== undefined) data.active = active === "true" || active === true;

    delete data.id;
    delete data.options;

    await Market.updateOne({ _id: id }, { $set: data });

    return { status: true, message: "Market updated successfully." };
  } catch (error) {
    return { status: false, message: "An error occurred while updating the market.", error: error.message };
  }
}



async function deleteMarketHandler(data) {
  try {
    const id = data.id;

    if (!id) {
      throw new Error("Market ID is required.");
    }

    const find = await Market.findById(id);

    if (!find) {
      throw new Error("Market not found.");
    }

    await Market.deleteOne({ _id: id });

    return {
      status: true,
      message: "Market deleted successfully."
    };

  } catch (error) {
    return {
      status: false,
      message: "An error occurred while deleting the market.",
      error: error.message
    };
  }
}

const CRYPTO_CURRENCY_MAP = {
  bitcoin: "BTC",
  btc: "BTC",
  ethereum: "ETH",
  eth: "ETH",
  solana: "SOL",
  sol: "SOL",
  dogecoin: "DOGE",
  doge: "DOGE",
  shiba: "SHIB",
  shib: "SHIB",
  ripple: "XRP",
  xrp: "XRP",
  cardano: "ADA",
  ada: "ADA",
  binance: "BNB",
  bnb: "BNB",
  polygon: "MATIC",
  matic: "MATIC",
  avalanche: "AVAX",
  avax: "AVAX",
  polkadot: "DOT",
  dot: "DOT",
  arbitrum: "ARB",
  optimism: "OP",
  litecoin: "LTC",
  ltc: "LTC",
  uniswap: "UNI",
  uni: "UNI",
};

function detectCurrency(data) {
  const text = (
    (data.question || "") +
    " " +
    (data.description || "") +
    " " +
    (data.tags?.join(" ") || "")
  ).toLowerCase();

  for (const key in CRYPTO_CURRENCY_MAP) {
    const regex = new RegExp(`\\b${key}\\b`, "i"); 
    if (regex.test(text)) {
      return CRYPTO_CURRENCY_MAP[key];
    }
  }
  return null;
}


async function createMarketHandler(data) {
  try {
    const {
      question,
      description,
      tags,
      startDate,
      endDate,
      resolution,
      options,
      liquidity,
      image,
      active,
      minimumLiquidity,
      estimatedNetworkFee,
      OracleFixedFee,
      totalLiquidity,
      totalDeduction,
    } = data;

    if (
      !question ||
      !liquidity ||
      !tags?.length ||
      !startDate ||
      !endDate ||
      !resolution ||
      !Array.isArray(options) ||
      options.length < 2
    ) {
      return { status: false, message: "All fields are required." };
    }

    let outcomes = [];
    let outcomePrices = [];
    let chancePercents = [];

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];

      if (!opt.value?.trim()) {
        return { status: false, message: `Option ${i + 1} value required` };
      }

      const price = Number(opt.outcomePrice);
      if (price <= 0 || price >= 1) {
        return { status: false, message: `Invalid price for option ${i + 1}` };
      }

      outcomes.push(opt.value);
      outcomePrices.push(price);
      chancePercents.push(Number(opt.chancePercent || 0));
    }

    const totalPrice = outcomePrices.reduce((a, b) => a + b, 0);
    if (Math.abs(totalPrice - 1) > 0.01) {
      return { status: false, message: "Outcome prices must sum to 1" };
    }

    const slug = question.trim().replace(/\s+/g, "-").toLowerCase();
    const exists = await Market.findOne({ slug });
    if (exists) {
      return { status: false, message: "Market already exists" };
    }

    const currency = detectCurrency(data);

    const market = await Market.create({
      question,
      description,
      tags,
      image,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      liquidity: Number(liquidity),
      minimumLiquidity: Number(minimumLiquidity || 0),
      estimatedNetworkFee: Number(estimatedNetworkFee || 0),
      oracleFixedFee: Number(OracleFixedFee || 0),
      totalLiquidity: Number(totalLiquidity || 0),
      totalDeduction: Number(totalDeduction || 0),
      outcomes,
      outcomePrices,
      chancePercents,
      bestBid: Math.max(...outcomePrices),
      bestAsk: Math.min(...outcomePrices),
      resolution,
      active: active === true || active === "true",
      slug,
      acceptingOrders: true,
      currency,
      category: currency ? "Crypto" : "Other", 
    });

    return {
      status: true,
      message: "Market created successfully.",
      data: market,
    };
  } catch (err) {
    return { status: false, message: err.message };
  }
}



async function getPolyEventsDetailsHandler(data) {
  try {
    const queryData = data.query;

    const url = new URL(API_URL + "/events");

    for (const key in queryData) {
      if (typeof queryData[key] == "object") {
        let dd = queryData[key];
        for (const k in dd) {
          url.searchParams.append(key, dd[k]);
        }
      } else {
        url.searchParams.append(key, queryData[key]);
      }
    }

    const response = await fetch(url, {
      params: JSON.stringify(queryData),
    });

    const json = await response.json();

    const filterJson = json.map((item) => {
      return eventDataRetrieved.reduce((acc, curr) => {
        acc[curr] = item[curr];

        acc.markets = item.markets.map((market) => {
          return MarketDataRetrieved.reduce((acc2, curr2) => {
            acc2[curr2] = market[curr2];

            acc2.buyNO = (100 - (market["bestBid"] ? market["bestBid"] * 100 : 0)).toFixed(2);
            acc2.buyYes = (market["bestAsk"] ? market["bestAsk"] * 100 : 0).toFixed(2);
            acc2.sellYes = (market["bestBid"] ? market["bestBid"] * 100 : 0).toFixed(2);
            acc2.sellNO = (100 - (market["bestAsk"] ? market["bestAsk"] * 100 : 0)).toFixed(2);

            return acc2;
          }, {});
        });

        return acc;
      }, {});
    });

    return {
      success: true,
      data: filterJson
    };

  } catch (error) {
    return {
      success: false,
      error: error.message || "Unknown error"
    };
  }
}


// async function manualSettlePredictionHandler(data) {
//   try {
//     const { predictionId, resolvedOutcome } = data;

//     const prediction = await Prediction.findById(predictionId);
//     if (!prediction)
//       return { status: false, message: "Prediction not found" };

//     if (prediction.source !== "manual")
//       return { status: false, message: "Only manual bets can be settled" };

//     if (prediction.status !== "OPEN")
//       return { status: false, message: "Prediction already settled" };

//     const isWinner = prediction.outcomeLabel === resolvedOutcome;

//     prediction.status = isWinner ? "WON" : "LOST";
//     prediction.resolvedOutcome = resolvedOutcome;
//     prediction.finalPayout = isWinner ? prediction.potentialPayout : 0;
//     prediction.settledAt = new Date();
//     await prediction.save();

//     const walletDoc = await UserWalletDB.findOne({ userId: prediction.userId });
//     if (!walletDoc)
//       return { status: false, message: "User wallet not found" };

//     const currencyWallet = walletDoc.wallets.find(
//       w => w.currencySymbol === prediction.currency
//     );
//     if (!currencyWallet)
//       return { status: false, message: "Currency wallet not found" };

//     currencyWallet.holdAmount -= prediction.amount;

//     if (isWinner) currencyWallet.amount += prediction.finalPayout;

//     await walletDoc.save();

   
//     if (prediction.groupId && isWinner) {
//       const group = await TelegramGroup.findOne({
//         groupId: prediction.groupId,
//         isActive: true
//       });

//       if (group && group.commissionPercent > 0) {
//         const commission =
//           (prediction.finalPayout * group.commissionPercent) / 100;

//         const owner = await usersDB.findOne({
//           telegramId: group.groupOwnerId
//         });

//         if (owner) {
//           const ownerWallet = await UserWalletDB.findOne({
//             userId: owner._id
//           });

//           if (ownerWallet) {
//             const ownerCurrencyWallet = ownerWallet.wallets.find(
//               w => w.currencySymbol === prediction.currency
//             );

//             if (ownerCurrencyWallet) {
//               ownerCurrencyWallet.amount += commission;
//               await ownerWallet.save();
//             }
//           }
//         }
//       }
//     }
   

//     const stats = await Prediction.aggregate([
//       { $match: { userId: prediction.userId, status: { $in: ["WON", "LOST"] } } },
//       {
//         $group: {
//           _id: "$userId",
//           totalPredictions: { $sum: 1 },
//           totalWins: {
//             $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     if (stats.length) {
//       const { totalPredictions, totalWins } = stats[0];
//       const winRate = (totalWins / totalPredictions) * 100;

//       await usersDB.findByIdAndUpdate(prediction.userId, {
//         totalPredictions,
//         totalWins,
//         totalLosses: totalPredictions - totalWins,
//         winRate
//       });
//     }

//     return {
//       status: true,
//       message: "Manual prediction settled successfully",
//       data: {
//         predictionId,
//         status: prediction.status,
//         finalPayout: prediction.finalPayout
//       }
//     };
//   } catch (error) {
//     return {
//       status: false,
//       message: "Failed to settle manual prediction",
//       error: error.message
//     };
//   }
// }

async function manualSettlePredictionHandler(data) {
  try {
    const { predictionId, resolvedOutcome } = data;

    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      console.log("Prediction not found");
      return { status: false, message: "Prediction not found" };
    }


    if (prediction.source !== "manual") {
      console.log("Prediction source is not manual");
      return { status: false, message: "Only manual bets can be settled" };
    }

    if (prediction.status !== "OPEN") {
      return { status: false, message: "Prediction already settled" };
    }

    const isWinner = prediction.outcomeLabel === resolvedOutcome;

    prediction.status = isWinner ? "WON" : "LOST";
    prediction.resolvedOutcome = resolvedOutcome;
    prediction.finalPayout = isWinner ? prediction.potentialPayout : 0;
    prediction.settledAt = new Date();
    await prediction.save();

 if (prediction.manualId) {
  const marketId = new mongoose.Types.ObjectId(prediction.manualId);
  const updatedMarket = await markets.findByIdAndUpdate(
    marketId,
    { active: false, closed: true },
    { new: true }
  );
}

    const walletDoc = await UserWalletDB.findOne({ telegramId: prediction.telegramId });
    if (!walletDoc) {
      return { status: false, message: "User wallet not found" };
    }

    const currencyWallet = walletDoc.wallets.find(w => w.currencySymbol === prediction.currency);
    if (!currencyWallet) {
      return { status: false, message: "Currency wallet not found" };
    }

    currencyWallet.holdAmount -= prediction.amount;

    if (isWinner) {
      currencyWallet.amount += prediction.finalPayout;

      const platformFeeSettings = await PlatformFeeSettings.findOne({ status: true });
      if (platformFeeSettings && platformFeeSettings.feePercentage > 0) {
        const platformFee = (prediction.finalPayout * platformFeeSettings.feePercentage) / 100;

        currencyWallet.amount -= platformFee;

        const adminWallet = await AdminWallet.findOne({ type: 0 });
        if (!adminWallet) {
          console.log("Admin wallet not found");
        } else {
          const adminCurrencyWallet = adminWallet.wallets.find(w => w.currencySymbol === prediction.currency);
          if (!adminCurrencyWallet) {
            console.log("Admin currency wallet not found for:", prediction.currency);
          } else {
            adminCurrencyWallet.amount += platformFee;
            adminWallet.markModified("wallets");
            await adminWallet.save();

            await AdminWalletHistory.create({
              adminWalletId: adminWallet._id,
              userId: prediction.userId,
              predictionId: prediction._id,
              currencySymbol: prediction.currency,
              amount: platformFee,
              feePercentage: platformFeeSettings.feePercentage,
              type: "PLATFORM_FEE",
            });
          }
        }
      }
    }

    walletDoc.markModified("wallets");
    await walletDoc.save();

    if (prediction.groupId && isWinner) {
      const group = await TelegramGroup.findOne({ groupId: prediction.groupId, isActive: true });
      if (group && group.commissionPercent > 0) {
        const commission = (prediction.finalPayout * group.commissionPercent) / 100;
        console.log("Group commission to pay:", commission);

        const owner = await usersDB.findOne({ telegramId: group.groupOwnerId });
        if (owner) {
          const ownerWallet = await UserWalletDB.findOne({ telegramId: owner.telegramId });
          if (ownerWallet) {
            const ownerCurrencyWallet = ownerWallet.wallets.find(w => w.currencySymbol === prediction.currency);
            if (ownerCurrencyWallet) {
              console.log("Owner wallet before commission:", ownerCurrencyWallet.amount);
              ownerCurrencyWallet.amount += commission;
              ownerWallet.markModified("wallets");
              await ownerWallet.save();
              console.log("Owner wallet after commission:", ownerCurrencyWallet.amount);
            }
          }
        }
      }
    }

    const stats = await Prediction.aggregate([
      { $match: { userId: prediction.userId, status: { $in: ["WON", "LOST"] } } },
      { $group: { _id: "$userId", totalPredictions: { $sum: 1 }, totalWins: { $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] } } } }
    ]);

    if (stats.length) {
      const { totalPredictions, totalWins } = stats[0];
      const winRate = (totalWins / totalPredictions) * 100;
      await usersDB.findByIdAndUpdate(prediction.userId, {
        totalPredictions,
        totalWins,
        totalLosses: totalPredictions - totalWins,
        winRate
      });
      console.log("User stats updated:", { totalPredictions, totalWins, winRate });
    }

    return {
      status: true,
      message: "Manual prediction settled successfully",
      data: {
        predictionId,
        status: prediction.status,
        finalPayout: prediction.finalPayout
      }
    };
  } catch (error) {
    console.error("Error settling prediction:", error);
    return {
      status: false,
      message: "Failed to settle manual prediction",
      error: error.message
    };
  }
}



async function getPolyMarketsDetailHandler(data) {
  try {
    const id = data.id;
    const queryData = data.query; 

    const url = new URL(API_URL + "/markets/" + id);

    for (const key in queryData) {
      if (typeof queryData[key] === "object") {
        let dd = queryData[key];
        for (const k in dd) {
          url.searchParams.append(key, dd[k]);
        }
      } else {
        url.searchParams.append(key, queryData[key]);
      }
    }

    const response = await fetch(url, {
      params: JSON.stringify(queryData),
    });

    const json = await response.json();

    const filterJson = [json].map((item) => {
      return MarketDataRetrieved.reduce((acc, curr) => {
        acc.buyNO = (100 - (item.bestBid ? item.bestBid * 100 : 0)).toFixed(2);
        acc.sellNO = (100 - (item.bestAsk ? item.bestAsk * 100 : 0)).toFixed(2);
        acc.sellYes = (item.bestBid ? item.bestBid * 100 : 0).toFixed(2);
        acc.buyYes = (item.bestAsk ? item.bestAsk * 100 : 0).toFixed(2);

        acc[curr] = item[curr];

        return acc;
      }, {});
    });

    return {
      success: true,
      data: filterJson
    };

  } catch (error) {
    return {
      success: false,
      error: error.message || "Unknown error"
    };
  }
}
async function getPolyEventsDetailHandler(data) {
  try {
    const id = data.id;

    const queryData = data.query; 

    const url = new URL(API_URL + "/events/" + id);

    for (const key in queryData) {
      if (typeof queryData[key] === "object") {
        let dd = queryData[key];
        for (const k in dd) {
          url.searchParams.append(key, dd[k]);
        }
      } else {
        url.searchParams.append(key, queryData[key]);
      }
    }

    const response = await fetch(url, {
      params: JSON.stringify(queryData),
    });

    const json = await response.json();

    const filterJson = [json].map((item) => {
      return eventDataRetrieved.reduce((acc, curr) => {
        acc[curr] = item[curr];

        acc.markets = item.markets.map((market) => {
          return MarketDataRetrieved.reduce((acc2, curr2) => {
            acc2[curr2] = market[curr2];

            acc2.buyNO = (100 - (market["bestBid"] ? market["bestBid"] * 100 : 0)).toFixed(2);
            acc2.buyYes = (market["bestAsk"] ? market["bestAsk"] * 100 : 0).toFixed(2);
            acc2.sellYes = (market["bestBid"] ? market["bestBid"] * 100 : 0).toFixed(2);
            acc2.sellNO = (100 - (market["bestAsk"] ? market["bestAsk"] * 100 : 0)).toFixed(2);

            return acc2;
          }, {});
        });

        return acc;
      }, {});
    });

    return {
      success: true,
      data: filterJson
    };

  } catch (error) {
    return {
      success: false,
      error: error.message || "Unknown error"
    };
  }
}
async function createPolyMarketHandler(data) {
  try {
    const queryData = data; 

    const url = new URL(API_URL + "/markets");

    if (queryData && queryData.id.length < 0) {
      throw new Error("Market ID is required.");
    }

    for (const key in queryData) {
      if (typeof queryData[key] === "object") {
        let dd = queryData[key];
        for (const k in dd) {
          url.searchParams.append(key, dd[k]);
        }
      } else {
        url.searchParams.append(key, queryData[key]);
      }
    }

    const response = await fetch(url, {
      params: JSON.stringify(queryData),
    });

    const json = await response.json();

    const filterJson = json.map((item) => {
      return MarketDataRetrieved.reduce((acc, curr) => {
        acc.buyNO = (100 - (item.bestBid ? item.bestBid * 100 : 0)).toFixed(2);
        acc.sellNO = (100 - (item.bestAsk ? item.bestAsk * 100 : 0)).toFixed(2);
        acc.sellYes = (item.bestBid ? item.bestBid * 100 : 0).toFixed(2);
        acc.buyYes = (item.bestAsk ? item.bestAsk * 100 : 0).toFixed(2);
        acc.question = item.events[0].title;
        acc[curr] = item[curr];
        acc.specifyId = item.id;
        acc.totalVolume = item.volume || item.volumeNum;
        acc.outcomes = JSON.parse(item.outcomes);
        acc.liquidity = item.liquidity || item.liquidityNum;

        acc.events = item.events.map((event) => {
          return eventDataRetrieved.reduce((acc2, curr2) => {
            acc2[curr2] = event[curr2];
            return acc2;
          }, {});
        });

        return acc;
      }, {});
    });

    const polyMarket = await polymarketDB.bulkWrite(
      filterJson.map((doc) => ({
        updateOne: {
          filter: { specifyId: doc.id },
          update: { $setOnInsert: doc },
          upsert: true
        }
      }))
    );

    return {
      status: true,
      message: "Market created successfully.",
      data: polyMarket
    };

  } catch (error) {
    return {
      status: false,
      message: "An error occurred while creating the market.",
      error: error.message
    };
  }
}
async function getPolyMarketHandler(data) {
  try {
    const id = data.id;

    if (!id) {
      throw new Error("Market ID is required.");
    }

    const market = await polymarketDB.findById(id);

    return {
      status: true,
      message: "Market fetched successfully.",
      data: market
    };

  } catch (error) {
    return {
      status: false,
      message: "An error occurred while fetching the market.",
      error: error.message
    };
  }
}
async function getAllPolyMarketsHandler(data) {
  try {
    const markets = await polymarketDB.find();

    return {
      status: true,
      message: "Markets fetched successfully.",
      data: markets
    };

  } catch (error) {
    return {
      status: false,
      message: "An error occurred while fetching the markets.",
      error: error.message
    };
  }
}
async function deletePolyMarketHandler(data) {
  try {
    const id = data.id;

    if (!id) {
      throw new Error("Market ID is required.");
    }

    await polymarketDB.deleteOne({ _id: id });

    return {
      status: true,
      message: "Market deleted successfully."
    };

  } catch (error) {
    return {
      status: false,
      message: "An error occurred while deleting the market.",
      error: error.message
    };
  }
}


async function getPolymarketListHandler(data) {
  try {

    const page = parseInt(data.page) || 1;
    const limit = parseInt(data.limit) || 10;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 }, 

      select: {} 
    };

    const result = await polymarketDB.paginate({}, options);

    return {
      status: true,
      data: result.docs,         
      totalPages: result.totalPages,
      currentPage: result.page,
      totalItems: result.totalDocs
    };

  } catch (err) {
    return {
      status: false,
      message: "Something went wrong",
      error: err.message
    };
  }
}


async function getAdminDashboardHandler(data) {
  try {
    const totalUsers = await usersDB.countDocuments();

    const totalBets = await Prediction.countDocuments();

    const activeBets = await Prediction.countDocuments({ status: "OPEN" });

    const completedBets = await Prediction.countDocuments({
      status: { $in: ["WON", "LOST"] },
    });

    const highestWinUser = await usersDB.findOne({})
      .sort({ winRate: -1 })
      .select("firstName username winRate totalPredictions totalWins totalLosses")
      .lean();

    return {
      status: true,
      message: "Admin dashboard stats fetched successfully.",
      data: {
        totalUsers,
        totalBets,
        activeBets,
        completedBets,
        highestWinUser,
      },
    };
  } catch (error) {
    return {
      status: false,
      message: "An error occurred while fetching admin dashboard stats.",
      error: error.message,
    };
  }
}


async function getUserManagementListHandler(data) {
  try {
    const {
      page = 1,
      limit = 10,
      keyword = "",
      fromDate,
      toDate,
    } = data;

    const currentPage = Math.max(1, parseInt(page));
    const pageLimit = parseInt(limit);
    const skip = (currentPage - 1) * pageLimit;

    const query = {};

    if (keyword) {
      query.$or = [
        { firstName: { $regex: keyword, $options: "i" } },
        { username: { $regex: keyword, $options: "i" } },
        // { telegramId: { $regex: keyword, $options: "i" } },
      ];
    }

    if (fromDate || toDate) {
      const dateFilter = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      query.createdAt = dateFilter;
    }

    const total = await usersDB.countDocuments(query);
    const totalPages = Math.ceil(total / pageLimit);

    const dataList = await usersDB
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    const userArray = dataList.map((u) => ({
      _id: u._id,
      telegramId: u.telegramId,
      firstName: u.firstName || "",
      username: u.username || "",
      walletAddress: u.walletAddress || "",
      walletVerified: u.walletVerified,
      status: u.status,
      winRate: u.winRate,
      totalPredictions: u.totalPredictions,
      totalWins: u.totalWins,
      totalLosses: u.totalLosses,
      createdAt: u.createdAt,
    }));

    return {
      status: true,
      message: "User management list fetched successfully.",
      data: userArray,
      totalPages,
      currentPage,
      totalRecords: total,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error fetching user management list.",
      error: error.message,
    };
  }
}

async function getDepositList(data) {
  try {
    const { page, limit, fromDate, toDate, keyword } = data;

    // Pagination
    const pageNew = parseInt(page) || 1;
    const limitNew = parseInt(limit) || 5;
    const skip = (pageNew - 1) * limitNew;

    // 🔹 Build query dynamically
    let query = {};

    // Keyword search (walletName or Address)
    if (keyword && keyword.trim() !== "") {
      query.$or = [
        { Address: { $regex: keyword, $options: "i" } },
      ];
    }

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};

      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }

      if (toDate) {
        // Include full end day
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // 🔹 Fetch paginated data
    const Lists = await depositList
      .find(
        query,
        {
          Address: 1,
          walletName: 1,
          createdAt: 1,
          status: 1,
          Amount: 1,
          telegramId:1
        }
      )
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNew);
      
    const count = await depositList.countDocuments(query);
    const totalPages = Math.ceil(count / limitNew);

    return {
      status: true,
      data: Lists,
      totalPages,
      currentPage: pageNew,
      totalRecords: count,
    };
  } 
 catch (err) {
    console.error(err, "Error in getAdmin");
    return {
      status: false,
      Message: "Server error",
      error: err.message,

    }}}

    async function getWithdrawlist(data) {
  try {
    const { page, limit, fromDate, toDate, keyword } = data;

    // Pagination
    const pageNew = parseInt(page) || 1;
    const limitNew = parseInt(limit) || 5;
    const skip = (pageNew - 1) * limitNew;

    // 🔹 Build query dynamically
    let query = {};

    // Keyword search (walletName or Address)
    if (keyword && keyword.trim() !== "") {
      query.$or = [
        { withdraw_address: { $regex: keyword, $options: "i" } },
      ];
    }

    // Date range filter
    if (fromDate || toDate) {
      query.created_at = {};

      if (fromDate) {
        query.created_at.$gte = new Date(fromDate);
      }

      if (toDate) {
        // Include full end day
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.created_at.$lte = endDate;
      }
    }

    // 🔹 Fetch paginated data
    const Lists = await WithdrawDB
      .find(
        query,
        {
          withdraw_address: 1,
          created_at: 1,
          status: 1,
          amount: 1,
          telegramId:1
        }
      )
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNew);
      
    const count = await WithdrawDB.countDocuments(query);
    const totalPages = Math.ceil(count / limitNew);

    return {
      status: true,
      data: Lists,
      totalPages,
      currentPage: pageNew,
      totalRecords: count,
    };
  } 
 catch (err) {
    console.error(err, "Error in getAdmin");
    return {
      status: false,
      Message: "Server error",
      error: err.message,

    }}}


async function getPredictionManagementListHandler(data) {
  try {
    const {
      page = 1,
      limit = 10,
      keyword = "",
      fromDate,
      toDate,
      status,
      source
    } = data;

    const currentPage = Math.max(1, parseInt(page));
    const pageLimit = parseInt(limit);
    const skip = (currentPage - 1) * pageLimit;

    const matchQuery = {};

    if (fromDate || toDate) {
      const dateFilter = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      matchQuery.createdAt = dateFilter;
    }

    if (status) matchQuery.status = status;
    if (source) matchQuery.source = source;

    const pipeline = [
      { $match: matchQuery },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      {
        $lookup: {
          from: "polymarkets",
          localField: "conditionId",
          foreignField: "conditionId",
          as: "polyMarket"
        }
      },

      {
        $lookup: {
          from: "markets",
          localField: "manualId",
          foreignField: "_id",
          as: "manualMarket"
        }
      },

      {
        $addFields: {
          marketQuestion: {
            $cond: [
              { $eq: ["$source", "poly"] },
              { $arrayElemAt: ["$polyMarket.question", 0] },
              { $arrayElemAt: ["$manualMarket.question", 0] }
            ]
          },

          outcomes: {
            $cond: [
              { $eq: ["$source", "poly"] },
              { $arrayElemAt: ["$polyMarket.outcomes", 0] },
              { $arrayElemAt: ["$manualMarket.outcomes", 0] }
            ]
          },

          outcomePrices: {
            $cond: [
              { $eq: ["$source", "poly"] },
              { $arrayElemAt: ["$polyMarket.outcomePrices", 0] },
              { $arrayElemAt: ["$manualMarket.outcomePrices", 0] }
            ]
          }
        }
      },

      ...(keyword
        ? [
            {
              $match: {
                $or: [
                  { "user.firstName": { $regex: keyword, $options: "i" } },
                  { "user.username": { $regex: keyword, $options: "i" } },
                  { marketQuestion: { $regex: keyword, $options: "i" } }
                ]
              }
            }
          ]
        : []),

      { $sort: { createdAt: -1 } },

      { $skip: skip },
      { $limit: pageLimit },

      {
        $project: {
          _id: 1,
          amount: 1,
          odds: 1,
          shares: 1,
          potentialPayout: 1,
          potentialProfit: 1,
          currency: 1,
          status: 1,
          source: 1,
          outcomeLabel: 1,
          createdAt: 1,
          chatType: 1,
          question: 1,             
          marketQuestion: 1,        
          outcomes: 1,
          outcomePrices: 1,

          user: {
            telegramId: "$user.telegramId",
            firstName: "$user.firstName",
            username: "$user.username"
          }
        }
      }
    ];

    const [dataList, countResult] = await Promise.all([
      Prediction.aggregate(pipeline),
      Prediction.aggregate([
        ...pipeline.filter(
          p => !p.$skip && !p.$limit && !p.$project
        ),
        { $count: "total" }
      ])
    ]);

    const totalRecords = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalRecords / pageLimit);

    return {
      status: true,
      message: "Prediction management list fetched successfully.",
      data: dataList,
      totalPages,
      currentPage,
      totalRecords
    };
  } catch (error) {
    return {
      status: false,
      message: "Error fetching prediction management list.",
      error: error.message
    };
  }
}


async function currencyAddUpdate(data) {
 try {
      const isAddOperation = !data._id || data._id.trim() === "";
      const deposit_status = data.depositStatus?.trim() || "Active";
      const withdraw_status = data.withdrawStatus?.trim() || "Active";  
      const autowithdraw_status =
        data.autowithdrawStatus?.trim() || "Active";
console.log(data.fiatwithdrawFee,"data.fiatwithdrawFee")
      if (isAddOperation) {
        //----------Currency creation--------//
        const currenciesCount = await currencyDB.countDocuments();

        const currencyCreate = {
          currencyName: data.currencyName,
          currencySymbol: data.currencySymbol,
          currencyType: data.currencyType,
          coinType: data.coinType,
          status: data.status,
          depositStatus: deposit_status,
          withdrawStatus: withdraw_status,
          tradeStatus: data.tradeStatus,
          makerFee: data.makerFee,
          takerFee: data.takerFee,
          withdrawFee: data.fiatwithdrawFee,
          minWithdrawLimit: data.minWithdrawLimit,
          maxWithdrawLimit: data.maxWithdrawLimit,
          minTradeAmount: data.minTradeAmount,
          maxTradeAmount: data.maxTradeAmount,
          Withdraw24Limit: data.Withdraw24Limit,
          Currency_image: data.Currency_image,
          modifiedDate: data.modifiedDate,
          erc20token: data.erc20token,
          trc20token: data.trc20token,
          bep20token: data.bep20token,
          rptc20token: data.rptc20token,
          p2p_status: data.p2p_status,
          minDepositLimit: data.minDepositLimit,
          maxDepositLimit: data.maxDepositLimit,
          popularOrder: currenciesCount + 1,
          maxSwap: data.maxSwap ? +data.maxSwap : 0,
          minSwap: data.minSwap ? +data.minSwap : 0,
          swapStatus: data.swapStatus ? +data.swapStatus : "0",
          swapFee: data.swapFee ? +data.swapFee : 0,
          swapPrice: data.swapPrice ? +data.swapPrice : 0,
          coin_price: data.coin_price ? +data.coin_price : 0,
          contractAddress_erc20: data.contractAddress_erc20 || "",
          coinDecimal_erc20: data.coinDecimal_erc20 || "",
          contractAddress_bep20: data.contractAddress_bep20 || "",
          coinDecimal_bep20: data.coinDecimal_bep20 || "",
          contractAddress_trc20: data.contractAddress_trc20 || "",
          coinDecimal_trc20: data.coinDecimal_trc20 || "",
          contractAddress_rptc20: data.contractAddress_rptc20 || "",
          coinDecimal_rptc20: data.coinDecimal_rptc20 || "",
          autowithdrawLimit: data.autowithdrawLimit,
          autowithdrawStatus: autowithdraw_status,
        };

        const createdData = await currencyDB.create(currencyCreate);
        console.log(createdData, "createdData1");

        if (createdData) {
          console.log("createdData111111");

          const userdetails = await usersDB.find({});
          const bulkOperations = userdetails.map((user) => ({
            updateOne: {
              filter: { userId: user._id },
              update: {
                $push: {
                  wallets: {
                    currencyId: createdData._id,
                    currencyName: createdData.currencyName,
                    currencySymbol: createdData.currencySymbol,
                    amount: 0,
                  },
                },
              },
            },
          }));
          console.log(
            bulkOperations,
            "bulkOperationsbulkOperationsbulkOperations"
          );
          for (let i = 0; i < bulkOperations.length; i += 1000) {
            await userWalletDB.bulkWrite(bulkOperations.slice(i, i + 1000));
          }


          return ({
            status: true,
            Message: "Currency added successfully",
          });
        } else {
          return ({
            status: false,
            Message: "Cannot add currency. Please try again later",
          });
        }
      } else {
console.log(data.fiatwithdrawFee,"data.fiatwithdrawFee")

        //----------Currency update--------//
        const updatedData = await currencyDB.updateOne(
          { _id: data._id },
          {
            $set: {
              currencyName: data.currencyName,
              currencySymbol: data.currencySymbol,
              currencyType: data.currencyType,
              coinType: data.coinType,
              status: data.status,
              depositStatus: deposit_status,
              withdrawStatus: withdraw_status,
              tradeStatus: data.tradeStatus,
              makerFee: data.makerFee,
              takerFee: data.takerFee,
              withdrawFee: data.fiatwithdrawFee,
              minWithdrawLimit: data.minWithdrawLimit,
              maxWithdrawLimit: data.maxWithdrawLimit,
              minTradeAmount: data.minTradeAmount,
              maxTradeAmount: data.maxTradeAmount,
              Withdraw24Limit: data.Withdraw24Limit,
              Currency_image: data.Currency_image,
              modifiedDate: data.modifiedDate,
              erc20token: data.erc20token,
              trc20token: data.trc20token,
              bep20token: data.bep20token,
              rptc20token: data.rptc20token,
              p2p_status: data.p2p_status,
              minDepositLimit: data.minDepositLimit,
              maxDepositLimit: data.maxDepositLimit,
              maxSwap: data.maxSwap ? +data.maxSwap : 0,
              minSwap: data.minSwap ? +data.minSwap : 0,
              swapStatus: data.swapStatus ? +data.swapStatus : "0",
              swapFee: data.swapFee ? +data.swapFee : 0,
              swapPrice: data.swapPrice ? +data.swapPrice : 0,
              coin_price: data.coin_price ? +data.coin_price : 0,
              contractAddress_erc20: data.contractAddress_erc20 || "",
              coinDecimal_erc20: data.coinDecimal_erc20 || "",
              contractAddress_bep20: data.contractAddress_bep20 || "",
              coinDecimal_bep20: data.coinDecimal_bep20 || "",
              contractAddress_trc20: data.contractAddress_trc20 || "",
              coinDecimal_trc20: data.coinDecimal_trc20 || "",
              contractAddress_rptc20: data.contractAddress_rptc20 || "",
              coinDecimal_rptc20: data.coinDecimal_rptc20 || "",
              autowithdrawLimit: data.autowithdrawLimit,
              autowithdrawStatus: autowithdraw_status,
            },
          }
        );

        console.log(updatedData, "updatedData");
        if (updatedData.modifiedCount === 1) {
          return ({
            status: true,
            Message: "Currency updated successfully",
          });
        } else {
          return ({
            status: false,
            Message: "Cannot update currency. Please try again later",
          });
        }
      }
    } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function  currencyDelete(data){
  try{
     const { _id } = data;

      if (!_id) {
        return res.status(400).json({
          status: false,
          Message: "Currency ID is required",
        });
      }

      const deleteres = await currencyDB.findOneAndDelete({ _id });
      if (deleteres) {
        return res.status(200).json({
          status: true,
          Message: "Currency deleted successfully",
        });
      } else {
        return res.status(400).json({
          status: false,
          Message: "Currency could not be deleted",
        });
      }
  } catch (err) {
    console.error(err, "Error in getAdmin");
    return {
      status: false,
      Message: "Server error",
      error: err.message,
    };
  }
}
async function  allCurrencyList(datas){
   try {
      let { page = 1, limit = 5, keyword = "" } = datas

      const currentPage = Math.max(1, parseInt(page, 10));
      const pageSize = Math.max(1, parseInt(limit, 10));
      const query = {
        $or: [
          { currencyName: { $regex: keyword, $options: "i" } },
          { currencySymbol: { $regex: keyword, $options: "i" } },
        ],
      };

      const totalItems = await currencyDB.countDocuments(query);

      const currencyData = await currencyDB
        .find(query)
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .exec();

      const data = currencyData.map((currency, index) => ({
        _id: currency._id,
        id: index + 1 + (currentPage - 1) * pageSize, // Adjust ID based on page
        name: currency.currencyName,
        symbol: currency.currencySymbol,
        Currency_image: currency.Currency_image,
        status: currency.status,
        date: moment(currency.modifiedDate).format("lll"),
        currencyType: currency.currencyType,
      }));

      return({
        status: true,
        data: data,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: currentPage,
        totalItems: totalItems,
        Message: "Currency data fetched successfully",
      });
    } catch (err) {
    console.error(err, "Error in getAdmin");
    return {
      status: false,
      Message: "Server error",
      error: err.message,
    };
  }
}
async function  viewOneCurrency(data){
  try{
 var currencyData = await currencyDB.findOne({ _id: data._id });

      if (!currencyData) {
        return ({ status: false, Message: {} });
      } else {
        return ({ status: true, Message: currencyData });
      }
  } catch (err) {
    console.error(err, "Error in getAdmin");
    return {
      status: false,
      Message: "Server error",
      error: err.message,
    };
  }
}



// async function exitPredictionHandler(data) {
//   try {
//     const { predictionId } = data;

//     if (!predictionId) {
//       return {
//         status: false,
//         Message: "Prediction ID is required",
//       };
//     }

//     const bet = await Prediction.findById(predictionId);

//     if (!bet || bet.status !== "OPEN") {
//       return {
//         status: false,
//         Message: "Invalid or already closed prediction",
//       };
//     }

//     const exitValue = bet.shares * bet.currentPrice;
//     const pnl = exitValue - bet.amount;

//     let creditedAmount = exitValue;

//     if (bet.chatType === "private") {
//       const wallet = await userWalletDB.findOne({ telegramId: bet.telegramId });

//       if (!wallet) {
//         return {
//           status: false,
//           Message: "User wallet not found",
//         };
//       }

//       const currencyWallet = wallet.wallets.find(
//         (w) => w.currencySymbol === bet.currency
//       );

//       if (!currencyWallet) {
//         return {
//           status: false,
//           Message: "Currency wallet not found",
//         };
//       }

//       currencyWallet.holdAmount -= bet.amount;

//       currencyWallet.amount += exitValue;

//       const platformFeeSettings = await PlatformFeeSettings.findOne({
//         status: true,
//       });

//       if (platformFeeSettings && platformFeeSettings.feePercentage > 0) {
//         const platformFee =
//           (exitValue * platformFeeSettings.feePercentage) / 100;

//         currencyWallet.amount -= platformFee;
//         creditedAmount -= platformFee;

//         const adminWallet = await AdminWallet.findOne({ type: 0 });
//         if (adminWallet) {
//           const adminCurrencyWallet = adminWallet.wallets.find(
//             (w) => w.currencySymbol === bet.currency
//           );

//           if (adminCurrencyWallet) {
//             adminCurrencyWallet.amount += platformFee;
//             await adminWallet.save();

//             await AdminWalletHistory.create({
//               adminWalletId: adminWallet._id,
//               userId: bet.userId,
//               predictionId: bet._id,
//               currencySymbol: bet.currency,
//               amount: platformFee,
//               feePercentage: platformFeeSettings.feePercentage,
//               type: "PLATFORM_FEE",
//             });
//           }
//         }
//       }

//       await wallet.save();
//     }

//     if (bet.chatType !== "private" && bet.groupId) {
//       const group = await TelegramGroup.findOne({
//         groupId: bet.groupId,
//         isActive: true,
//       });

//       if (!group) {
//         return {
//           status: false,
//           Message: "Group not found",
//         };
//       }

//       const commissionPercent = group.commissionPercent || 0;
//       const commissionAmount = (exitValue * commissionPercent) / 100;
//       let userAmount = exitValue - commissionAmount;

//       const userWallet = await userWalletDB.findOne({ telegramId: bet.telegramId });

//       if (!userWallet) {
//         return {
//           status: false,
//           Message: "User wallet not found",
//         };
//       }

//       const userCurrency = userWallet.wallets.find(
//         (w) => w.currencySymbol === bet.currency
//       );

//       if (!userCurrency) {
//         return {
//           status: false,
//           Message: "User currency wallet not found",
//         };
//       }

//       userCurrency.holdAmount -= bet.amount;

//       const platformFeeSettings = await PlatformFeeSettings.findOne({
//         status: true,
//       });

//       if (platformFeeSettings && platformFeeSettings.feePercentage > 0) {
//         const platformFee =
//           (exitValue * platformFeeSettings.feePercentage) / 100;

//         userAmount -= platformFee;

//         const adminWallet = await AdminWallet.findOne({ type: 0 });
//         if (adminWallet) {
//           const adminCurrencyWallet = adminWallet.wallets.find(
//             (w) => w.currencySymbol === bet.currency
//           );

//           if (adminCurrencyWallet) {
//             adminCurrencyWallet.amount += platformFee;
//             await adminWallet.save();

//             await AdminWalletHistory.create({
//               adminWalletId: adminWallet._id,
//               userId: bet.userId,
//               predictionId: bet._id,
//               currencySymbol: bet.currency,
//               amount: platformFee,
//               feePercentage: platformFeeSettings.feePercentage,
//               type: "PLATFORM_FEE",
//             });
//           }
//         }
//       }

//       userCurrency.amount += userAmount;
//       await userWallet.save();

//       const adminUser = await usersDB.findOne({
//         telegramId: group.groupOwnerId,
//       });

//       if (adminUser && commissionAmount > 0) {
//         const adminWallet = await userWalletDB.findOne({
//           userId: adminUser._id,
//         });

//         if (adminWallet) {
//           const adminCurrency = adminWallet.wallets.find(
//             (w) => w.currencySymbol === bet.currency
//           );

//           if (adminCurrency) {
//             adminCurrency.amount += commissionAmount;
//             await adminWallet.save();
//           }
//         }
//       }
//     }

//     bet.status = "CLOSED";
//     bet.finalPayout = creditedAmount;
//     bet.unrealizedPnl = 0;
//     bet.settledAt = new Date();
//     await bet.save();

//     const userStats = await Prediction.aggregate([
//       {
//         $match: {
//           userId: bet.userId,
//           status: { $in: ["WON", "LOST", "CLOSED"] },
//         },
//       },
//       {
//         $group: {
//           _id: "$userId",
//           totalPredictions: { $sum: 1 },
//           totalWins: {
//             $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] },
//           },
//         },
//       },
//     ]);

//     if (userStats.length) {
//       const { totalPredictions, totalWins } = userStats[0];
//       const winRate = (totalWins / totalPredictions) * 100;

//       await usersDB.findByIdAndUpdate(bet.userId, {
//         totalPredictions,
//         totalWins,
//         totalLosses: totalPredictions - totalWins,
//         winRate,
//       });
//     }

//     return {
//       status: true,
//       Message: "Prediction exited successfully",
//       data: {
//         predictionId: bet._id,
//         exitValue,
//         pnl,
//       },
//     };
//   } catch (err) {
//     console.error("Error in exitPrediction:", err);
//     return {
//       status: false,
//       Message: "Server error",
//       error: err.message,
//     };
//   }
// }



async function exitPredictionHandler(data) {
  try {
    const { predictionId } = data;

    if (!predictionId) {
      return {
        status: false,
        Message: "Prediction ID is required",
      };
    }

    const bet = await Prediction.findById(predictionId);

    if (!bet || bet.status !== "OPEN") {
      return {
        status: false,
        Message: "Invalid or already closed prediction",
      };
    }

    const exitValue = bet.shares * bet.currentPrice;
    const pnl = exitValue - bet.amount;

    let creditedAmount = exitValue;

   
    if (bet.chatType === "private") {

      if (bet.deductedFrom === "userWallet") {
        const wallet = await userWalletDB.findOne({ telegramId: bet.telegramId });

        if (!wallet) {
          return { status: false, Message: "User wallet not found" };
        }

        const currencyWallet = wallet.wallets.find(
          (w) => w.currencySymbol === bet.currency
        );

        if (!currencyWallet) {
          return { status: false, Message: "Currency wallet not found" };
        }

        currencyWallet.holdAmount -= bet.amount;
        currencyWallet.amount += exitValue;

        const platformFeeSettings = await PlatformFeeSettings.findOne({ status: true });

        if (platformFeeSettings && platformFeeSettings.feePercentage > 0) {
          const platformFee =
            (exitValue * platformFeeSettings.feePercentage) / 100;

          currencyWallet.amount -= platformFee;
          creditedAmount -= platformFee;

          const adminWallet = await AdminWallet.findOne({ type: 0 });
          if (adminWallet) {
            const adminCurrencyWallet = adminWallet.wallets.find(
              (w) => w.currencySymbol === bet.currency
            );

            if (adminCurrencyWallet) {
              adminCurrencyWallet.amount += platformFee;
              await adminWallet.save();

              await AdminWalletHistory.create({
                adminWalletId: adminWallet._id,
                userId: bet.userId,
                predictionId: bet._id,
                currencySymbol: bet.currency,
                amount: platformFee,
                feePercentage: platformFeeSettings.feePercentage,
                type: "PLATFORM_FEE",
              });
            }
          }
        }

        await wallet.save();
      }

      if (bet.deductedFrom === "userPublicWallet") {
        const publicWallet = await userPublicWallet.findOne({
          telegramId: bet.telegramId,
        });

        if (!publicWallet) {
          return { status: false, Message: "User public wallet not found" };
        }

        const publicCurrency = publicWallet.wallets.find(
          (w) => w.network === bet.currency
        );

        if (!publicCurrency) {
          return { status: false, Message: "Public wallet currency not found" };
        }

        publicCurrency.holdAmount -= bet.amount;
        publicCurrency.amount += exitValue;

        await publicWallet.save();
      }
    }

   
    if (bet.chatType !== "private" && bet.groupId) {
      const group = await TelegramGroup.findOne({
        groupId: bet.groupId,
        isActive: true,
      });

      if (!group) {
        return { status: false, Message: "Group not found" };
      }

      const commissionPercent = group.commissionPercent || 0;
      const commissionAmount = (exitValue * commissionPercent) / 100;
      let userAmount = exitValue - commissionAmount;

      const userWallet = await userWalletDB.findOne({ telegramId: bet.telegramId });

      if (!userWallet) {
        return { status: false, Message: "User wallet not found" };
      }

      const userCurrency = userWallet.wallets.find(
        (w) => w.currencySymbol === bet.currency
      );

      if (!userCurrency) {
        return { status: false, Message: "User currency wallet not found" };
      }

      userCurrency.holdAmount -= bet.amount;

      const platformFeeSettings = await PlatformFeeSettings.findOne({ status: true });

      if (platformFeeSettings && platformFeeSettings.feePercentage > 0) {
        const platformFee =
          (exitValue * platformFeeSettings.feePercentage) / 100;

        userAmount -= platformFee;

        const adminWallet = await AdminWallet.findOne({ type: 0 });
        if (adminWallet) {
          const adminCurrencyWallet = adminWallet.wallets.find(
            (w) => w.currencySymbol === bet.currency
          );

          if (adminCurrencyWallet) {
            adminCurrencyWallet.amount += platformFee;
            await adminWallet.save();

            await AdminWalletHistory.create({
              adminWalletId: adminWallet._id,
              userId: bet.userId,
              predictionId: bet._id,
              currencySymbol: bet.currency,
              amount: platformFee,
              feePercentage: platformFeeSettings.feePercentage,
              type: "PLATFORM_FEE",
            });
          }
        }
      }

      userCurrency.amount += userAmount;
      await userWallet.save();

      const adminUser = await usersDB.findOne({
        telegramId: group.groupOwnerId,
      });

      if (adminUser && commissionAmount > 0) {
        const adminWallet = await userWalletDB.findOne({
          userId: adminUser._id,
        });

        if (adminWallet) {
          const adminCurrency = adminWallet.wallets.find(
            (w) => w.currencySymbol === bet.currency
          );

          if (adminCurrency) {
            adminCurrency.amount += commissionAmount;
            await adminWallet.save();
          }
        }
      }
    }

   
    bet.status = "CLOSED";
    bet.finalPayout = creditedAmount;
    bet.unrealizedPnl = 0;
    bet.settledAt = new Date();
    await bet.save();

    const userStats = await Prediction.aggregate([
      {
        $match: {
          userId: bet.userId,
          status: { $in: ["WON", "LOST", "CLOSED"] },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalPredictions: { $sum: 1 },
          totalWins: {
            $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] },
          },
        },
      },
    ]);

    if (userStats.length) {
      const { totalPredictions, totalWins } = userStats[0];
      const winRate = (totalWins / totalPredictions) * 100;

      await usersDB.findByIdAndUpdate(bet.userId, {
        totalPredictions,
        totalWins,
        totalLosses: totalPredictions - totalWins,
        winRate,
      });
    }

    return {
      status: true,
      Message: "Prediction exited successfully",
      data: {
        predictionId: bet._id,
        exitValue,
        pnl,
      },
    };
  } catch (err) {
    console.error("Error in exitPrediction:", err);
    return {
      status: false,
      Message: "Server error",
      error: err.message,
    };
  }
}


async function createPlatformfeeHandler(data) {
  try {
    const { feePercentage, status } = data;

    if (feePercentage < 0 || feePercentage > 100) {
      return {
        status: false,
        message: "Fee percentage must be between 0 and 100",
      };
    }

    const settings = await PlatformFeeSettings.findOneAndUpdate(
      {}, 
      {
        feePercentage,
        status,
      },
      {
        new: true,    
        upsert: true,  
      }
    );

    return {
      status: true,
      message: "Platform fee settings updated successfully",
      data: settings,
    };
  } catch (error) {
    return {
      status: false,
      message: "Failed to update platform fee settings",
      error: error.message,
    };
  }
}

async function getPlatformFeeSettingsHandler() {
  try {
    let settings = await PlatformFeeSettings.findOne().lean();

    if (!settings) {
      settings = await PlatformFeeSettings.create({
        feePercentage: 1, 
        status: true,
      });
    }

    return {
      status: true,
      message: "Platform fee settings fetched successfully",
      data: {
        feePercentage: settings.feePercentage,
        status: settings.status,
      },
    };
  } catch (error) {
    return {
      status: false,
      message: "Failed to fetch platform fee settings",
      error: error.message,
    };
  }
}



module.exports = {createMarketHandler,getPlatformFeeSettingsHandler,createPlatformfeeHandler,manualSettlePredictionHandler,exitPredictionHandler,getUserManagementListHandler,getAdminDashboardHandler,getMarketHandler,deleteMarketHandler,updateMarketHandler,loginUser,forgotemailHandler,getAllMarketsHandler,getCombinedAllMarketsHandler,forgototpverifyHandler,resendemailotpHandler,forgotpasswordHandler,getAdminHandler,getDepositList,getWithdrawlist,verifyTokenHandler,adminloggHandler,dashboardcountsHandler,getAllEventsHandler,getEventHandler,UpdateEventHandler,deleteEventHandler,createEventHandler,currencyAddUpdate,currencyDelete, allCurrencyList,viewOneCurrency,getPredictionManagementListHandler};
