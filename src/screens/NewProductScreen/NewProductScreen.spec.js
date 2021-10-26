/* eslint-disable no-undef */
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-dom';
import { NativeBaseProvider } from 'native-base';
import { NavigationContext } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthProvider';
import NewProductScreen from './NewProductScreen';
import CategoryService from '../../services/CategoryService';
import ProductService from '../../services/ProductService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('NewProductScreen component', () => {
  describe('when getting categories does not return any error', () => {
    let getByTestId, getByText, navContext, navigation;
    let createProductButton;

    beforeEach(() => {
      navigation = {
        navigate: jest.fn((path) => path),
      };
      navigationSpy = jest.spyOn(navigation, 'navigate');

      navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn()),
      };

      const user = {
        id: 1,
      };

      const route = {
        params: {
          productName: '',
        },
      };

      const categorySpy = jest.spyOn(CategoryService, 'getCategories');
      categorySpy.mockReturnValue(
        Promise.resolve({
          data: [
            {
              id: 1,
              name: 'Roupas',
            },
            {
              id: 2,
              name: 'Peixes',
            },
          ],
        })
      );

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
                <NewProductScreen route={route} navigation={navigation} />
              </NavigationContext.Provider>
            </NativeBaseProvider>
          </SafeAreaProvider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      createProductButton = getByTestId('create-product-button');
    });

    describe('Product name field', () => {
      it('should show required field error when it is empty', async () => {
        await waitFor(() => {
          fireEvent.press(createProductButton);
        });

        const productNameError = getByTestId('error-new-product-name');
        expect(productNameError.props.children).toBe('requiredField');
      });

      it('should show max length field error when it has more than 45 characters', async () => {
        const productNameInput = getByTestId('new-product-name');

        await waitFor(() =>
          fireEvent.changeText(
            productNameInput,
            'Nome de produto muito grande mesmo, que não pode ter mais de 45 caracteres'
          )
        );
        await waitFor(() => {
          fireEvent.press(createProductButton);
        });

        const productNameInputError = getByTestId('error-new-product-name');
        expect(productNameInputError.props.children).toBe('fieldMaxChars');
      });

      it('should not show required field error when it is filled properly', async () => {
        const productNameInput = getByTestId('new-product-name');

        await waitFor(() => fireEvent.changeText(productNameInput, 'Abobóra'));
        await waitFor(() => fireEvent.press(createProductButton));

        const productNameInputError = getByTestId('error-new-product-name');

        expect(productNameInputError.props.children).toBeUndefined();
      });
    });

    describe('Category select field', () => {
      it('should show error when it does not have a category selected', async () => {
        await waitFor(() => {
          fireEvent.press(createProductButton);
        });

        const productNameError = getByTestId('error-category-select');
        expect(productNameError.props.children).toBe('selectAnOption');
      });

      it('should select the categories correctly', async () => {
        const categorySelect = getByTestId('category-select');

        await waitFor(() => {
          fireEvent(categorySelect, 'valueChange', '2');
        });
        await waitFor(() => {
          fireEvent.press(createProductButton);
        });

        expect(categorySelect.props.value).toBe('Peixes');
      });
    });

    describe('when form is properly filled', () => {
      it('should redirect to lists page if a product was created sucessfully', async () => {
        const createProductSpy = jest.spyOn(ProductService, 'createProduct');
        createProductSpy.mockReturnValue(Promise.resolve());

        await waitFor(() => {
          fireEvent.changeText(getByTestId('new-product-name'), 'Chocolate');
          fireEvent(getByTestId('category-select'), 'onValueChange', '1');
        });
        await waitFor(() => fireEvent.press(createProductButton));

        expect(navigationSpy).toHaveBeenCalledWith('Lists');
      });

      it('should show error message when creating the product in the backend is not possible', async () => {
        const createProductSpy = jest.spyOn(ProductService, 'createProduct');
        // eslint-disable-next-line prefer-promise-reject-errors
        createProductSpy.mockReturnValue(Promise.reject());

        await waitFor(() => {
          fireEvent.changeText(getByTestId('new-product-name'), 'Chocolate');
          fireEvent(getByTestId('category-select'), 'onValueChange', '1');
        });
        await waitFor(() => fireEvent.press(createProductButton));

        const toast = getByText('Não foi possível adicionar o produto');
        expect(toast).toBeDefined();
      });

      it('should show error message when a product with the same barcode already exists', async () => {
        const createProductSpy = jest.spyOn(ProductService, 'createProduct');
        createProductSpy.mockReturnValue(
          // eslint-disable-next-line prefer-promise-reject-errors
          Promise.reject({ response: { status: 409 } })
        );

        await waitFor(() => {
          fireEvent.changeText(getByTestId('new-product-name'), 'Chocolate');
          fireEvent(getByTestId('category-select'), 'onValueChange', '1');
        });
        await waitFor(() => fireEvent.press(createProductButton));

        const toast = getByText('Este código de barras já foi cadastrado');
        expect(toast).toBeDefined();
      });
    });

    describe('when the user presses the button to read the barcode', () => {
      it('should redirect to the barcode reader screen', async () => {
        const readBarcodeButton = await waitFor(() =>
          getByTestId('button-new-barcode')
        );

        await waitFor(() => fireEvent.press(readBarcodeButton));

        expect(navigationSpy).toHaveBeenCalledWith('BarcodeReader', {
          origin: 'NewProduct',
        });
      });
    });
  });

  describe('when getting categories does return an error', () => {
    let getByTestId, getByText;
    let createProductButton;

    beforeEach(() => {
      const navigation = {
        navigate: jest.fn((path) => path),
      };
      navigationSpy = jest.spyOn(navigation, 'navigate');

      const user = {
        id: 1,
      };

      const route = {
        params: {
          productName: '',
        },
      };

      const categorySpy = jest.spyOn(CategoryService, 'getCategories');
      categorySpy.mockReturnValue(Promise.reject());

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
            <NativeBaseProvider children={<NewProductScreen route={route} />} />
          </SafeAreaProvider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      createProductButton = getByTestId('create-product-button');
    });

    it('should not have any children in the category select field', async () => {
      const categorySelect = getByTestId('category-select');
      expect(categorySelect.props.children).toBeUndefined();
    });
  });
});
