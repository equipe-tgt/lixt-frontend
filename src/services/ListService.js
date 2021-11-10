import BaseService from './BaseService';

const ListService = {
  getLists: (user) => {
    return BaseService.get('/list/by-user', {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },

  getListById: (id, user) => {
    return BaseService.get(`/list/${id}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },

  createList: (list, user) => {
    return BaseService.post('/list', list, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },

  editList: (list, listId, user) => {
    return BaseService.put(`/list/${listId}`, list, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },

  deleteList: (listId, user) => {
    return BaseService.delete(`/list/${listId}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default ListService;
