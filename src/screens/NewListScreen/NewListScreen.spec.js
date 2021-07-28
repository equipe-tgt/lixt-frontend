import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-dom';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthProvider';
import NewListScreen from './NewListScreen';
import ListService from '../../services/ListService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('NewListScreen component', () => {
  let getByTestId, getByText;
  let createListButton;
  let navigationSpy;

  beforeEach(() => {
    const navigation = {
      navigate: jest.fn((path) => path),
    };
    navigationSpy = jest.spyOn(navigation, 'navigate');

    const user = {
      id: 1
    };

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
            children={<NewListScreen navigation={navigation} />}
          />
        </SafeAreaProvider>
      </AuthContext.Provider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
    createListButton = getByTestId('create-list-button');
  });

  describe('Name list field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(createListButton);
      });

      const nameListError = getByTestId('error-new-list-name-list');
      expect(nameListError.props.children).toBe('requiredField');
    });

    it('should show max length field error when it has more than 45 characters', async () => {
      const nameListInput = getByTestId('new-list-name-list');

      await waitFor(() => fireEvent.changeText(
        nameListInput, 'Lista muito grande que deve ser maior de 45 caracteres para aparecer um erro'));
      await waitFor(() => {
        fireEvent.press(createListButton);
      });

      const nameListError = getByTestId('error-new-list-name-list');
      expect(nameListError.props.children).toBe('fieldMaxChars');
    });

    it('should not show required field error when it is filled properly', async () => {
      const nameListInput = getByTestId('new-list-name-list');

      await waitFor(() => fireEvent.changeText(nameListInput, 'Lista 01'));
      await waitFor(() => fireEvent.press(createListButton));

      const nameListError = getByTestId('error-new-list-name-list');

      expect(nameListError.props.children).toBeUndefined();
    });
  });

  describe('Description field', () => {
    it('should show max length field error when it has more than 200 characters', async () => {
      const descriptionInput = getByTestId('new-list-description');

      await waitFor(() => fireEvent.changeText(
        descriptionInput, `
          Este é uma descrição muito longa mesmo, para isso, ela precisa ter mais de
          200 caracteres, e um erro deve aparecer em letras vermelhas. Essa lista
          é uma lista aleatório de compras de supermercado, para dividir com os amigos
          e todo mundo sair em lucro.
        `));
      await waitFor(() => {
        fireEvent.press(createListButton);
      });

      const descriptionError = getByTestId('error-new-list-description');
      expect(descriptionError.props.children).toBe('fieldMaxChars');
    });
  });

  describe('when form is properly filled', () => {
    it('should show default server error message when is not possible to create a list', async () => {
        const listMock = jest.spyOn(ListService, 'createList');
        listMock.mockReturnValue(
          Promise.reject()
        );

        await waitFor(() => {
          fireEvent.changeText(getByTestId('new-list-name-list'), 'Lista 01');
          fireEvent.changeText(getByTestId('new-list-description'), 'Descrição');
        });
        await waitFor(() => fireEvent.press(createListButton));

        const toast = getByText('errorServerDefault');
        expect(toast).toBeDefined();
      }
    );

    it('should show successfull message when creating a new list and redirect to the lists page', async () => {
        const listMock = jest.spyOn(ListService, 'createList');
        listMock.mockReturnValue(
          Promise.resolve({
            data: {}
          })
        );

        await waitFor(() => {
          fireEvent.changeText(getByTestId('new-list-name-list'), 'Lista #02');
          fireEvent.changeText(getByTestId('new-list-description'), 'Descrição');
        });
        await waitFor(() => fireEvent.press(createListButton));

        const toast = getByText('createdList');
        expect(toast).toBeDefined();
        expect(navigationSpy).toHaveBeenCalledWith('Lists', { newList: {} });
      }
    );
  });
});
