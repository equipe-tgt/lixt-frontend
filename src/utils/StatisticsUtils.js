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
  PRODUCT: 'productStatistics',
  CATEGORY: 'categoryStatistics',
  PURCHASE_LOCAL: 'purchaseLocalStatistics',
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
  return StatistcsTypeUrl[key];
}