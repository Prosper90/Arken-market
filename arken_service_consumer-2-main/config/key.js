let key = {};
// if (process.env.NODE_ENV === 'production') {

// } else {
    const API_URL = process.env.API_URL;
    key = {
        host          : process.env.HOST,
        secretOrKey   : "FxUum76z",
        mongoURI      : process.env.DB_URL,
        port          : process.env.PORT,
        siteUrl       : process.env.SITE_URL,
        baseUrl       : process.env.BASE_URL,
        API: {
        },
        WHITELISTURL: [
            'http://localhost:62393',
            'http://localhost:4200',
            'http://localhost:4200/',
            'http://localhost:3033',
            'http://localhost:5000',
            'http://localhost:3000',
            'http://localhost:3001/',
            'http://localhost:3001',
            'http://localhost:3002',
            'https://capitalexc.blfdemo.online/',
            'https://capitalexc.blfdemo.online',
            'https://capitalexc.blfdemo.online/capitalexc_admin/',
            'https://capitalexc.blfdemo.online/capitalexc_admin',
            'https://www.capitalexc.blfdemo.online/',
            'https://www.capitalexc.blfdemo.online',
            'https://www.capitalexc.blfdemo.online/capitalexc_admin/',
            'https://www.capitalexc.blfdemo.online/capitalexc_admin',
            undefined

        ],
        JWT_TOKEN_SECRET        : process.env.JWT_TOKEN_SECRET,
        address_validator       : "testnet", // prod - mainnet, testnet - testnet,
        sendgrid_api            : process.env.SENDGRID_API_KEY,
        from_mail               : process.env.FROM_EMAIL,
        ENCRYPTION_KEY          : process.env.ENCRYPTION_KEY,
        IV_LENGTH               : 16,
        // redisdata               : {port: '', host: '',db: 0, password: ''},
        redisdata               : {},
        baseUrl_admin           : 'http://localhost:4200/'
    };
// }
module.exports = key;