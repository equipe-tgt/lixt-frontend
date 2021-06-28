import BaseService from "./BaseService";

const ProductOfListService = {
  createProductOfList: (productOfList, user) => {
    return BaseService.post("/productOfList", productOfList, {
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
    })
  },
};

export default ProductOfListService;
