import BaseService from "./BaseService";

const ListMembersService = {
  sendInvite: (username, idList, user) => {
    console.log(username);
    return BaseService.post(`/membersList/send-invite/${idList}`, username, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "text/plain",
      },
    });
  },
};

export default ListMembersService;
