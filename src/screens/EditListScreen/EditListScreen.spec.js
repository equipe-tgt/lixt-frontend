import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import { NavigationContext } from '@react-navigation/native';
import EditListScreen from './EditListScreen';
import ListService from '../../services/ListService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('ListDetailsScreen component', () => {
  let getByTestId, getByText, queryByTestId;
  let navigationSpy;
  let user;
  const list = {
    id: 1,
    listMembers: [],
    productOfList: [],
    owner: 'fulanodetal',
    ownerId: 1,
    nameList: 'Lista 01',
    description: 'Descrição',
  };

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  beforeEach(() => {
    const navigation = {
      navigate: jest.fn((path) => path),
    };
    navigationSpy = jest.spyOn(navigation, 'navigate');

    const route = {
      params: {
        listId: list.id,
      },
    };

    const navContext = {
      isFocused: () => true,
      // addListener returns an unscubscribe function.
      addListener: jest.fn(() => jest.fn()),
    };

    user = {
      id: 1,
      name: 'Fulano',
      username: 'fulanodetal',
    };

    jest.spyOn(ListService, 'getListById').mockReturnValue(
      Promise.resolve({
        data: list,
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
          <NativeBaseProvider
            children={
              <NavigationContext.Provider value={navContext}>
                <EditListScreen navigation={navigation} route={route} />
              </NavigationContext.Provider>
            }
          />
        </SafeAreaProvider>
      </AuthContext.Provider>
    );

    getByTestId = renderResults.getByTestId;
    queryByTestId = renderResults.queryByTestId;
    getByText = renderResults.getByText;
  });

  it('should load data from backend into the field', async () => {
    const editListName = await waitFor(() => getByTestId('edit-list-name'));
    const editListDescription = await waitFor(() =>
      getByTestId('edit-list-description')
    );

    expect(editListName.props.value).toBe('Lista 01');
    expect(editListDescription.props.value).toBe('Descrição');
  });

  it('should send the fields data updated to the backend', async () => {
    const editListName = await waitFor(() => getByTestId('edit-list-name'));
    const editListDescription = await waitFor(() =>
      getByTestId('edit-list-description')
    );

    await waitFor(() =>
      fireEvent.changeText(editListName, { target: { value: 'Lista 01 2021' } })
    );
    await waitFor(() =>
      fireEvent.changeText(editListDescription, {
        target: { value: 'Nova Descrição' },
      })
    );

    const editListSpy = jest.spyOn(ListService, 'editList');

    editListSpy.mockReturnValue(Promise.resolve({ data: {} }));

    const editListButton = await waitFor(() => getByTestId('edit-list-button'));

    await waitFor(() => fireEvent.press(editListButton));

    expect(editListSpy).toHaveBeenCalledWith(
      {
        id: 1,
        listMembers: [],
        productOfList: [],
        owner: 'fulanodetal',
        ownerId: 1,
        nameList: 'Lista 01 2021',
        description: 'Nova Descrição',
      },
      1,
      user
    );

    expect(navigationSpy).toHaveBeenCalledWith('Lists', { refresh: true });
  });

  it('should send the fields data updated to the backend', async () => {
    const editListName = await waitFor(() => getByTestId('edit-list-name'));
    const editListDescription = await waitFor(() =>
      getByTestId('edit-list-description')
    );

    await waitFor(() =>
      fireEvent.changeText(editListName, { target: { value: 'Lista 01 2021' } })
    );
    await waitFor(() =>
      fireEvent.changeText(editListDescription, {
        target: { value: 'Nova Descrição' },
      })
    );

    const editListSpy = jest.spyOn(ListService, 'editList');

    editListSpy.mockReturnValue(Promise.reject());

    const editListButton = await waitFor(() => getByTestId('edit-list-button'));

    await waitFor(() => fireEvent.press(editListButton));

    const toast = await waitFor(() => getByText('errorServerDefault'));

    expect(toast).toBeDefined();
    expect(navigationSpy).not.toHaveBeenCalled();
  });
});
