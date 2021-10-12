/* eslint-disable no-undef */
import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import List from './ListScreen';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import { NavigationContext } from '@react-navigation/native';

import ListService from '../../services/ListService';
import ProductService from '../../services/ProductService';
import ProductOfListService from '../../services/ProductOfListService';
import ListMembersService from '../../services/ListMembersService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('ListScreen component', () => {
  let renderResults, getByTestId;
  let getListsSpy, navContext, navigation, route;
  let user;
  let lists = [];

  beforeEach(() => {
    user = {
      name: 'Fulano',
      username: 'fulanodetal',
      id: 1,
    };

    navigation = {
      navigate: jest.fn((path) => path),
    };

    navContext = {
      isFocused: () => true,
      // addListener returns an unscubscribe function.
      addListener: jest.fn(() => jest.fn()),
    };

    route = {
      params: {
        newList: null,
      },
    };
  });

  describe("when the user doesn't have lists", () => {
    it('should show a button to create a new list', async () => {
      lists = [];

      getListsSpy = jest.spyOn(ListService, 'getLists');
      getListsSpy.mockReturnValue(
        Promise.resolve({
          data: [],
        })
      );

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;

      const buttonCreateFirstList = await waitFor(() =>
        getByTestId('create-first-list')
      );

      expect(buttonCreateFirstList).toBeDefined();
    });
  });

  describe('when the user clicks the "create new list" button', () => {
    it('should redirect the application to the "New List" page', async () => {
      lists = [];

      getListsSpy = jest.spyOn(ListService, 'getLists');
      getListsSpy.mockReturnValue(
        Promise.resolve({
          data: [],
        })
      );

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;

      const buttonCreateFirstList = await waitFor(() =>
        getByTestId('create-first-list')
      );

      fireEvent.press(buttonCreateFirstList);

      expect(navigation.navigate).toBeCalledWith('NewList');
    });
  });

  describe('when the user creates a new list', () => {
    it('should add to the current array of lists', async () => {
      lists = [];

      ListService.getLists = jest.fn(() => {
        return { data: [] };
      });

      const routeNewListAdded = {
        ...route,
        params: {
          newList: {
            id: 3,
            nameList: 'Lista III',
            ownerId: 1,
            owner: null,
            description: '',
            productsOfList: null,
            listMembers: null,
          },
        },
      };

      const setLists = jest.fn((val) => {
        lists.push(val);
      });

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: setLists,
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={routeNewListAdded} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      expect(setLists).toBeCalled();
      expect(lists.length).toBe(1);
    });
  });

  describe('when the user clicks the plus sign button', () => {
    it('should redirect the application to the "New List" page', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;

      const buttonNewList = await waitFor(() => getByTestId('create-list'));

      fireEvent.press(buttonNewList);

      expect(navigation.navigate).toBeCalledWith('NewList');
    });
  });

  describe('when clicks the "Delete list" button', () => {
    it('should show a confirmation dialog', async () => {
      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists: [
                {
                  id: 1,
                  nameList: 'Lista I',
                  ownerId: 1,
                  owner: 'Fulano',
                  description: '',
                  productsOfList: [],
                  listMembers: [],
                },
              ],
              setLists: (val) => {
                lists = val;
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      const getByTestId = renderResults.getByTestId;

      getListsSpy = jest.spyOn(ListService, 'getLists');
      getListsSpy.mockReturnValue(
        Promise.resolve({
          data: [
            {
              id: 1,
              nameList: 'Lista I',
              ownerId: 1,
              owner: 'Fulano',
              description: '',
              productsOfList: [],
              listMembers: [],
            },
          ],
        })
      );

      const options = await waitFor(() => getByTestId('list-options'));
      fireEvent.press(options);

      const deleteOption = await waitFor(() => getByTestId('delete-option'));

      await waitFor(() => fireEvent.press(deleteOption));

      const listRemoveModal = await waitFor(() =>
        getByTestId('remove-list-modal')
      );

      expect(listRemoveModal).toBeDefined();
    });

    it('should remove list when confirmed', async () => {
      const setListsFn = jest.fn(() => lists.filter((list) => list.id !== 1));

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists: [
                {
                  id: 1,
                  nameList: 'Lista I',
                  ownerId: 1,
                  owner: 'Fulano',
                  description: '',
                  productsOfList: [],
                  listMembers: [],
                },
              ],
              setLists: setListsFn,
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      const { getByTestId } = renderResults;

      getListsSpy = jest.spyOn(ListService, 'getLists');
      getListsSpy.mockReturnValue(
        Promise.resolve({
          data: [
            {
              id: 1,
              nameList: 'Lista I',
              ownerId: 1,
              owner: 'Fulano',
              description: '',
              productsOfList: [],
              listMembers: [],
            },
          ],
        })
      );

      const deleteListSpy = jest.spyOn(ListService, 'deleteList');
      deleteListSpy.mockReturnValue(Promise.resolve());

      const options = await waitFor(() => getByTestId('list-options'));
      fireEvent.press(options);

      const deleteOption = await waitFor(() => getByTestId('delete-option'));

      await waitFor(() => fireEvent.press(deleteOption));

      const buttonListRemoval = await waitFor(() =>
        getByTestId('button-confirm-removal')
      );

      fireEvent.press(buttonListRemoval);

      expect(setListsFn.length).toBe(0);
    });

    it('should show error when server returns default error', async () => {
      const setListsFn = jest.fn(() => lists.filter((list) => list.id !== 1));

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists: [
                {
                  id: 1,
                  nameList: 'Lista I',
                  ownerId: 1,
                  owner: 'Fulano',
                  description: '',
                  productsOfList: [],
                  listMembers: [],
                },
              ],
              setLists: setListsFn,
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      const { getByTestId, getByText } = renderResults;

      getListsSpy = jest.spyOn(ListService, 'getLists');
      getListsSpy.mockReturnValue(
        Promise.resolve({
          data: [
            {
              id: 1,
              nameList: 'Lista I',
              ownerId: 1,
              owner: 'Fulano',
              description: '',
              productsOfList: [],
              listMembers: [],
            },
          ],
        })
      );

      const deleteListSpy = jest.spyOn(ListService, 'deleteList');
      // eslint-disable-next-line prefer-promise-reject-errors
      deleteListSpy.mockReturnValue(Promise.reject());

      const options = await waitFor(() => getByTestId('list-options'));
      fireEvent.press(options);

      const deleteOption = await waitFor(() => getByTestId('delete-option'));

      await waitFor(() => fireEvent.press(deleteOption));

      const buttonListRemoval = await waitFor(() =>
        getByTestId('button-confirm-removal')
      );

      fireEvent.press(buttonListRemoval);

      const toast = await waitFor(() => getByText('couldntRemoveList'));
      expect(toast).toBeDefined();
    });
  });

  describe('when the user selects another list on the dropdown', () => {
    it('should exhibit the informations of that list', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [],
          listMembers: [],
        },
        {
          id: 2,
          nameList: 'Lista II',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [
            {
              id: 1,
              productId: 1,
              listId: 2,
              assignedUserId: 10,
              userWhoMarkedId: null,
              name: 'Arroz',
              isMarked: false,
              plannedAmount: 1,
              markedAmount: null,
              price: 25.0,
              measureValue: null,
              measureType: 'UNITY',
              product: {
                id: 1,
                name: 'Arroz',
                userId: null,
                categoryId: 1,
                barcode: null,
                measureValue: null,
                measureType: 'UNITY',
                category: {
                  id: 1,
                  name: 'Alimentação',
                },
              },
              amountComment: 1,
            },
          ],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;

      const listSelect = await waitFor(() =>
        getByTestId('select-current-list')
      );

      await waitFor(() => {
        fireEvent(listSelect, 'valueChange', '2');
      });

      const listSelectValue = listSelect.props.value;
      const textProductItem = await waitFor(() => getByText('Arroz'));

      expect(listSelectValue).toBe('Lista II');
      expect(textProductItem).toBeDefined();
    });
  });

  describe('when the user selects the same list on the dropdown', () => {
    it("shouldn't change the informations being exhibited", async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [],
          listMembers: [],
        },
        {
          id: 2,
          nameList: 'Lista II',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;

      const listSelect = await waitFor(() =>
        getByTestId('select-current-list')
      );

      const listSelectFirstValue = listSelect.props.value;

      await waitFor(() => {
        fireEvent(listSelect, 'valueChange', '1');
      });

      const listSelectSecondValue = listSelect.props.value;

      expect(listSelectFirstValue).toEqual(listSelectSecondValue);
    });
  });

  describe('when the user searches for a product by name', () => {
    it('should display the products found in a list', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      const products = [
        {
          id: 1,
          name: 'Arroz',
          userId: null,
          categoryId: 1,
          barcode: null,
          measureValue: null,
          measureType: 'UNITY',
          category: {
            id: 1,
            name: 'Alimentação',
          },
        },
      ];

      ProductService.getProductByName = jest.fn((productName) => {
        return {
          data: products.filter((p) => p.name.includes(productName)),
        };
      });

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;

      const inputSearchProduct = await waitFor(() =>
        getByTestId('input-search-product')
      );

      await waitFor(() => {
        fireEvent.changeText(inputSearchProduct, 'Arroz');
      });

      const itemsFound = await waitFor(() => {
        return renderResults.getAllByTestId('products-found');
      });

      expect(itemsFound.length).toBeGreaterThan(0);
    });

    it('should not search for products if the written name was smaller than 2', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      const products = [
        {
          id: 1,
          name: 'Arroz',
          userId: null,
          categoryId: 1,
          barcode: null,
          measureValue: null,
          measureType: 'UNITY',
          category: {
            id: 1,
            name: 'Alimentação',
          },
        },
      ];

      ProductService.getProductByName = jest.fn((productName) => {
        return {
          data: products.filter((p) => p.name.includes(productName)),
        };
      });

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;

      const inputSearchProduct = await waitFor(() =>
        getByTestId('input-search-product')
      );

      await waitFor(() => {
        fireEvent.changeText(inputSearchProduct, 'A');
      });

      expect(ProductService.getProductByName).not.toBeCalled();
    });

    it('should display an option to add a new product if no product is found', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      ProductService.getProductByName = jest.fn(() => {
        return {
          data: [],
        };
      });

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;

      const inputSearchProduct = await waitFor(() =>
        getByTestId('input-search-product')
      );

      await waitFor(() => {
        fireEvent.changeText(inputSearchProduct, 'Arroz');
      });

      const addNewProductOption = await waitFor(() => {
        return getByTestId('option-add-new-product');
      });

      expect(addNewProductOption).toBeDefined();
    });

    it('should show error when server returns default error', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      const searchProductNameSpy = jest.spyOn(
        ProductService,
        'getProductByName'
      );
      searchProductNameSpy.mockReturnValue(
        // eslint-disable-next-line prefer-promise-reject-errors
        Promise.reject({
          response: {
            data: 'Erro no servidor',
          },
        })
      );

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;

      const inputSearchProduct = await waitFor(() =>
        getByTestId('input-search-product')
      );

      await waitFor(() => {
        fireEvent.changeText(inputSearchProduct, 'Arroz');
      });

      const toast = await waitFor(() => getByText('errorServerDefault'));

      expect(toast).toBeDefined();
    });
  });

  describe('when the user decides do add a new product to the plataform', () => {
    it('should automatically add the newly registered product to the current list', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      ProductOfListService.createProductOfList = jest.fn(
        (productOfList, user) => {
          return {
            id: 1,
            productId: 1,
            listId: 1,
            name: 'Arroz',
            price: null,
            measureValue: null,
            measureType: 'UNITY',
          };
        }
      );

      const routeNewProductAdded = {
        ...route,
        params: {
          newProduct: {
            id: 1,
            productId: 1,
            listId: 1,
            name: 'Arroz',
            price: null,
            measureValue: null,
            measureType: 'UNITY',
          },
        },
      };

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={routeNewProductAdded} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      expect(ProductOfListService.createProductOfList).toHaveBeenCalled();
    });
  });

  describe('when the user tries to add the same item twice to the list', () => {
    it('should show an error', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [
            {
              id: 1,
              productId: 1,
              listId: 1,
              assignedUserId: null,
              userWhoMarkedId: null,
              name: 'Arroz',
              isMarked: false,
              plannedAmount: 1,
              markedAmount: null,
              price: 25.0,
              measureValue: null,
              measureType: 'UNITY',
              product: {
                id: 1,
                name: 'Arroz',
                userId: null,
                categoryId: 1,
                barcode: null,
                measureValue: null,
                measureType: 'UNITY',
                category: {
                  id: 1,
                  name: 'Alimentação',
                },
              },
              amountComment: 1,
            },
          ],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      ProductOfListService.createProductOfList = jest.fn(
        (productOfList, user) => {}
      );

      const products = [
        {
          id: 1,
          name: 'Arroz',
          userId: null,
          categoryId: 1,
          barcode: null,
          measureValue: null,
          measureType: 'UNITY',
          category: {
            id: 1,
            name: 'Alimentação',
          },
        },
      ];

      ProductService.getProductByName = jest.fn((productName) => {
        return {
          data: products.filter((p) => p.name.includes(productName)),
        };
      });

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;

      const inputSearchProduct = await waitFor(() =>
        getByTestId('input-search-product')
      );

      await waitFor(() => {
        fireEvent.changeText(inputSearchProduct, 'Arroz');
      });

      const itemsFound = await waitFor(() => {
        return renderResults.getAllByTestId('products-found');
      });

      await waitFor(() => {
        fireEvent.press(itemsFound[0]);
      });

      const toast = getByText('productAlreadyOnList');
      expect(toast).toBeDefined();
    });
  });

  describe('when the user clicks to remove an item', () => {
    it('should remove the item from the list and notify', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [
            {
              id: 1,
              productId: 1,
              listId: 1,
              assignedUserId: null,
              userWhoMarkedId: null,
              name: 'Arroz',
              isMarked: false,
              plannedAmount: 1,
              markedAmount: null,
              price: 25.0,
              measureValue: null,
              measureType: 'UNITY',
              product: {
                id: 1,
                name: 'Arroz',
                userId: null,
                categoryId: 1,
                barcode: null,
                measureValue: null,
                measureType: 'UNITY',
                category: {
                  id: 1,
                  name: 'Alimentação',
                },
              },
              amountComment: 1,
            },
          ],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      ProductOfListService.removeProductOfList = jest.fn((id, user) => {});

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;

      const productItemContextMenu = await waitFor(() => {
        return getByTestId('product-item-context-menu');
      });

      await waitFor(() => fireEvent.press(productItemContextMenu));

      const removeOption = await waitFor(() => {
        return getByText('remove');
      });

      await waitFor(() => fireEvent.press(removeOption));

      expect(ProductOfListService.removeProductOfList).toHaveBeenCalled();

      expect(lists[0].productsOfList.length).toBe(0);

      const toast = await waitFor(() => {
        return getByText('itemWasRemoved');
      });

      expect(toast).toBeDefined();
    });

    it('should show error when the server returns default error', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [
            {
              id: 1,
              productId: 1,
              listId: 1,
              assignedUserId: null,
              userWhoMarkedId: null,
              name: 'Arroz',
              isMarked: false,
              plannedAmount: 1,
              markedAmount: null,
              price: 25.0,
              measureValue: null,
              measureType: 'UNITY',
              product: {
                id: 1,
                name: 'Arroz',
                userId: null,
                categoryId: 1,
                barcode: null,
                measureValue: null,
                measureType: 'UNITY',
                category: {
                  id: 1,
                  name: 'Alimentação',
                },
              },
              amountComment: 1,
            },
          ],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      const removeProductOfListSpy = jest.spyOn(
        ProductOfListService,
        'removeProductOfList'
      );
      removeProductOfListSpy.mockReturnValue(
        // eslint-disable-next-line prefer-promise-reject-errors
        Promise.reject({
          response: {
            data: 'Erro no servidor',
          },
        })
      );

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;

      const productItemContextMenu = await waitFor(() => {
        return getByTestId('product-item-context-menu');
      });

      await waitFor(() => fireEvent.press(productItemContextMenu));

      const removeOption = await waitFor(() => {
        return getByText('remove');
      });

      await waitFor(() => fireEvent.press(removeOption));

      expect(removeProductOfListSpy).toHaveBeenCalled();

      const toast = await waitFor(() => {
        return getByText('couldntRemoveItem');
      });

      expect(toast).toBeDefined();
    });
  });

  describe('when the user clicks to leave the list', () => {
    it('should remove the invitation, the list from the interface and notify', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I do Ciclano',
          ownerId: 2,
          owner: 'Ciclano',
          description: '',
          productsOfList: [],
          listMembers: [
            {
              id: 1,
              userId: 1,
              listId: 1,
              statusListMember: 'ACCEPT',
              user: {
                id: 1,
                name: 'Fulano',
                username: 'fulanodetal',
                password: null,
              },
            },
          ],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      ListMembersService.deleteInvitation = jest.fn((id, user) => {});

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;

      const listOptions = await waitFor(() => getByTestId('list-options'));

      await waitFor(() => fireEvent.press(listOptions));

      const leaveListOption = await waitFor(() =>
        getByTestId('leave-list-option')
      );

      await waitFor(() => fireEvent.press(leaveListOption));

      expect(ListMembersService.deleteInvitation).toHaveBeenCalled();

      expect(lists.length).toBe(0);

      const toast = await waitFor(() => getByText('youLeft'));

      expect(toast).toBeDefined();
    });

    it('should show error when server returns default error', async () => {
      const fabricatedLists = [
        {
          id: 1,
          nameList: 'Lista I do Ciclano',
          ownerId: 2,
          owner: 'Ciclano',
          description: '',
          productsOfList: [],
          listMembers: [
            {
              id: 1,
              userId: 1,
              listId: 1,
              statusListMember: 'ACCEPT',
              user: {
                id: 1,
                name: 'Fulano',
                username: 'fulanodetal',
                password: null,
              },
            },
          ],
        },
      ];

      lists = [...fabricatedLists];

      ListService.getLists = jest.fn(() => {
        return { data: [...fabricatedLists] };
      });

      const deleteInvitationSpy = jest.spyOn(
        ListMembersService,
        'deleteInvitation'
      );
      deleteInvitationSpy.mockReturnValue(
        // eslint-disable-next-line prefer-promise-reject-errors
        Promise.reject({
          response: {
            data: 'Erro no servidor',
          },
        })
      );

      renderResults = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists,
              setLists: (value) => {
                lists = [...value];
              },
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <List navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;

      const listOptions = await waitFor(() => getByTestId('list-options'));

      await waitFor(() => fireEvent.press(listOptions));

      const leaveListOption = await waitFor(() =>
        getByTestId('leave-list-option')
      );

      await waitFor(() => fireEvent.press(leaveListOption));

      expect(deleteInvitationSpy).toHaveBeenCalled();

      const toast = await waitFor(() => getByText('errorServerDefault'));

      expect(toast).toBeDefined();
    });
  });
});
