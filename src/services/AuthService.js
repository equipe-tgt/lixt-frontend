import BaseService from "./BaseService";

const AuthService = {
  doLogin: (username, password) => {
    const dataLogin = new FormData();

    dataLogin.append("username", username);
    dataLogin.append("password", password);
    dataLogin.append("grant_type", "password");

    return BaseService.post("/oauth/token", dataLogin, {
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    });
  }
};

export default AuthService;
