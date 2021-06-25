import BaseService from "./BaseService";

const UserService = {
  doRegister: (user) => {
    return BaseService.post("/auth/register", user);
  },
  resetPassword: (email) => {
    return BaseService.post(`/auth/forget-password/${email}`);
  },
  getUser: (token) => {
    return BaseService.get("/auth/data-user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default UserService;
