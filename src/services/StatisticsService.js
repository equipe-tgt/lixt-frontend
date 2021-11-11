import BaseService from './BaseService';

const StatisticsService = {
  /**
   * @param {('time'|'category'|'product')} statisticsType
   */
  getExpensesPer: (statisticsType, filter, user) => {
    return BaseService.post(`/dashboard/${statisticsType}`, filter, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
  },
};

export default StatisticsService;
