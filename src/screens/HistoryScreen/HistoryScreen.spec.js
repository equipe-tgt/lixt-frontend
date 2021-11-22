/* eslint-disable no-undef */
import '@testing-library/jest-dom';
import React from 'React';
import { NativeBaseProvider } from 'native-base';
import { NavigationContext } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthContext } from '../../context/AuthProvider';
import i18 from 'react-i18next';
import HistoryScreen from './HistoryScreen';
import PurchaseService from '../../services/PurchaseService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

i18.getI18n = jest.fn(() => ({
  language: 'pt_BR',
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

describe('HistoryScreen component', () => {
  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  beforeEach(() => {
    navigation = {
      navigate: jest.fn((path) => path),
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
      params: {},
    };
  });

  describe('when the screen is loaded', () => {
    it('must show an error toast if the server returns an error while fetching', async () => {
      jest.spyOn(PurchaseService, 'getPurchases').mockReturnValue(
        Promise.reject({
          data: {},
        })
      );

      const { getByText } = render(
        getScreenWrapper(
          <HistoryScreen navigation={navigation} route={route} />
        )
      );

      const errorToast = await waitFor(() => getByText('errorServerDefault'));

      expect(errorToast).toBeDefined();
    });

    it('must fetch all purchases made by that user', () => {
      jest.spyOn(PurchaseService, 'getPurchases').mockReturnValue(
        Promise.resolve({
          data: [],
        })
      );

      render(
        getScreenWrapper(
          <HistoryScreen navigation={navigation} route={route} />
        )
      );

      expect(PurchaseService.getPurchases).toHaveBeenCalledWith(user);
    });
  });

  describe('when the user has purchases', () => {
    it('should display the purchases in descendent chronological order', async () => {
      const purchases = [
        // Data mais antiga
        {
          id: 1,
          purchaseDate: '2021-11-03T23:15:04',
          purchasePrice: 20,
          purchaseLocal: {
            name: 'Quitanda',
          },
        },
        // Data mais nova
        {
          id: 2,
          purchaseDate: '2021-11-06T23:15:04',
          purchasePrice: 20,
          purchaseLocal: {
            name: 'Dunkin donuts, Av. Faria Lima',
          },
        },
      ];

      jest.spyOn(PurchaseService, 'getPurchases').mockReturnValue(
        Promise.resolve({
          data: purchases,
        })
      );

      const { getByTestId } = render(
        getScreenWrapper(
          <HistoryScreen navigation={navigation} route={route} />
        )
      );
      const purchasesList = await waitFor(() => {
        return getByTestId('purchases-list');
      });

      expect(purchasesList.props.data[0].id).toBe(2);
      expect(purchasesList.props.data[1].id).toBe(1);
    });
  });

  describe("when the user doesn't have purchases", () => {
    it('should display a message indicating that no purchases were made yet', async () => {
      jest.spyOn(PurchaseService, 'getPurchases').mockReturnValue(
        Promise.resolve({
          data: [],
        })
      );

      const { getByText } = render(
        getScreenWrapper(
          <HistoryScreen navigation={navigation} route={route} />
        )
      );
      const noPurchasesYetText = await waitFor(() => {
        return getByText('noPurchasesYet');
      });

      expect(noPurchasesYetText).toBeDefined();
    });
  });

  describe('when the user clicks on an item', () => {
    it('should redirect the user to the PurchaseDetail page', async () => {
      const purchases = [
        {
          id: 1,
          purchaseDate: '2021-11-03T23:15:04',
          purchasePrice: 20,
          purchaseLocal: {
            name: 'Quitanda',
          },
        },
      ];

      jest.spyOn(PurchaseService, 'getPurchases').mockReturnValue(
        Promise.resolve({
          data: purchases,
        })
      );

      const { getByTestId } = render(
        getScreenWrapper(
          <HistoryScreen navigation={navigation} route={route} />
        )
      );

      const purchasesListItem = await waitFor(() => {
        return getByTestId('purchase-list-item');
      });

      await waitFor(() => fireEvent.press(purchasesListItem));

      expect(navigation.navigate).toHaveBeenCalledWith('PurchaseDetail', {
        purchase: purchases[0],
      });
    });
  });
});
