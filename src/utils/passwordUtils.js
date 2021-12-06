export function getLevels(translate) {
  return [
    {
      label: translate('extremelyWeak'),
      labelColor: '#ff2900',
      activeBarColor: '#ff2900',
    },
    {
      label: translate('wayTooWeak'),
      labelColor: '#ff3e00',
      activeBarColor: '#ff3e00',
    },
    {
      label: translate('veryWeak'),
      labelColor: '#ff5400',
      activeBarColor: '#ff5400',
    },
    {
      label: translate('weak'),
      labelColor: '#ff6900',
      activeBarColor: '#ff6900',
    },
    {
      label: translate('regular'),
      labelColor: '#d6a211',
      activeBarColor: '#f4d744',
    },
    {
      label: translate('average'),
      labelColor: '#d6a211',
      activeBarColor: '#f3d331',
    },
    {
      label: translate('fair'),
      labelColor: '#19a627',
      activeBarColor: '#6ff542',
    },
    {
      label: translate('strong'),
      labelColor: '#19a627',
      activeBarColor: '#14eb6e',
    },
    {
      label: translate('veryStrong'),
      labelColor: '#19a627',
      activeBarColor: '#0af56d',
    },
    {
      label: translate('extremelyStrong'),
      labelColor: '#19a627',
      activeBarColor: '#00ff6b',
    },
  ];
}
