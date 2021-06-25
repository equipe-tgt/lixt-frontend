import BaseService from "./BaseService";

const UserService = {
  doRegister: (user) => {
    return BaseService.post("/auth/register", user);
  },

  resetMyPassword: () =>{
    
  }
};

export default UserService;
