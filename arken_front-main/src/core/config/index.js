let env = import.meta.env; // <-- ONLY CHANGE

export const link = {
  apiService: {
    main: env.REACT_APP_APISERVICE_MAIN,
  },
  siteUrl: env.REACT_APP_siteUrl,
  adminUrl: env.REACT_APP_adminUrl,
};
