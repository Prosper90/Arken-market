const mongoose = require('mongoose');
const BankSchema = mongoose.Schema({
    Account_Number: { type: Number, default: 0 },
    Bank_Name: { type: String, default: '' },
    IFSC_code: { type: String, default: '' },
    Branch_Name: { type: String, default: '' },
    Bankshort_Name: { type: String, default: '' },
    Holder_Name: { type: String, default: '' },
});

const UPISchema = mongoose.Schema({
    type: { type: String, default: '' }, // e.g., 'gpay', 'paypal', 'phonepe'
    UPI_code: { type: String, default: '' },
});
const AdminSchema = mongoose.Schema({
    email: { type: String },
    adminEmail: { type: String },
    userName: { type: String },
    password: { type: String },
    forgotPass: { type: Number, default: 0 },
    forgotEmailotp: { type: String, default: "" },
    admintype: { type: Number, default: 0 },
    changeMail: { type: Number, default: 0 },
    createdDate: { type: Date, default: Date.now() },
    modifiedDate: { type: Date, default: Date.now() },
    Account_Number: { type: Number, default: 0 },
    Bank_Name: { type: String, default: '' },
    IFSC_code: { type: String, default: '' },
    Branch_Name: { type: String, default: '' },
    banks: [BankSchema], // Store multiple banks
    upis: [UPISchema], // Store multiple UPI types
    tfa_code: { type: String, default: "" },
    tfa_url: { type: String, default: "" },
    tfaenablekey: { type: String, default: "" },
    tfa_status: { type: Number, default: 0 },
    wallet_password: { type: String },
    key_auth_otp: { type: Number, default: 0 },
    // user_management: { type: Number,default:0 }, //1-active 0-deactive
    // wallet_management: { type: Number,default:0 }, //1-active 0-deactive
    // trade_management: { type: Number,default:0 }, //1-active 0-deactive
    // userip_management: { type: Number,default:0 }, //1-active 0-deactive
    // settings_management: { type: Number,default:0 }, //1-active 0-deactive
    // currency_management: { type: Number,default:0 }, //1-active 0-deactive
    // cryptodeposit_management: { type: Number,default:0 }, //1-active 0-deactive
    // cryptowithdraw_management: { type: Number,default:0 }, //1-active 0-deactive
    // tradepair_management: { type: Number,default:0 }, //1-active 0-deactive
    // mailtemplate_management: { type: Number,default:0 }, //1-active 0-deactive
    // home_management: { type: Number,default:0 }, //1-active 0-deactive
    // about_management: { type: Number,default:0 }, //1-active 0-deactive
    // cms_management: { type: Number,default:0 }, //1-active 0-deactive
    // faq_management: { type: Number,default:0 }, //1-active 0-deactive
    // supportcategory_management: { type: Number,default:0 }, //1-active 0-deactive
    // support_management: { type: Number,default:0 }, //1-active 0-deactive
    // contactus_management: { type: Number,default:0 }, //1-active 0-deactive
    type: { type: Number, default: 0 },//1-subadmin 0-admin
    status: { type: String, default: "active" },
    reset_password_timer: { type: Date },
    permissions_id: { type: [Number] },
    Permissions: { type: [String] },
    loginOTP: { type: String, default: '' },
    withdrawOTP: { type: String, default: '' },
    expireTime: { type: Date, index: true },
    username: { type: String, default: '' },
    key_auth_expireTime: { type: Date, index: true },
    userswithdraws: [
        {
            userId: mongoose.Schema.Types.ObjectId,
            amount: Number,
            receive_amount: Number,
            fees: Number,
            accname: String,
            bankname: String,
            branch: String,
            accnumber: Number,
            ifsc_code: String,
            tx_type: String,
            upi_code: String,
            txn_type: { type: String, default:"Fiat"},
            status: { type: Number, default: 0 },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    usersdeposits: [
        {
            userId: mongoose.Schema.Types.ObjectId,
            amount: Number,
            receive_amount: Number,
            fees: Number,
            tx_img: String,
            tx_type: String,
            txId: String,
            txn_type: { type: String, default:"Fiat"},
            status: { type: Number, default: 0 },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    storedHistory: [
        {
            userId: mongoose.Schema.Types.ObjectId,
            amount: Number,
            receive_amount: Number,
            fees: Number,
            accname: String,
            bankname: String,
            branch: String,
            accnumber: Number,
            ifsc_code: String,
            upi_code: String,
            tx_img: String,
            tx_type: String,
            txId: String,
            status: { type: Number, default: 0 },
            createdAt: { type: Date, default: Date.now },
        },
    ],
});

module.exports = mongoose.model('admin', AdminSchema);