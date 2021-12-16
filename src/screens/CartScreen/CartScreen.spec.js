/* eslint-disable no-undef */
import '@testing-library/jest-dom';
import React from 'React';
import { NativeBaseProvider } from 'native-base';
import { NavigationContext } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CartScreen from './CartScreen';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import { CheckedItemsProvider } from '../../context/CheckedItemsProvider';
import ListService from '../../services/ListService';
import i18 from 'react-i18next';
import ProductOfListService from '../../services/ProductOfListService';
import PurchaseLocalService from '../../services/PurchaseLocalService';
import PurchaseService from '../../services/PurchaseService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

i18.getI18n = jest.fn(() => ({
  language: 'pt_BR',
}));

jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('CartScreen component', () => {
  let user, navigation, route, lists, navContext;

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();

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
  });

  describe("when there's no lists", () => {
    it('should display a notice', async () => {
      ListService.getLists = jest.fn(() => {
        return {
          data: [],
        };
      });

      const { getByText } = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists: lists,
              setLists: (val) => {
                lists = [...val];
              },
            }}
          >
            <CheckedItemsProvider>
              <SafeAreaProvider
                initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
              >
                <NativeBaseProvider>
                  <NavigationContext.Provider value={navContext}>
                    <CartScreen navigation={navigation} route={route} />
                  </NavigationContext.Provider>
                </NativeBaseProvider>
              </SafeAreaProvider>
            </CheckedItemsProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      const noListsFoundText = await waitFor(() =>
        getByText('noListsCreateANewOne')
      );

      expect(noListsFoundText).toBeDefined();
    });

    it('should go to history screen when clicking the correct menu item', async () => {
      jest.spyOn(ListService, 'getLists').mockReturnValueOnce(
        Promise.resolve({
          data: [],
        })
      );
  
      const { getByTestId } = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists: lists,
              setLists: (val) => {
                lists = [...val];
              },
            }}
          >
            <CheckedItemsProvider>
              <SafeAreaProvider
                initialSafeAreaInsets={{
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <NativeBaseProvider>
                  <NavigationContext.Provider value={navContext}>
                    <CartScreen navigation={navigation} route={route} />
                  </NavigationContext.Provider>
                </NativeBaseProvider>
              </SafeAreaProvider>
            </CheckedItemsProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );
  
      const historyButton = await waitFor(() =>
        getByTestId('no-lists-history-button')
      );
  
      fireEvent.press(historyButton);
  
      expect(navigation.navigate).toHaveBeenCalledWith('History');
    });
  
    it('should go to statistics screen when clicking the correct menu item', async () => {
      jest.spyOn(ListService, 'getLists').mockReturnValueOnce(
        Promise.resolve({
          data: [],
        })
      );
  
      const { getByTestId } = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists: lists,
              setLists: (val) => {
                lists = [...val];
              },
            }}
          >
            <CheckedItemsProvider>
              <SafeAreaProvider
                initialSafeAreaInsets={{
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <NativeBaseProvider>
                  <NavigationContext.Provider value={navContext}>
                    <CartScreen navigation={navigation} route={route} />
                  </NavigationContext.Provider>
                </NativeBaseProvider>
              </SafeAreaProvider>
            </CheckedItemsProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );
  
      const statisticsButton = await waitFor(() =>
        getByTestId('no-lists-statistics-button')
      );
  
      fireEvent.press(statisticsButton);
  
      expect(navigation.navigate).toHaveBeenCalledWith('Statistics');
    });
  });

  describe('when there is lists', () => {
    it('should be able to change the visualization mode', async () => {
      lists = [
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

      ListService.getLists = jest.fn(() => {
        return {
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
        };
      });

      const { getByTestId } = render(
        <AuthContext.Provider
          value={{
            user,
            login: () => {},
            logout: () => {},
          }}
        >
          <ListContext.Provider
            value={{
              lists: lists,
              setLists: (val) => {
                lists = [...val];
              },
            }}
          >
            <CheckedItemsProvider>
              <SafeAreaProvider
                initialSafeAreaInsets={{
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <NativeBaseProvider>
                  <NavigationContext.Provider value={navContext}>
                    <CartScreen navigation={navigation} route={route} />
                  </NavigationContext.Provider>
                </NativeBaseProvider>
              </SafeAreaProvider>
            </CheckedItemsProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      const selectVisualizationMode = await waitFor(() =>
        getByTestId('select-visualization-mode')
      );

      fireEvent(selectVisualizationMode, 'valueChange', lists[0].id);

      expect(selectVisualizationMode.props.value).toBe(lists[0].nameList);

      fireEvent(selectVisualizationMode, 'valueChange', 'view-all');

      expect(selectVisualizationMode.props.value).toBe('seeAllItems');
    });

    describe("when there's no items on the list", () => {
      it('should display a notice', async () => {
        lists = [
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

        ListService.getLists = jest.fn(() => {
          return {
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
          };
        });
        const { getByText } = render(
          <AuthContext.Provider
            value={{
              user,
              login: () => {},
              logout: () => {},
            }}
          >
            <ListContext.Provider
              value={{
                lists: lists,
                setLists: (val) => {
                  lists = [...val];
                },
              }}
            >
              <CheckedItemsProvider>
                <SafeAreaProvider
                  initialSafeAreaInsets={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                >
                  <NativeBaseProvider>
                    <NavigationContext.Provider value={navContext}>
                      <CartScreen navigation={navigation} route={route} />
                    </NavigationContext.Provider>
                  </NativeBaseProvider>
                </SafeAreaProvider>
              </CheckedItemsProvider>
            </ListContext.Provider>
          </AuthContext.Provider>
        );

        const noItemsFoundText = await waitFor(() =>
          getByText('noProductsFound')
        );

        expect(noItemsFoundText).toBeDefined();
      });
    });

    describe('when there is items on the list', () => {
      let getByTestId, getByText, renderResults;

      beforeEach(() => {
        lists = [
          {
            id: 1,
            nameList: 'Lista I',
            ownerId: 1,
            owner: 'Fulano',
            description: '',
            productsOfList: [
              {
                id: 10,
                productId: 1,
                listId: 1,
                assignedUserId: null,
                userWhoMarkedId: null,
                name: 'Arroz',
                isMarked: false,
                plannedAmount: 10,
                markedAmount: null,
                price: 10,
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
                amountComment: 0,
              },
              {
                id: 11,
                productId: 2,
                listId: 1,
                assignedUserId: null,
                userWhoMarkedId: 1,
                name: 'Feijão',
                isMarked: true,
                plannedAmount: 10,
                markedAmount: 2,
                price: 5,
                measureValue: null,
                measureType: 'UNITY',
                product: {
                  id: 1,
                  name: 'Feijão',
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
                amountComment: 0,
              },
              {
                id: 12,
                productId: 3,
                listId: 1,
                assignedUserId: null,
                userWhoMarkedId: 1,
                name: 'Tomate',
                isMarked: true,
                plannedAmount: 10,
                markedAmount: 2,
                price: 5,
                measureValue: null,
                measureType: 'UNITY',
                product: {
                  id: 3,
                  name: 'Tomate',
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
                amountComment: 0,
              },
            ],
            listMembers: [
              {
                id: 2,
                userId: 10,
                listId: 1,
                statusListMember: 'ACCEPT',
                user: {
                  id: 10,
                  name: 'Alice Pieszecki',
                  username: 'alice',
                  email: 'alice@gmail.com',
                  password: null,
                },
              },
            ],
          },
          {
            id: 2,
            nameList: 'Lista II',
            ownerId: 1,
            owner: 'Fulano',
            description: '',
            productsOfList: [
              {
                id: 13,
                productId: 3,
                listId: 2,
                assignedUserId: null,
                userWhoMarkedId: 1,
                name: 'Tomate',
                isMarked: true,
                plannedAmount: 10,
                markedAmount: 2,
                price: 5,
                measureValue: null,
                measureType: 'UNITY',
                product: {
                  id: 3,
                  name: 'Tomate',
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
                amountComment: 0,
              },
            ],
            listMembers: [],
          },
        ];

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
                lists: lists,
                setLists: (val) => {
                  lists = val;
                },
              }}
            >
              <CheckedItemsProvider>
                <SafeAreaProvider
                  initialSafeAreaInsets={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                >
                  <NativeBaseProvider>
                    <NavigationContext.Provider value={navContext}>
                      <CartScreen navigation={navigation} route={route} />
                    </NavigationContext.Provider>
                  </NativeBaseProvider>
                </SafeAreaProvider>
              </CheckedItemsProvider>
            </ListContext.Provider>
          </AuthContext.Provider>
        );

        getByTestId = renderResults.getByTestId;
        getByText = renderResults.getByText;
      });

      it('should display the total price of the cart, considering what was planned and what was actually marked by the current user', async () => {
        const calculator = await waitFor(() => getByTestId('lixt-calculator'));

        expect(calculator).toBeDefined();

        const totalPriceText = await waitFor(() => {
          return getByTestId('total-price-text');
        });

        const finalPrice = totalPriceText.props.children;

        expect(finalPrice).toContain('30,00');
      });

      it('should be able to check an item', async () => {
        const selectVisualizationMode = await waitFor(() =>
          getByTestId('select-visualization-mode')
        );

        fireEvent(selectVisualizationMode, 'valueChange', lists[0].id);

        const checkboxes = await waitFor(() =>
          renderResults.getAllByTestId('cart-product-item-checkbox')
        );

        const unmarkedCheckboxes = checkboxes.filter((c) => !c.props.isChecked);

        ProductOfListService.toggleItem = jest.fn(
          (productOfListId) => productOfListId
        );

        fireEvent(unmarkedCheckboxes[0], 'change');

        expect(ProductOfListService.toggleItem).toHaveBeenCalled();
      });

      it('should show an error message if another user just checked the item that is being checked right now', async () => {
        const selectVisualizationMode = await waitFor(() =>
          getByTestId('select-visualization-mode')
        );

        fireEvent(selectVisualizationMode, 'valueChange', lists[0].id);

        const checkboxes = await waitFor(() =>
          renderResults.getAllByTestId('cart-product-item-checkbox')
        );

        const unmarkedCheckboxes = checkboxes.filter((c) => !c.props.isChecked);

        ProductOfListService.toggleItem = jest.fn((productOfListId) => {
          return {
            data: 0,
          };
        });

        await waitFor(() => fireEvent(unmarkedCheckboxes[0], 'change'));

        expect(ProductOfListService.toggleItem).toHaveBeenCalled();

        const toast = await waitFor(() =>
          getByText('anotherUserIsResponsible')
        );

        expect(toast).toBeDefined();
      });

      it('should be able to change the marked amount of an item', async () => {
        const selectVisualizationMode = await waitFor(() =>
          getByTestId('select-visualization-mode')
        );

        await waitFor(() =>
          fireEvent(selectVisualizationMode, 'valueChange', lists[0].id)
        );

        const checkboxes = await waitFor(() =>
          renderResults.getAllByTestId('cart-product-item-checkbox')
        );

        const unmarkedCheckboxes = checkboxes.filter((c) => !c.props.isChecked);

        ProductOfListService.toggleItem = jest.fn(
          (productOfListId) => productOfListId
        );

        await waitFor(() => fireEvent(unmarkedCheckboxes[0], 'change'));

        ProductOfListService.changeMarkedAmount = jest.fn(
          (id, value, user) => id
        );

        const inputAmount = await waitFor(() =>
          getByTestId('amount-input-Feijão')
        );

        await waitFor(() => fireEvent(inputAmount, 'change', 2));

        expect(ProductOfListService.changeMarkedAmount).toHaveBeenCalled();
      });

      it('should be able to refresh the lists', async () => {
        ListService.getLists = jest.fn((user) => {
          return {
            data: [...lists],
          };
        });

        const refreshControl = await waitFor(
          () => getByTestId('cart-refresh-control').props.refreshControl
        );

        await waitFor(() => fireEvent(refreshControl, 'refresh'));

        expect(ListService.getLists).toHaveBeenCalled();
      });

      it('should not be able to refresh individual lists if server returns an error', async () => {
        ListService.getListById = jest.fn((id, user) => id);
        const getListByIdSpy = jest.spyOn(ListService, 'getListById');

        // eslint-disable-next-line prefer-promise-reject-errors
        getListByIdSpy.mockReturnValue(Promise.reject(new Error('Error')));

        const selectVisualizationMode = await waitFor(() =>
          getByTestId('select-visualization-mode')
        );

        fireEvent(selectVisualizationMode, 'valueChange', lists[0].id);

        const refreshControl = await waitFor(
          () => getByTestId('cart-refresh-control').props.refreshControl
        );

        await waitFor(() => fireEvent(refreshControl, 'refresh'));

        const toast = await waitFor(() => getByText('errorServerDefault'));
        expect(toast).toBeDefined();
      });

      it('should show an error if the server response for the refreshing is an error', async () => {
        ListService.getLists = jest.fn((user) => {
          return {
            data: lists,
          };
        });

        const getListsSpy = jest.spyOn(ListService, 'getLists');

        // eslint-disable-next-line prefer-promise-reject-errors
        getListsSpy.mockReturnValue(Promise.reject());

        const refreshControl = await waitFor(
          () => getByTestId('cart-refresh-control').props.refreshControl
        );

        await waitFor(() => fireEvent(refreshControl, 'refresh'));

        const toast = await waitFor(() => getByText('errorServerDefault'));
        expect(toast).toBeDefined();
      });

      it('should be able to refresh individual list', async () => {
        ListService.getListById = jest.fn((id, user) => id);

        const selectVisualizationMode = await waitFor(() =>
          getByTestId('select-visualization-mode')
        );

        fireEvent(selectVisualizationMode, 'valueChange', lists[0].id);

        const refreshControl = await waitFor(
          () => getByTestId('cart-refresh-control').props.refreshControl
        );

        await waitFor(() => fireEvent(refreshControl, 'refresh'));

        expect(ListService.getListById).toHaveBeenCalled();
      });

      describe('when the user presses the "save purchase" button', () => {
        it('should finish the purchase with success and show message', async () => {
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
                  lists: lists,
                  setLists: (val) => {
                    lists = val;
                  },
                }}
              >
                <CheckedItemsProvider>
                  <SafeAreaProvider
                    initialSafeAreaInsets={{
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  >
                    <NativeBaseProvider>
                      <NavigationContext.Provider value={navContext}>
                        <CartScreen navigation={navigation} route={route} />
                      </NavigationContext.Provider>
                    </NativeBaseProvider>
                  </SafeAreaProvider>
                </CheckedItemsProvider>
              </ListContext.Provider>
            </AuthContext.Provider>
          );

          PurchaseLocalService.findNearBy = jest.fn(() => {
            return {
              data: [],
            };
          });

          PurchaseLocalService.createNewPurchaseLocal = jest.fn(() => {
            return {
              data: {
                id: 1,
                name: 'Carrefour',
                latitude: 23.6666,
                longitude: 20.7778,
              },
            };
          });

          PurchaseService.createNewPurchase = jest.fn(
            (purchaseObject) => purchaseObject
          );

          const buttonSavePurchase = await waitFor(() =>
            getByTestId('button-save-purchase')
          );

          fireEvent.press(buttonSavePurchase);

          const purchaseLocationInput = await waitFor(() =>
            getByTestId('new-local-purchase')
          );

          await waitFor(() =>
            fireEvent.changeText(purchaseLocationInput, 'Carrefour')
          );

          const addPurchaseLocation = await waitFor(() =>
            getByTestId('add-purchase-location')
          );

          await waitFor(() => fireEvent.press(addPurchaseLocation));

          expect(PurchaseService.createNewPurchase).toHaveBeenCalled();

          const toast = await waitFor(() => getByText('purchaseSaved'));
          expect(toast).toBeDefined();
        });

        it('should show an error message due to server response error', async () => {
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
                  lists: lists,
                  setLists: (val) => {
                    lists = val;
                  },
                }}
              >
                <CheckedItemsProvider>
                  <SafeAreaProvider
                    initialSafeAreaInsets={{
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  >
                    <NativeBaseProvider>
                      <NavigationContext.Provider value={navContext}>
                        <CartScreen navigation={navigation} route={route} />
                      </NavigationContext.Provider>
                    </NativeBaseProvider>
                  </SafeAreaProvider>
                </CheckedItemsProvider>
              </ListContext.Provider>
            </AuthContext.Provider>
          );

          PurchaseLocalService.findNearBy = jest.fn(() => {
            return {
              data: [],
            };
          });

          PurchaseLocalService.createNewPurchaseLocal = jest.fn(() => {
            return {
              data: {
                id: 1,
                name: 'Carrefour',
                latitude: 23.6666,
                longitude: 20.7778,
              },
            };
          });

          const createNewPurchaseSpy = jest.spyOn(
            PurchaseService,
            'createNewPurchase'
          );

          // eslint-disable-next-line prefer-promise-reject-errors
          createNewPurchaseSpy.mockReturnValue(Promise.reject());

          const buttonSavePurchase = await waitFor(() =>
            getByTestId('button-save-purchase')
          );

          fireEvent.press(buttonSavePurchase);

          const purchaseLocationInput = await waitFor(() =>
            getByTestId('new-local-purchase')
          );

          await waitFor(() =>
            fireEvent.changeText(purchaseLocationInput, 'Carrefour')
          );

          const addPurchaseLocation = await waitFor(() =>
            getByTestId('add-purchase-location')
          );

          await waitFor(() => fireEvent.press(addPurchaseLocation));

          const toast = await waitFor(() => getByText('unsuccessfullySaved'));
          expect(toast).toBeDefined();
        });
      });
    });

    describe('when using the "see all items" visualization mode', () => {
      let renderResults;

      beforeEach(() => {
        lists = [
          {
            id: 1,
            nameList: 'Lista I',
            ownerId: 1,
            owner: 'Fulano',
            description: '',
            productsOfList: [
              {
                id: 10,
                productId: 1,
                listId: 1,
                assignedUserId: 10,
                userWhoMarkedId: null,
                name: 'Arroz',
                isMarked: false,
                plannedAmount: 10,
                markedAmount: null,
                price: 10,
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
                amountComment: 0,
              },
              {
                id: 11,
                productId: 2,
                listId: 1,
                assignedUserId: null,
                userWhoMarkedId: 10,
                name: 'Feijão',
                isMarked: true,
                plannedAmount: 10,
                markedAmount: 2,
                price: 5,
                measureValue: null,
                measureType: 'UNITY',
                product: {
                  id: 1,
                  name: 'Feijão',
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
                amountComment: 0,
              },
            ],
            listMembers: [
              {
                id: 2,
                userId: 10,
                listId: 1,
                statusListMember: 'ACCEPT',
                user: {
                  id: 10,
                  name: 'Alice Pieszecki',
                  username: 'alice',
                  email: 'alice@gmail.com',
                  password: null,
                },
              },
            ],
          },
          {
            id: 2,
            nameList: 'Lista II',
            ownerId: 1,
            owner: 'Fulano',
            description: '',
            productsOfList: [
              {
                id: 12,
                productId: 2,
                listId: 2,
                assignedUserId: null,
                userWhoMarkedId: null,
                name: 'Feijão',
                isMarked: null,
                plannedAmount: 10,
                markedAmount: 2,
                price: 5,
                measureValue: null,
                measureType: 'UNITY',
                product: {
                  id: 1,
                  name: 'Feijão',
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
                amountComment: 0,
              },
            ],
            listMembers: [],
          },
        ];

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
                lists: lists,
                setLists: (val) => {
                  lists = val;
                },
              }}
            >
              <CheckedItemsProvider>
                <SafeAreaProvider
                  initialSafeAreaInsets={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                >
                  <NativeBaseProvider>
                    <NavigationContext.Provider value={navContext}>
                      <CartScreen navigation={navigation} route={route} />
                    </NavigationContext.Provider>
                  </NativeBaseProvider>
                </SafeAreaProvider>
              </CheckedItemsProvider>
            </ListContext.Provider>
          </AuthContext.Provider>
        );

        getByTestId = renderResults.getByTestId;
        getByText = renderResults.getByText;
      });

      it('should filter to exhibit only the items that are neither marked by other users nor assigned', async () => {
        const productItemGeneral = await waitFor(() =>
          renderResults.getAllByTestId('product-item-general')
        );

        expect(productItemGeneral.length).toBe(1);
      });
    });
  });

  it('should go to history screen when clicking the correct menu item', async () => {
    lists = [
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

    jest.spyOn(ListService, 'getLists').mockReturnValueOnce(
      Promise.resolve({
        data: [...lists],
      })
    );

    const { getByTestId } = render(
      <AuthContext.Provider
        value={{
          user,
          login: () => {},
          logout: () => {},
        }}
      >
        <ListContext.Provider
          value={{
            lists: lists,
            setLists: (val) => {
              lists = [...val];
            },
          }}
        >
          <CheckedItemsProvider>
            <SafeAreaProvider
              initialSafeAreaInsets={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <CartScreen navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </CheckedItemsProvider>
        </ListContext.Provider>
      </AuthContext.Provider>
    );

    const productItemContextMenu = await waitFor(() =>
      getByTestId('product-item-context-menu')
    );

    fireEvent.press(productItemContextMenu);

    const historyMenuItem = await waitFor(() =>
      getByTestId('history-item-menu')
    );

    fireEvent.press(historyMenuItem);

    expect(navigation.navigate).toHaveBeenCalledWith('History');
  });

  it('should go to statistics screen when clicking the correct menu item', async () => {
    lists = [
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

    jest.spyOn(ListService, 'getLists').mockReturnValueOnce(
      Promise.resolve({
        data: [...lists],
      })
    );

    const { getByTestId } = render(
      <AuthContext.Provider
        value={{
          user,
          login: () => {},
          logout: () => {},
        }}
      >
        <ListContext.Provider
          value={{
            lists: lists,
            setLists: (val) => {
              lists = [...val];
            },
          }}
        >
          <CheckedItemsProvider>
            <SafeAreaProvider
              initialSafeAreaInsets={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <CartScreen navigation={navigation} route={route} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </CheckedItemsProvider>
        </ListContext.Provider>
      </AuthContext.Provider>
    );

    const productItemContextMenu = await waitFor(() =>
      getByTestId('product-item-context-menu')
    );

    fireEvent.press(productItemContextMenu);

    const historyMenuItem = await waitFor(() =>
      getByTestId('statistics-item-menu')
    );

    fireEvent.press(historyMenuItem);

    expect(navigation.navigate).toHaveBeenCalledWith('Statistics');
  });

  it('should refresh lists when refresh param is passed', async () => {
    lists = [
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

    jest.spyOn(ListService, 'getLists').mockReturnValueOnce(
      Promise.resolve({
        data: [...lists],
      })
    );

    const getListByIdSpy = jest.spyOn(ListService, 'getListById');

    const newRoute = {
      params: {
        refresh: true,
      },
    };

    const { getByTestId } = render(
      <AuthContext.Provider
        value={{
          user,
          login: () => {},
          logout: () => {},
        }}
      >
        <ListContext.Provider
          value={{
            lists: lists,
            setLists: (val) => {
              lists = [...val];
            },
          }}
        >
          <CheckedItemsProvider>
            <SafeAreaProvider
              initialSafeAreaInsets={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <NativeBaseProvider>
                <NavigationContext.Provider value={navContext}>
                  <CartScreen navigation={navigation} route={newRoute} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </CheckedItemsProvider>
        </ListContext.Provider>
      </AuthContext.Provider>
    );

    expect(getListByIdSpy).toHaveBeenCalledTimes(1);

    getListByIdSpy.mockClear();
  });
});
