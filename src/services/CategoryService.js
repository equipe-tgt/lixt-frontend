import BaseService from './BaseService';

const CategoryService = {
  getCategories: (user) => {
    return BaseService.get('/category', {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default CategoryService;
