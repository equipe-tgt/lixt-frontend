import axios from "axios";
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
  },

  doRegister: (user) => {
    return axios.post(
      "https://run.mocky.io/v3/4992c12c-12b6-48c5-a6af-3e3dab40158a",
      user
    );
  },
};

export default AuthService;
