import BaseService from "./BaseService";

const ListService = {
  getLists: () => {},

  createList: (list, user) => {
    console.log("payload", list, user);
    return BaseService.post("/list", list, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};


export default ListService;