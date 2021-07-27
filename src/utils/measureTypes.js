const MEASURE_TYPES = {
  L: 1,
  ML: 2,
  KG: 3,
  G: 4,
  MG: 5,
  UN: 6,
};

export const getMeasureType = (valor, fromServerToFront = true) => {
  if (fromServerToFront) {
    return valor === 'UNITY' ? 'UN' : valor;
  } else {
    return valor === 'UN' ? 'UNITY' : valor;
  }
};

export default MEASURE_TYPES;
