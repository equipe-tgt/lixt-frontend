import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Settings from './SettingsScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
  initReactI18next: {
    type: 'logger',
    init: () => {},
  },
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

jest.mock('../../services/LanguageService', () => {
  let language = 'pt_BR';
  return {
    getLanguageApp: () => language,
    setLanguageApp: (lang) => (language = lang),
  };
});

describe('SettingsScreen component', () => {
  let getByTestId, getByText;

  beforeEach(() => {
    const renderResults = render(
      <SafeAreaProvider
        initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <NativeBaseProvider children={<Settings />} />
      </SafeAreaProvider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
  });

  it('should change app language when selecting a value in the dropdown', async () => {
    const selectLanguage = getByTestId('select-language');

    await waitFor(() => {
      fireEvent(selectLanguage, 'valueChange', 'en_US');
    });

    expect(selectLanguage.props.value).toBe('english');

    await waitFor(() => {
      fireEvent(selectLanguage, 'valueChange', 'pt_BR');
    });

    expect(selectLanguage.props.value).toBe('portuguese');
  });
});
