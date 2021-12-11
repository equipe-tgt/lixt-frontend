export const UnityTimes = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  DEFAULT: 'DEFAULT',
};

export const DateParameters = {
  START: 0,
  END: 1,
};

export const StatisticsType = {
  TIME: 'timeStatistics',
  LIST: 'listStatistics',
  PRODUCT: 'productBrandStatistics',
  CATEGORY: 'categoryStatistics',
  PURCHASE_LOCAL: 'purchaseLocalStatistics',
};

export const StatisticsPeriods = {
  LAST_MONTH: 'lastMonth',
  LAST_FIFTEEN_DAYS: 'lastFifteenDays',
  LAST_WEEK: 'lastWeek',
  CUSTOMIZED: 'others',
};

const StatistcsTypeUrl = {
  TIME: 'time',
  LIST: 'time',
  PRODUCT: 'product',
  CATEGORY: 'category',
};

export function getUrl(value) {
  const key = Object.keys(StatistcsTypeUrl).find(
    (key) => StatisticsType[key] === value
  );
  if (key) {
    return StatistcsTypeUrl[key];
  }
  return null;
}
