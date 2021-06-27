import BaseService from "./BaseService";

const ProductService = {
  getProductByName: (name, user) => {
    return BaseService.get(`/product/by-name/${name}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default ProductService;
