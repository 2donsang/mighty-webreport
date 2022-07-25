import axios from "axios";

export const LoginUtil = axios.create({
    baseURL : `http://${window.location.hostname}:8080/api`,
    timeout: 30000,
    headers: {
        "Content-Type" : 'application/json;charset=UTF-8',
        "Access-Control_Allow_Origin" : "*",
        "Accept" : "application/json",
    }
});

const ApiUtil = axios.create({
    baseURL : `http://${window.location.hostname}:8080/api`,
    timeout: 30000,
    headers: {
        "Content-Type" : 'application/json;charset=UTF-8',
        "Access-Control_Allow_Origin" : "*",
        "Accept" : "application/json",
    }
});

ApiUtil.interceptors.request.use(
    function (config) {
        if(config.headers !== undefined){
            const token = localStorage.getItem('auth-token');
            if(token===null || token === undefined){
                window.location.href="/login";
                config.headers.Authorization = "";
            }else{
                config.headers.Authorization = token;
            }
        }
        return config;
    }
)

ApiUtil.interceptors.response.use(
  function (response){
      const errorCode : string = response.headers.code;
      if(errorCode === "000" ||
          errorCode === "001" ||
          errorCode === "002" ||
          errorCode === "003" ||
          errorCode === "004"){
          // auth-token 에러
          const token = localStorage.getItem('auth-token');
          if(token!==null && token !== undefined){
              localStorage.removeItem("auth-token")
          }
          window.location.href="/login?error=token-error";
      }else if(errorCode === "005" ||
          errorCode === "006" ||
          errorCode === "010") {
          // authorized 에러
          window.location.href = "/";
      }
      return response;
  }
);

export default ApiUtil;
