const MeasureTypes = {
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
  return MeasureTypes[value].label;
};

export const getMeasureValueByLabel = (label) => {
  for (const key in MeasureTypes) {
    const element = MeasureTypes[key];

    if (element.label === label) return element.value;
  }
};

export default MeasureTypes;
