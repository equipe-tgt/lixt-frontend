import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ProductOfListDetails from './ProductOfListDetails';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('ProductOfListDetailsScreen component', () => {
  let getByTestId, getByText;
  let navigationSpy;
  let user;
  let logoutFn;

  beforeEach(() => {
    const navigation = {
      navigate: jest.fn((path) => path),
    };
    navigationSpy = jest.spyOn(navigation, 'navigate');

    const route = {
      params: {
        product: {},
      },
    };

    user = {
      name: 'Fulano',
      username: 'fulanodetal',
    };

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
                <ProductOfListDetails navigation={navigation} route={route} />
              }
            />
          </SafeAreaProvider>
        </ListContext.Provider>
      </AuthContext.Provider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
  });

  it('should', () => {
    expect(true).toBe(true);
  });
});
