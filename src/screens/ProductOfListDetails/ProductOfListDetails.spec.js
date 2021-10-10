/* eslint-disable no-undef */
import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ProductOfListDetails from './ProductOfListDetails';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import ProductOfListService from '../../services/ProductOfListService';
import i18 from 'react-i18next';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

i18.getI18n = jest.fn(() => 'pt_BR');

jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('ProductOfListDetailsScreen component', () => {
  let user, navigation, route, lists, item, navigationSpy;

  beforeEach(() => {
    navigation = {
      navigate: jest.fn((path, product) => path),
    };

    navigationSpy = jest.spyOn(navigation, 'navigate');

    user = {
      id: 1,
      name: 'Fulano',
      username: 'fulanodetal',
    };

    item = {
      id: 10,
      productId: 1,
      listId: 1,
      assignedUserId: 10,
      userWhoMarkedId: 10,
      name: 'Arroz',
      isMarked: true,
      plannedAmount: 10,
      markedAmount: null,
      price: 25.5,
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
    };

    lists = [
      {
        id: 1,
        nameList: 'Lista I',
        ownerId: 1,
        owner: 'Fulano',
        description: '',
        productsOfList: [item],
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
          {
            id: 3,
            userId: 12,
            listId: 1,
            statusListMember: 'ACCEPT',
            user: {
              id: 12,
              name: 'Shane McCutcheon',
              username: 'shane',
              email: 'alice@gmail.com',
              password: null,
            },
          },
        ],
      },
    ];

    route = {
      params: {
        product: {
          ...item,
        },
        origin: 'Lists',
      },
    };
  });

  describe('when the user clicks the comment button', () => {
    it('should go to the commentaries page', async () => {
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
      const commentariesButton = await waitFor(() =>
        getByTestId('commentaries-button')
      );

      await waitFor(() => fireEvent.press(commentariesButton));

      expect(navigationSpy).toHaveBeenCalledWith('Commentaries', {
        product: lists[0].productsOfList[0],
      });
    });
  });

  describe('when the user finishes the editing of a product of list', () => {
    let getByTestId, getByText;

    describe('when the editing is a success', () => {
      beforeEach(() => {
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
                lists: lists,
                setLists: (val) => {
                  lists = [...val];
                },
              }}
            >
              <SafeAreaProvider
                initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
              >
                <NativeBaseProvider>
                  <ProductOfListDetails navigation={navigation} route={route} />
                </NativeBaseProvider>
              </SafeAreaProvider>
            </ListContext.Provider>
          </AuthContext.Provider>
        );

        getByTestId = renderResults.getByTestId;
        getByText = renderResults.getByText;
      });

      it('should show a toast with a success message', async () => {
        const editedItem = Object.assign({}, lists[0].productsOfList[0]);
        editedItem.price = 5;

        const buttonFinishEditingItem = await waitFor(() =>
          getByTestId('button-finish-editing-item')
        );

        ProductOfListService.editProductOfList = jest.fn(() => {
          return {
            data: editedItem,
          };
        });

        await waitFor(() => fireEvent.press(buttonFinishEditingItem));

        const toast = await waitFor(() => getByText('editedWithSuccess'));
        expect(toast).toBeDefined();
      });

      it('should go back to the origin page', async () => {
        const editedItem = Object.assign({}, lists[0].productsOfList[0]);
        editedItem.price = 5;

        const buttonFinishEditingItem = await waitFor(() =>
          getByTestId('button-finish-editing-item')
        );

        ProductOfListService.editProductOfList = jest.fn(() => {
          return {
            data: editedItem,
          };
        });

        await waitFor(() => fireEvent.press(buttonFinishEditingItem));

        expect(navigationSpy).toHaveBeenCalledWith('Lists', { refresh: true });
      });
    });

    describe('when the editing fails', () => {
      beforeEach(() => {
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
                lists: lists,
                setLists: (val) => {
                  lists = [...val];
                },
              }}
            >
              <SafeAreaProvider
                initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
              >
                <NativeBaseProvider>
                  <ProductOfListDetails navigation={navigation} route={route} />
                </NativeBaseProvider>
              </SafeAreaProvider>
            </ListContext.Provider>
          </AuthContext.Provider>
        );

        getByTestId = renderResults.getByTestId;
        getByText = renderResults.getByText;
      });

      it('should show a toast with an error message', async () => {
        const editedItem = Object.assign({}, lists[0].productsOfList[0]);
        editedItem.price = 5;

        const buttonFinishEditingItem = await waitFor(() =>
          getByTestId('button-finish-editing-item')
        );

        const editProductOfListSpy = jest.spyOn(
          ProductOfListService,
          'editProductOfList'
        );
        // eslint-disable-next-line prefer-promise-reject-errors
        editProductOfListSpy.mockReturnValue(Promise.reject());

        await waitFor(() => fireEvent.press(buttonFinishEditingItem));

        const toast = await waitFor(() => getByText('unsuccessfullyEdited'));
        expect(toast).toBeDefined();
      });
    });
  });

  describe('when product of list is marked', () => {
    it('should disable the "assigning selector" (as owner of the list)', async () => {
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
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider>
                <ProductOfListDetails navigation={navigation} route={route} />
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      const assigningSelector = await waitFor(() =>
        getByTestId('select-list-member')
      );

      expect(assigningSelector.props.disabled).toBe(true);
    });
  });

  /**
   * @todo assign user test
   */
  describe('when user is the owner of the list ', () => {
    describe('the list has members', () => {
      it("should be able to assign an item, if it's not marked ", async () => {
        item = {
          id: 10,
          productId: 1,
          listId: 1,
          assignedUserId: null,
          userWhoMarkedId: null,
          name: 'Arroz',
          isMarked: false,
          plannedAmount: 10,
          markedAmount: null,
          price: 25.5,
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
        };
        lists[0].productsOfList = [item];

        route = {
          params: {
            product: {
              ...item,
            },
            origin: 'Lists',
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
              <SafeAreaProvider
                initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
              >
                <NativeBaseProvider>
                  <ProductOfListDetails navigation={navigation} route={route} />
                </NativeBaseProvider>
              </SafeAreaProvider>
            </ListContext.Provider>
          </AuthContext.Provider>
        );

        const assigningSelector = await waitFor(() =>
          getByTestId('select-list-member')
        );

        await waitFor(() => {
          fireEvent(assigningSelector, 'valueChange', 12);
        });

        expect(assigningSelector.props.value).toBe('Shane McCutcheon');
      });
    });
  });
});
