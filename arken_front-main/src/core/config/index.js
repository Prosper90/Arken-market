let env = import.meta.env;   // <-- ONLY CHANGE
console.log('envenvenv : ', env);

export const SECRET_KEY = {
    'JWT': '4a3927b4b0dd892558f0a3dee7b17d2242c6072e7685a9db357bd1aea9ee83c8',
}

export const GOOGLE = {
    recaptcha: {
        status: 'de-active',
        key: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    }
}

export const link = {
    apiService: {
        main: env.REACT_APP_APISERVICE_MAIN
    },
    siteUrl: env.REACT_APP_siteUrl,
    adminUrl: env.REACT_APP_adminUrl
}
