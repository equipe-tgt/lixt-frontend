import BaseService from "./BaseService";
import axios from "axios";

/**
 * @todo alterar para o endpoint real
 */

const UserService = {
  doRegister: (user) => {
    return axios.post(
      "https://run.mocky.io/v3/4992c12c-12b6-48c5-a6af-3e3dab40158a",
      user
    );
  },
};

export default UserService;
