const MEASURE_TYPES = {
  L: {
    value: 'L',
    label: 'L',
  },
  ML: {
    value: 'ML',
    label: 'ml',
  },
  KG: {
    value: 'KG',
    label: 'kg',
  },
  G: {
    value: 'G',
    label: 'g',
  },
  MG: {
    value: 'MG',
    label: 'mg',
  },
  UNITY: {
    value: 'UNITY',
    label: 'un',
  },
};

export const getMeasureType = (value) => {
  return MEASURE_TYPES[value].label;
};

export const getMeasureValueByLabel = (label) => {
  for (const key in MEASURE_TYPES) {
    const element = MEASURE_TYPES[key];

    if (element.label === label) return element.value;
  }
};

export default MEASURE_TYPES;
