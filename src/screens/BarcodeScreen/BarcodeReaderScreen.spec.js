/* eslint-disable no-undef */
import '@testing-library/jest-dom';
import React from 'React';
import { NativeBaseProvider } from 'native-base';
import { NavigationContext } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BarCodeScanner } from 'expo-barcode-scanner';

import BarcodeReaderScreen from './BarcodeReaderScreen';
import { AuthContext } from '../../context/AuthProvider';
import i18 from 'react-i18next';
import ProductService from '../../services/ProductService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

i18.getI18n = jest.fn(() => 'pt_BR');

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

describe('BarcodeReaderScreen component', () => {
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
      params: {},
    };
  });

  describe("when there's no permission to use the camera", () => {
    it("should display a message warning that there's no camera permission granted", async () => {
      BarCodeScanner.requestPermissionsAsync = jest.fn(async () => {
        return {
          status: 'denied',
        };
      });

      const { getByTestId } = render(
        getScreenWrapper(
          <BarcodeReaderScreen navigation={navigation} route={route} />
        )
      );

      const noPermissionToUseCameraText = await waitFor(() => {
        return getByTestId('no-camera-permission-text');
      });

      expect(noPermissionToUseCameraText).toBeDefined();
    });
  });

  describe('when there is permission to use the camera', () => {
    it('should open the camera', async () => {
      BarCodeScanner.requestPermissionsAsync = jest.fn(async () => {
        return {
          status: 'granted',
        };
      });

      const { getByTestId } = render(
        getScreenWrapper(
          <BarcodeReaderScreen navigation={navigation} route={route} />
        )
      );

      const barcodeScanner = await waitFor(() => {
        return getByTestId('barcode-scanner');
      });

      expect(barcodeScanner).toBeDefined();
    });
  });

  describe('when a barcode is read in search mode', () => {
    it('should request the server to search the product', async () => {
      ProductService.getProductByBarcode = jest.fn((path) => path);

      const { getByTestId } = render(
        getScreenWrapper(
          <BarcodeReaderScreen navigation={navigation} route={route} />
        )
      );

      // Usamos um botão escondido na tela com a funcionalidade do
      // BarCodeScanner porque o componente original não dispara o
      // evento de leitura no ambiente de testes
      const barcodeScannerFunctionality = await waitFor(() => {
        return getByTestId('barcode-scanner-function');
      });

      await waitFor(() =>
        fireEvent(barcodeScannerFunctionality, 'press', {
          type: BarCodeScanner.Constants.BarCodeType.ean13,
          data: '7891010973902',
        })
      );

      expect(ProductService.getProductByBarcode).toHaveBeenCalled();
    });

    describe('when the product exists in the server', () => {
      it('should go back to the "Lists" screen with the found product as a parameter', async () => {
        const product = {
          id: 1,
          name: 'Arroz',
          userId: null,
          categoryId: 1,
          barcode: '7891010973902',
          measureValue: null,
          measureType: 'UNITY',
          category: {
            id: 1,
            name: 'Alimentação',
          },
        };

        ProductService.getProductByBarcode = jest.fn((path) => {
          return { data: product };
        });

        const { getByTestId } = render(
          getScreenWrapper(
            <BarcodeReaderScreen navigation={navigation} route={route} />
          )
        );

        // Usamos um botão escondido na tela com a funcionalidade do
        // BarCodeScanner porque o componente original não dispara o
        // evento de leitura no ambiente de testes
        const barcodeScannerFunctionality = await waitFor(() => {
          return getByTestId('barcode-scanner-function');
        });

        await waitFor(() =>
          fireEvent(barcodeScannerFunctionality, 'press', {
            type: BarCodeScanner.Constants.BarCodeType.ean13,
            data: '7891010973902',
          })
        );

        expect(navigation.navigate).toHaveBeenCalledWith(
          'Lists',
          expect.objectContaining({ foundProductByBarcode: product })
        );
      });
    });

    describe("when the product doesn't exist on the platform", () => {
      it('should show a dialog to add a new product', async () => {
        ProductService.getProductByBarcode = jest.fn((path) => path);

        const { getByTestId } = render(
          getScreenWrapper(
            <BarcodeReaderScreen navigation={navigation} route={route} />
          )
        );

        // Usamos um botão escondido na tela com a funcionalidade do
        // BarCodeScanner porque o componente original não dispara o
        // evento de leitura no ambiente de testes
        const barcodeScannerFunctionality = await waitFor(() => {
          return getByTestId('barcode-scanner-function');
        });

        await waitFor(() =>
          fireEvent(barcodeScannerFunctionality, 'press', {
            type: BarCodeScanner.Constants.BarCodeType.ean13,
            data: '7891010973902',
          })
        );

        const newProductFromBarcodeModal = await waitFor(() =>
          getByTestId('add-product-from-barcode-modal')
        );

        expect(newProductFromBarcodeModal).toBeDefined();
      });
    });

    describe('when the server send an error as response', () => {
      it('should show an error toast', async () => {
        const getProductByBarcode = jest.spyOn(
          ProductService,
          'getProductByBarcode'
        );

        // eslint-disable-next-line prefer-promise-reject-errors
        getProductByBarcode.mockReturnValue(Promise.reject());

        const { getByTestId, getByText } = render(
          getScreenWrapper(
            <BarcodeReaderScreen navigation={navigation} route={route} />
          )
        );

        // Usamos um botão escondido na tela com a funcionalidade do
        // BarCodeScanner porque o componente original não dispara o
        // evento de leitura no ambiente de testes
        const barcodeScannerFunctionality = await waitFor(() => {
          return getByTestId('barcode-scanner-function');
        });

        await waitFor(() =>
          fireEvent(barcodeScannerFunctionality, 'press', {
            type: BarCodeScanner.Constants.BarCodeType.ean13,
            data: '7891010973902',
          })
        );

        const errorToast = await waitFor(() => getByText('errorServerDefault'));

        expect(errorToast).toBeDefined();
      });
    });
  });

  describe('when a barcode is read in new product mode', () => {
    it('should go back to the "NewProduct" screen after reading', async () => {
      route.params = {
        origin: 'NewProduct',
      };

      const { getByTestId } = render(
        getScreenWrapper(
          <BarcodeReaderScreen navigation={navigation} route={route} />
        )
      );

      // Usamos um botão escondido na tela com a funcionalidade do
      // BarCodeScanner porque o componente original não dispara o
      // evento de leitura no ambiente de testes
      const barcodeScannerFunctionality = await waitFor(() => {
        return getByTestId('barcode-scanner-function');
      });

      await waitFor(() =>
        fireEvent(barcodeScannerFunctionality, 'press', {
          type: BarCodeScanner.Constants.BarCodeType.ean13,
          data: '7891010973902',
        })
      );

      expect(navigation.navigate).toHaveBeenCalledWith('NewProduct', {
        barcode: '7891010973902',
      });
    });
  });
});
