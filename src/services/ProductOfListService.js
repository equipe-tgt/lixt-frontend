import BaseService from './BaseService';

const ProductOfListService = {
  createProductOfList: (productOfList, user) => {
    return BaseService.post('/productOfList', productOfList, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
  removeProductOfList: (id, user) => {
    return BaseService.delete(`/productOfList/${id}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
  editProductOfList: (productOfList, user) => {
    return BaseService.put(
      `/productOfList/${productOfList.id}`,
      productOfList,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
  },
  getProductOfListComments: (id, user) => {
    return BaseService.get(`/productOfList/${id}/comments`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
  assignOrUnassignMyself: (id, user) => {
    return BaseService.get(`/productOfList/${id}/assigned-to-me`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },

  toggleItem: (id, operation, user) => {
    const operationParam = operation ? 'mark' : 'clean';

    return BaseService.get(`/productOfList/${operationParam}/${id}/`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },

  changeMarkedAmount: (id, amount, user) => {
    return BaseService.put(`/productOfList/${id}/mark-amount/${amount}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default ProductOfListService;
