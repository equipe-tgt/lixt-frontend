import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { NavigationContext } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18 from 'react-i18next';

import StatisticsScreen from './StatisticsScreen';
import { AuthContext } from '../../context/AuthProvider';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

i18.getI18n = jest.fn(() => ({
  language: 'pt_BR',
}));

jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('StatisticsScreen component', () => {
  let getByTestId, getByText;
  let user, navigation, route, lists, navContext;

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  beforeEach(() => {
    navigation = {
      navigate: jest.fn((path, product) => path),
    };

    navigationSpy = jest.spyOn(navigation, 'navigate');

    navContext = {
      isFocused: () => true,
      // addListener returns an unscubscribe function.
      addListener: jest.fn(() => jest.fn()),
    };

    user = {
      id: 1,
      name: 'Fulano',
      username: 'fulanodetal',
    };

    route = {
      params: {},
    };

    const renderResults = render(
      <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
      <SafeAreaProvider
        initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <NativeBaseProvider>
                  <NavigationContext.Provider value={navContext}>
                    <StatisticsScreen navigation={navigation} route={route} />
                  </NavigationContext.Provider>
                </NativeBaseProvider>
      </SafeAreaProvider>

        </AuthContext.Provider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
  });

  it('should', () => {
    expect(true).toBe(true);
  });
});
