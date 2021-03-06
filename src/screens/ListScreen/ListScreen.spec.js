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
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('ListScreen component', () => {
  let renderResults, getByTestId, getByText, rerender;
  let getListsSpy, navContext, navigation, route;
  let user;
  let lists = [];

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

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

  describe('when fetching lists', () => {
    it('should show a toast if server returns an error', async () => {
      lists = [];

      getListsSpy = jest.spyOn(ListService, 'getLists');
      getListsSpy.mockReturnValue(Promise.reject('Error'));

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

      getByText = renderResults.getByText;

      const toast = await waitFor(() =>
        getByText('N??o foi poss??vel buscar suas listas')
      );

      expect(toast).toBeDefined();
    });

    it('should automatically select a list if the list was saved as latest list selected', async () => {
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
        {
          id: 2,
          nameList: 'Lista II',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [],
          listMembers: [],
        },
      ];

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: lists,
        })
      );

      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockReturnValueOnce(Promise.resolve(2));

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

      const selectCurrentList = await waitFor(() =>
        getByTestId('select-current-list')
      );

      expect(selectCurrentList.props.value).toBe('Lista II');
    });

    it('should automaticaly select first list if an invalid list was saved as latest list selected', async () => {
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
        {
          id: 2,
          nameList: 'Lista II',
          ownerId: 1,
          owner: 'Fulano',
          description: '',
          productsOfList: [],
          listMembers: [],
        },
      ];

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: lists,
        })
      );

      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockReturnValueOnce(Promise.resolve(22));

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

      const selectCurrentList = await waitFor(() =>
        getByTestId('select-current-list')
      );

      expect(selectCurrentList.props.value).toBe('Lista I');
    });
  });

  describe("when the user doesn't have lists", () => {
    it('should show a button to create a new list', async () => {
      lists = [];

      getListsSpy = jest.spyOn(ListService, 'getLists');
      getListsSpy.mockReturnValueOnce(
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [],
        })
      );

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

    it('should be able to go to the list details screen', async () => {
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
      );

      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockReturnValueOnce(Promise.resolve(1));

      const routeNewListAdded = {
        params: {},
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
                  <List navigation={navigation} route={routeNewListAdded} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;

      const options = await waitFor(() => getByTestId('list-options'));
      fireEvent.press(options);

      const listDetailsMenuItem = await waitFor(() =>
        getByTestId('list-details-menu-item')
      );
      fireEvent.press(listDetailsMenuItem);

      expect(navigation.navigate).toBeCalledWith('ListDetails', {
        list: fabricatedLists[0],
      });
    });
  });

  describe('when the user is the owner of the list', () => {
    it('should be able to go to edit list screen', async () => {
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
      );

      const routeNewListAdded = {
        params: {},
      };

      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockReturnValueOnce(Promise.resolve(0));

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
              lists: [...fabricatedLists],
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
                  <List navigation={navigation} route={routeNewListAdded} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;

      const options = await waitFor(() => getByTestId('list-options'));
      fireEvent.press(options);

      const editListMenuItem = await waitFor(() =>
        getByTestId('edit-list-menu-item')
      );
      fireEvent.press(editListMenuItem);

      expect(navigation.navigate).toBeCalledWith('EditList', { listId: 1 });
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
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
                  name: 'Alimenta????o',
                },
              },
              amountComment: 1,
            },
          ],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
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

      const listSelect = await waitFor(() =>
        getByTestId('select-current-list')
      );

      await waitFor(() => {
        fireEvent(listSelect, 'valueChange', '2');
      });

      // const listSelectValue = listSelect.props.value;
      // const textProductItem = await waitFor(() => getByText('Arroz'));

      // expect(listSelectValue).toBe('Lista II');
      // expect(textProductItem).toBeDefined();
    });

    it('should not store list if AsyncStorage returns an error', async () => {
      const getItemSpy = jest.spyOn(AsyncStorage, 'getItem');

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
                  name: 'Alimenta????o',
                },
              },
              amountComment: 1,
            },
          ],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
      );

      jest
        .spyOn(AsyncStorage, 'setItem')
        .mockReturnValueOnce(Promise.reject('Error'));

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
      rerender = renderResults.rerender;

      const listSelect = await waitFor(() =>
        getByTestId('select-current-list')
      );

      await waitFor(() => {
        fireEvent(listSelect, 'valueChange', 2);
      });

      getItemSpy.mockReturnValue(Promise.resolve(null));

      rerender(
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
                  <List navigation={navigation} route={{}} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      const listSelectAfterRerender = await waitFor(() =>
        getByTestId('select-current-list')
      );

      expect(listSelectAfterRerender.props.value).toBe('Lista I');

      getItemSpy.mockClear();
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
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
            name: 'Alimenta????o',
          },
        },
      ];

      jest
        .spyOn(ProductService, 'getProductByName')
        .mockImplementation((productName) =>
          Promise.resolve({
            data: products.filter((p) => p.name.includes(productName)),
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

      const inputSearchProduct = await waitFor(() =>
        getByTestId('input-search-product')
      );

      await waitFor(() => {
        fireEvent.changeText(inputSearchProduct, 'Arroz');
      });

      const itemsFound = await waitFor(() => {
        return renderResults.getByTestId('products-found-0');
      });

      expect(itemsFound).not.toBeNull()
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
      );

      const getProductByNameSpy = jest
        .spyOn(ProductService, 'getProductByName')
        .mockClear();

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
            name: 'Alimenta????o',
          },
        },
      ];

      jest
        .spyOn(ProductService, 'getProductByName')
        .mockImplementation((productName) =>
          Promise.resolve({
            data: products.filter((p) => p.name.includes(productName)),
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

      const inputSearchProduct = await waitFor(() =>
        getByTestId('input-search-product')
      );

      await waitFor(() => {
        fireEvent.changeText(inputSearchProduct, 'A');
      });

      expect(getProductByNameSpy).not.toBeCalled();
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
      );

      jest.spyOn(ProductService, 'getProductByName').mockReturnValue(
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

      fireEvent.press(addNewProductOption);

      expect(navigation.navigate).toHaveBeenCalledWith('NewProduct', {
        productName: 'Arroz',
      });
    });

    it('should display an option to add a new product by barcode number if no product is found', async () => {
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
      );

      jest.spyOn(ProductService, 'getProductByName').mockReturnValue(
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

      const inputSearchProduct = await waitFor(() =>
        getByTestId('input-search-product')
      );

      await waitFor(() => {
        fireEvent.changeText(inputSearchProduct, '1234567891234');
      });

      const addNewProductOption = await waitFor(() => {
        return getByTestId('option-add-new-product');
      });

      expect(addNewProductOption).toBeDefined();

      fireEvent.press(addNewProductOption);

      expect(navigation.navigate).toHaveBeenCalledWith('NewProduct', {
        barcode: '1234567891234',
      });
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
      );

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

  describe('when the user presses to search a product by barcode', () => {
    it('should redirect to the barcode reader screen', async () => {
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
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

      const barcodeReaderSearch = await waitFor(() =>
        getByTestId('barcode-reader-search')
      );

      await waitFor(() => {
        fireEvent.press(barcodeReaderSearch);
      });

      expect(navigation.navigate).toHaveBeenCalledWith('BarcodeReader');
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
      );

      jest.spyOn(ProductOfListService, 'createProductOfList').mockReturnValue(
        Promise.resolve({
          id: 1,
          productId: 1,
          listId: 1,
          name: 'Arroz',
          price: null,
          measureValue: null,
          measureType: 'UNITY',
        })
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

    it('should add by barcode number', async () => {
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
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
            name: 'Alimenta????o',
          },
        },
      ];

      jest
        .spyOn(ProductService, 'getProductByBarcode')
        .mockImplementation(() =>
          Promise.resolve({
            data: products.filter((p) => p.name.includes('Arroz')),
          })
        );

      jest.spyOn(ProductOfListService, 'createProductOfList')

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
        fireEvent.changeText(inputSearchProduct, '1234567891234');
      });

      const itemsFound = await waitFor(() => {
        return renderResults.getByTestId('products-found-0');
      });

      expect(itemsFound).not.toBeNull()

      await waitFor(() => {
        fireEvent.press(itemsFound);
      });

      expect(ProductOfListService.createProductOfList).toHaveBeenCalled()
    });

    it('should add by barcode number and returns an object', async () => {
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
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
            name: 'Alimenta????o',
          },
        },
      ];

      jest
        .spyOn(ProductService, 'getProductByBarcode')
        .mockImplementation(() =>
          Promise.resolve({
            data: products.filter((p) => p.name.includes('Arroz'))[0],
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

      const inputSearchProduct = await waitFor(() =>
        getByTestId('input-search-product')
      );

      await waitFor(() => {
        fireEvent.changeText(inputSearchProduct, '1234567891234');
      });

      const itemsFound = await waitFor(() => {
        return renderResults.getByTestId('products-found-0');
      });

      expect(itemsFound).not.toBeNull()
    });
  });

  describe('when the user successfully reads a product by barcode', () => {
    it('it should add it to the list', async () => {
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

      route = {
        params: {
          foundProductByBarcode: {
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

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
      );

      jest.spyOn(ProductOfListService, 'createProductOfList').mockReturnValue(
        Promise.resolve({
          id: 1,
          productId: 1,
          listId: 1,
          name: 'Arroz',
          price: null,
          measureValue: null,
          measureType: 'UNITY',
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
                  name: 'Alimenta????o',
                },
              },
              amountComment: 1,
            },
          ],
          listMembers: [],
        },
      ];

      lists = [...fabricatedLists];

      jest.spyOn(ListService, 'getLists').mockReturnValue(
        Promise.resolve({
          data: [...fabricatedLists],
        })
      );

      jest
        .spyOn(ProductOfListService, 'createProductOfList')
        .mockImplementation(() => {});

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
            name: 'Alimenta????o',
          },
        },
      ];

      jest
        .spyOn(ProductService, 'getProductByName')
        .mockImplementation((productName) =>
          Promise.resolve({
            data: products.filter((p) => p.name.includes(productName)),
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

      const itemsFound = await waitFor(() => {
        return renderResults.getByTestId('products-found-0');
      });

      await waitFor(() => {
        fireEvent.press(itemsFound);
      });

      const toast = getByText('productAlreadyOnList');
      expect(toast).toBeDefined();
    });
  });

  describe('when the list is requested to update', () => {
    it('should fetch list twice', async () => {
      const getListsSpy = jest.spyOn(ListService, 'getLists');
      getListsSpy.mockClear();

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

      const refreshRoute = {
        params: {
          refresh: true,
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
                  <List navigation={navigation} route={refreshRoute} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      expect(getListsSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('when there is no route params', () => {
    it('should fetch list twice', async () => {
      const getListsSpy = jest.spyOn(ListService, 'getLists');
      getListsSpy.mockClear();

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

      const refreshRoute = {};

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
                  <List navigation={navigation} route={refreshRoute} />
                </NavigationContext.Provider>
              </NativeBaseProvider>
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      expect(getListsSpy).toHaveBeenCalledTimes(2);
    });
  });
});
