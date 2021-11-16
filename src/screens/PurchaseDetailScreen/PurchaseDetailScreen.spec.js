/* eslint-disable no-undef */
import '@testing-library/jest-dom';
import React from 'React';
import { NativeBaseProvider } from 'native-base';
import { NavigationContext } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PurchaseDetailScreen from './PurchaseDetailScreen';
import { AuthContext } from '../../context/AuthProvider';
import i18 from 'react-i18next';
import ProductService from '../../services/ProductService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

i18.getI18n = jest.fn(() => ({
  language: 'pt_BR'
}));

jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

let user, navigation, route;

function getScreenWrapper(screen) {
  return (
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
            {screen}
          </NavigationContext.Provider>
        </NativeBaseProvider>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}

describe('PurchaseDetailScreen component', () => {
  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  beforeEach(() => {
    navigation = {
      navigate: jest.fn((path, secondParam) => path),
    };

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
      params: {
        purchase: null,
      },
    };
  });

  describe('when the screen loads', () => {
    describe('when the screen has the "purchase" prop', () => {
      it('should show the details of the purchase', async () => {
        route.params.purchase = {
          id: 23,
          userId: 1,
          purchaseLocalId: 11,
          purchasePrice: 30.6,
          purchaseDate: '2021-11-03T23:15:04',
          purchaseLocal: {
            id: 11,
            name: 'Prefeitura Municipal Ferraz De Vasconcelos, Rua Rui Barbosa,295, Ferraz De Vasconcelos, São Paulo 08506, Brazil',
            latitude: -23.5471426,
            longitude: -46.3706901,
          },
          purchaseLists: [
            {
              id: 36,
              purchaseId: 23,
              listId: 1,
              nameList: 'Lista I',
              partialPurchasePrice: 15.0,
              itemsOfPurchase: [
                {
                  id: 7,
                  productId: 2,
                  productOfListId: null,
                  purcharseListId: 36,
                  name: 'AÇÚCAR REFINADO UNIÃO 1KGS',
                  amount: 1,
                  price: 15.0,
                  measureValue: null,
                  measureType: 'UNITY',
                  product: {
                    id: 2,
                    name: 'AÇÚCAR REFINADO UNIÃO 1KGS',
                    userId: null,
                    categoryId: null,
                    barcode: '7891910000197',
                    measureValue: null,
                    measureType: 'UNITY',
                    category: null,
                  },
                },
              ],
            },
          ],
        };

        const { getByTestId } = render(
          getScreenWrapper(
            <PurchaseDetailScreen navigation={navigation} route={route} />
          )
        );

        expect(
          await waitFor(() => getByTestId('purchase-price-text'))
        ).toBeDefined();

        expect(
          await waitFor(() => getByTestId('purchase-local-text'))
        ).toBeDefined();

        expect(await waitFor(() => getByTestId('purchase-date'))).toBeDefined();

        expect(
          await waitFor(() => getByTestId('purchase-total-items'))
        ).toBeDefined();

        expect(
          await waitFor(() => getByTestId('purchase-lists'))
        ).toBeDefined();

        expect(
          await waitFor(() => getByTestId('purchase-lists-details'))
        ).toBeDefined();
      });
    });

    describe('when the screen doesn\'t have the "purchase" prop', () => {
      it('should go back to the history page', () => {
        render(
          getScreenWrapper(
            <PurchaseDetailScreen navigation={navigation} route={route} />
          )
        );

        expect(navigation.navigate).toHaveBeenLastCalledWith('History');
      });
    });
  });
});
