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
    init: () => {}
  }
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('SettingsScreen component', () => {
  let getByTestId, getByText;

  beforeEach(() => {
    const renderResults = render(
      <SafeAreaProvider
        initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <NativeBaseProvider
          children={
            <Settings />
          }
        />
      </SafeAreaProvider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
  });

  it('should', () => {
    expect(true).toBe(true);
  })
});
