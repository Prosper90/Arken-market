export const getAuthToken = () => {
    if (sessionStorage.getItem("user_token")) {
      return sessionStorage.getItem("user_token");
    }
    return "";
  };
  
  // export const removeAuthToken = () => {
  //   localStorage.removeItem("user_token");
  //   localStorage.removeItem("socket_token");
  //   window.location.href = "/";
  // };

  export const removeAuthToken = () => {
    localStorage.removeItem("walletaddress");
    window.location.href = "/";
  };
  
  export const removeWalletconnect = () => {
    localStorage.removeItem("walletconnect");
  };
  
  export const setAuthToken = (token) => {
    localStorage.setItem("user_token", token);
    return true;
  };
  
  export const setWalletConn = (status) => {
    localStorage.setItem("walletConn", status);
    return true;
  };
  
  export const removeWalletConn = () => {
    localStorage.removeItem("walletConn");
  };
  
  export const getWalletConn = () => {
    return localStorage.getItem("walletConn");
  };
  
  export const setTheme = async (theme) => {
    if (theme == "dark") {
      document.body.classList.add("light_theme");
    } else {
      document.body.classList.remove("light_theme");
    }
    localStorage.setItem("theme", theme);
    return theme;
  };
  
  export const getTheme = () => {
    let theme = localStorage.getItem("theme");
    if (theme) {
      if (theme == "dark") {
        document.body.classList.add("light_theme");
      } else if (theme == "light") {
        document.body.classList.remove("light_theme");
      }
    } else {
      theme = "light";
    }
    return theme;
  };
  
  export const setTradeTheme = async (theme) => {
    localStorage.setItem("tradeTheme", theme);
    return theme;
  };
  
  export const changeTradeTheme = (theme) => {
    if (theme == "dark") {
      document.body.classList.add("light_theme");
    } else if (theme == "light") {
      document.body.classList.remove("light_theme");
    }
    return true;
  };
  
  export const getTradeTheme = () => {
    let theme = localStorage.getItem("tradeTheme");
    return theme;
  };
  
  export const setLang = async (value) => {
    localStorage.setItem("lang", value);
    return true;
  };
  
  export const getLang = () => {
    if (localStorage.getItem("lang")) {
      return localStorage.getItem("lang");
    }
    return "";
  };
  
  export const setSocketToken = (token) => {
    localStorage.setItem("socket_token", token);
    return true;
  };
  
  export const getSocketToken = () => {
    if (localStorage.getItem("socket_token")) {
      return localStorage.getItem("socket_token");
    }
    return "";
  };
  