import axios from "axios";

export default AuthService = {
  /**
   * @todo integrar com o endereço real da API
   */
  doLogin: (email, senha) => {
    return axios.post(
      "https://run.mocky.io/v3/3269a11b-c698-4c66-a1bd-073657a9e158",
      {
        email: email,
        senha: senha,
      }
    );
  },
};
