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
    navigationSpy = jest.spyOn(navigation, 'navigate');

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
  });
});
