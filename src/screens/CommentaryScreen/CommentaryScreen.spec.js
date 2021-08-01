import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CommentaryScreen from './CommentaryScreen';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import { NavigationContext } from '@react-navigation/native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('CommentaryScreen component', () => {
  let getByTestId, getByText;
  let user;

  beforeEach(() => {
    const route = {
      params: {
        product: ''
      }
    }

    user = {
      name: 'Fulano',
      username: 'fulanodetal',
    };

    const navContext = {
      isFocused: () => true,
      // addListener returns an unscubscribe function.
      addListener: jest.fn(() => jest.fn())
    }

    const renderResults = render(
      <AuthContext.Provider
        value={{
          user,
          login: () => {},
          logout: () => {},
        }}
      >
        <ListContext.Provider
          value={{
            lists: [],
            setLists: () => {},
          }}
        >
          <SafeAreaProvider
            initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <NativeBaseProvider
              children={
                <NavigationContext.Provider value={navContext}>
                  <CommentaryScreen route={route} />
                </NavigationContext.Provider>
              }
            />
          </SafeAreaProvider>
        </ListContext.Provider>
      </AuthContext.Provider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
  });

  it('', () => {
    expect(true).toBe(true);
  })
});
