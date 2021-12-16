import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CommentaryScreen from './CommentaryScreen';
import { AuthContext } from '../../context/AuthProvider';
import { NavigationContext } from '@react-navigation/native';
import CommentaryService from '../../services/CommentaryService';
import AuthService from '../../services/AuthService';
import ProductOfListService from '../../services/ProductOfListService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('CommentaryScreen component', () => {
  let getByTestId, getByText, findByTestId, getAllByTestId;
  let user, user2;

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  describe('when preference order is by date', () => {
    beforeEach(() => {
      const route = {
        params: {
          product: {
            productId: 1,
          },
        },
      };

      user = {
        id: 1,
        name: 'Fulano',
        username: 'fulanodetal',
        email: 'fulanodetal@gmail.com',
        preferences: {
          globalCommentsChronOrder: true,
          olderCommentsFirst: true
        }
      };

      user2 = {
        id: 2,
        name: 'Ciclano',
        username: 'ciclanodetal',
        email: 'ciclanodetal@gmail.com',
      };

      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn()),
      };

      jest
        .spyOn(ProductOfListService, 'getProductOfListComments')
        .mockReturnValue(
          Promise.resolve({
            data: {
              commentsDto: [
                {
                  id: 1,
                  userId: 1,
                  productOfListId: 1,
                  content: 'Primeiro comentário',
                  user: user,
                  date: new Date(2021, 1, 16),
                },
                {
                  id: 2,
                  userId: 2,
                  productOfListId: 1,
                  content: 'Segundo comentário',
                  user: user2,
                  date: new Date(2021, 2, 21),
                },
                {
                  id: 3,
                  userId: 1,
                  productOfListId: 1,
                  content: 'Terceiro comentário',
                  user: user,
                  date: new Date(2021, 1, 10),
                },
                {
                  id: 4,
                  userId: 2,
                  productOfListId: 1,
                  content: 'Quarto comentário',
                  user: user,
                  date: new Date(2021, 5, 10),
                },
              ],
              globalCommentsDto: [
                {
                  id: 5,
                  userId: 1,
                  productId: 1,
                  content: 'Primeiro comentário global',
                  user: user,
                  date: new Date(2021, 3, 6),
                  isPublic: true,
                },
                {
                  id: 6,
                  userId: 2,
                  productId: 1,
                  content: 'Segundo comentário global',
                  user: user2,
                  date: new Date(2021, 2, 2),
                  isPublic: true,
                },
                {
                  id: 7,
                  userId: 2,
                  productId: 1,
                  content: 'Terceiro comentário global',
                  user: user2,
                  date: new Date(2021, 5, 10),
                  isPublic: false,
                },
                {
                  id: 8,
                  userId: 1,
                  productId: 1,
                  content: 'Quarto comentário global',
                  user: user2,
                  date: new Date(2021, 2, 10),
                  isPublic: false,
                },
              ],
            },
          })
        );
      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockReturnValue(Promise.resolve('pt_BR'));

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
                  <CommentaryScreen route={route} />
                </NavigationContext.Provider>
              }
            />
          </SafeAreaProvider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      findByTestId = renderResults.findByTestId;
      getByText = renderResults.getByText;
      getAllByTestId = renderResults.getAllByTestId;
    });

    it('should not change order to date', async () => {
      jest.spyOn(AuthService, 'putUserPreferences').mockClear();

      const settingsButton = await waitFor(() =>
        getByTestId('settings-button')
      );
      await waitFor(() => fireEvent.press(settingsButton));

      const orderByDateButton = await waitFor(() =>
        getByTestId('order-by-date-button')
      );
      await waitFor(() => {
        fireEvent.press(orderByDateButton);
      });

      expect(orderByDateButton.props.isDisabled).toBe(true);
      expect(AuthService.putUserPreferences).not.toHaveBeenCalled();
    });

    it('should change order to user', async () => {
      jest
        .spyOn(AuthService, 'putUserPreferences')
        .mockReturnValue(Promise.resolve());

      const settingsButton = await waitFor(() =>
        getByTestId('settings-button')
      );
      await waitFor(() => {
        fireEvent.press(settingsButton);
      });

      const orderByUserButton = await waitFor(() =>
        getByTestId('order-by-user-button')
      );
      expect(orderByUserButton.props.isDisabled).toBe(false);

      await waitFor(() => {
        fireEvent.press(orderByUserButton);
      });

      expect(AuthService.putUserPreferences).toHaveBeenCalled();
    });

    it('should add a new comentary', async () => {
      jest.spyOn(CommentaryService, 'addCommentary').mockReturnValue(
        Promise.resolve({
          data: {
            id: 9,
            userId: 1,
            productId: 1,
            content: 'Novo comentário',
            user: user2,
            date: new Date(2021, 2, 11),
            isPublic: false,
          },
        })
      );

      const commentaryTextArea = await waitFor(() =>
        getByTestId('commentary-text-area')
      );
      await waitFor(() => {
        fireEvent.changeText(commentaryTextArea, 'Novo comentário');
      });

      const addCommentaryButton = await waitFor(() =>
        getByTestId('add-commentary-button')
      );
      await waitFor(() => fireEvent.press(addCommentaryButton));

      const toast = await waitFor(() => getByText('addCommentarySuccess'));
      expect(toast).toBeDefined();
    });

    it('should add a new private global comentary', async () => {
      jest.spyOn(CommentaryService, 'addGlobalCommentary').mockReturnValue(
        Promise.resolve({
          data: {
            id: 9,
            userId: 1,
            productId: 1,
            content: 'Novo comentário',
            user: user2,
            date: new Date(2021, 2, 11),
            isPublic: true,
          },
        })
      );

      const commentaryTextArea = await waitFor(() =>
        getByTestId('commentary-text-area')
      );
      await waitFor(() => {
        fireEvent.changeText(commentaryTextArea, 'Novo comentário');
      });

      const changeGlobalCheckbox = await waitFor(
        () => getAllByTestId('change-commentary-type-checkbox')[0]
      );
      await waitFor(() => fireEvent.press(changeGlobalCheckbox));

      const addCommentaryButton = await waitFor(() =>
        getByTestId('add-commentary-button')
      );
      await waitFor(() => fireEvent.press(addCommentaryButton));

      const toast = await waitFor(() =>
        getByText('addGlobalCommentarySuccess')
      );
      expect(toast).toBeDefined();
    });
  });

  describe('when preference order is by user', () => {
    let getByTestId, getByText;
    let user;

    beforeEach(() => {
      const route = {
        params: {
          product: {
            productId: 1,
            id: 1,
          },
        },
      };

      user = {
        id: 1,
        name: 'Fulano',
        username: 'fulanodetal',
        email: 'fulanodetal@gmail.com',
        preferences: {
          globalCommentsChronOrder: false,
          olderCommentsFirst: true
        }
      };

      user2 = {
        id: 2,
        name: 'Ciclano',
        username: 'ciclanodetal',
        email: 'ciclanodetal@gmail.com',
      };

      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn()),
      };

      jest
        .spyOn(ProductOfListService, 'getProductOfListComments')
        .mockReturnValue(
          Promise.resolve({
            data: {
              commentsDto: [
                {
                  id: 1,
                  userId: 1,
                  productOfListId: 1,
                  content: 'Primeiro comentário',
                  user: user,
                  date: new Date(2021, 1, 16),
                },
                {
                  id: 2,
                  userId: 2,
                  productOfListId: 1,
                  content: 'Segundo comentário',
                  user: user2,
                  date: new Date(2021, 2, 21),
                },
                {
                  id: 3,
                  userId: 1,
                  productOfListId: 1,
                  content: 'Terceiro comentário',
                  user: user,
                  date: new Date(2021, 1, 10),
                },
                {
                  id: 4,
                  userId: 2,
                  productOfListId: 1,
                  content: 'Quarto comentário',
                  user: user,
                  date: new Date(2021, 5, 10),
                },
              ],
              globalCommentsDto: [
                {
                  id: 5,
                  userId: 1,
                  productId: 1,
                  content: 'Primeiro comentário global',
                  user: user,
                  date: new Date(2021, 3, 6),
                  isPublic: true,
                },
                {
                  id: 6,
                  userId: 2,
                  productId: 1,
                  content: 'Segundo comentário global',
                  user: user2,
                  date: new Date(2021, 2, 2),
                  isPublic: true,
                },
                {
                  id: 7,
                  userId: 2,
                  productId: 1,
                  content: 'Terceiro comentário global',
                  user: user2,
                  date: new Date(2021, 5, 10),
                  isPublic: false,
                },
                {
                  id: 8,
                  userId: 1,
                  productId: 1,
                  content: 'Quarto comentário global',
                  user: user2,
                  date: new Date(2021, 2, 10),
                  isPublic: false,
                },
              ],
            },
          })
        );
      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockReturnValue(Promise.resolve('pt_BR'));

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
                  <CommentaryScreen route={route} />
                </NavigationContext.Provider>
              }
            />
          </SafeAreaProvider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
    });

    it('should not change order to user', async () => {
      jest
        .spyOn(AuthService, 'putUserPreferences')
        .mockReturnValue(Promise.resolve());

      const settingsButton = await waitFor(() =>
        getByTestId('settings-button')
      );
      await waitFor(() => {
        fireEvent.press(settingsButton);
      });

      const orderByUserButton = await waitFor(() =>
        getByTestId('order-by-user-button')
      );
      await waitFor(() => {
        fireEvent.press(orderByUserButton);
      });

      expect(orderByUserButton.props.isDisabled).toBe(true);
      expect(AuthService.putUserPreferences).toHaveBeenCalled();
    });

    it('should change order to date', async () => {
      const putUserPreferencesSpy = jest.spyOn(
        AuthService,
        'putUserPreferences'
      );
      putUserPreferencesSpy.mockClear();

      const settingsButton = await waitFor(() =>
        getByTestId('settings-button')
      );
      await waitFor(() => {
        fireEvent.press(settingsButton);
      });

      const orderByDateButton = await waitFor(() =>
        getByTestId('order-by-date-button')
      );
      expect(orderByDateButton.props.isDisabled).toBe(false);

      await waitFor(() => fireEvent.press(orderByDateButton));

      expect(putUserPreferencesSpy).toHaveBeenCalled();
    });
  });

  describe('when preference order is by asc', () => {
    beforeEach(() => {
      const route = {
        params: {
          product: {
            productId: 1,
            id: 1,
          },
        },
      };

      user = {
        id: 1,
        name: 'Fulano',
        username: 'fulanodetal',
        email: 'fulanodetal@gmail.com',
        preferences: {
          globalCommentsChronOrder: true,
          olderCommentsFirst: false
        }
      };

      user2 = {
        id: 2,
        name: 'Ciclano',
        username: 'ciclanodetal',
        email: 'ciclanodetal@gmail.com',
      };

      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn()),
      };

      jest
        .spyOn(ProductOfListService, 'getProductOfListComments')
        .mockReturnValue(
          Promise.resolve({
            data: {
              commentsDto: [
                {
                  id: 1,
                  userId: 1,
                  productOfListId: 1,
                  content: 'Primeiro comentário',
                  user: user,
                  date: new Date(2021, 1, 16),
                },
                {
                  id: 2,
                  userId: 2,
                  productOfListId: 1,
                  content: 'Segundo comentário',
                  user: user2,
                  date: new Date(2021, 2, 21),
                },
                {
                  id: 3,
                  userId: 1,
                  productOfListId: 1,
                  content: 'Terceiro comentário',
                  user: user,
                  date: new Date(2021, 1, 10),
                },
                {
                  id: 4,
                  userId: 2,
                  productOfListId: 1,
                  content: 'Quarto comentário',
                  user: user,
                  date: new Date(2021, 5, 10),
                },
              ],
              globalCommentsDto: [
                {
                  id: 5,
                  userId: 1,
                  productId: 1,
                  content: 'Primeiro comentário global',
                  user: user,
                  date: new Date(2021, 3, 6),
                  isPublic: true,
                },
                {
                  id: 6,
                  userId: 2,
                  productId: 1,
                  content: 'Segundo comentário global',
                  user: user2,
                  date: new Date(2021, 2, 2),
                  isPublic: true,
                },
                {
                  id: 7,
                  userId: 2,
                  productId: 1,
                  content: 'Terceiro comentário global',
                  user: user2,
                  date: new Date(2021, 5, 10),
                  isPublic: false,
                },
                {
                  id: 8,
                  userId: 1,
                  productId: 1,
                  content: 'Quarto comentário global',
                  user: user2,
                  date: new Date(2021, 2, 10),
                  isPublic: false,
                },
              ],
            },
          })
        );
      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockReturnValue(Promise.resolve('pt_BR'));

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
                  <CommentaryScreen route={route} />
                </NavigationContext.Provider>
              }
            />
          </SafeAreaProvider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      findByTestId = renderResults.findByTestId;
      getByText = renderResults.getByText;
    });

    it('should not change order to asc', async () => {
      const putUserPreferencesSpy = jest.spyOn(
        AuthService,
        'putUserPreferences'
      );
      putUserPreferencesSpy.mockClear();

      const sortButton = await waitFor(() => getByTestId('sort-button'));
      await waitFor(() => {
        fireEvent.press(sortButton);
      });

      const orderByAscButton = await waitFor(() =>
        getByTestId('order-by-asc-button')
      );
      await waitFor(() => {
        fireEvent.press(orderByAscButton);
      });

      expect(orderByAscButton.props.isDisabled).toBe(true);
      expect(putUserPreferencesSpy).not.toHaveBeenCalled();
    });

    it('should change order to user', async () => {
      const putUserPreferencesSpy = jest.spyOn(
        AuthService,
        'putUserPreferences'
      );
      putUserPreferencesSpy.mockClear();

      const sortButton = await waitFor(() => getByTestId('sort-button'));
      await waitFor(() => {
        fireEvent.press(sortButton);
      });

      const orderByDescButton = await waitFor(() =>
        getByTestId('order-by-desc-button')
      );
      expect(orderByDescButton.props.isDisabled).toBe(false);

      await waitFor(() => {
        fireEvent.press(orderByDescButton);
      });

      expect(putUserPreferencesSpy).toHaveBeenCalled();
    });
  });

  describe('when preference order is by desc', () => {
    let getByTestId, getByText, getAllByTestId;
    let user;

    beforeEach(() => {
      const route = {
        params: {
          product: {
            productId: 1,
            id: 1,
          },
        },
      };

      user = {
        id: 1,
        name: 'Fulano',
        username: 'fulanodetal',
        email: 'fulanodetal@gmail.com',
        preferences: {
          globalCommentsChronOrder: false,
          olderCommentsFirst: true,
        }
      };

      user2 = {
        id: 2,
        name: 'Ciclano',
        username: 'ciclanodetal',
        email: 'ciclanodetal@gmail.com',
      };

      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn()),
      };

      jest
        .spyOn(ProductOfListService, 'getProductOfListComments')
        .mockReturnValue(
          Promise.resolve({
            data: {
              commentsDto: [
                {
                  id: 1,
                  userId: 1,
                  productOfListId: 1,
                  content: 'Primeiro comentário',
                  user: user,
                  date: new Date(2021, 1, 16),
                },
                {
                  id: 2,
                  userId: 2,
                  productOfListId: 1,
                  content: 'Segundo comentário',
                  user: user2,
                  date: new Date(2021, 2, 21),
                },
                {
                  id: 3,
                  userId: 1,
                  productOfListId: 1,
                  content: 'Terceiro comentário',
                  user: user,
                  date: new Date(2021, 1, 10),
                },
                {
                  id: 4,
                  userId: 2,
                  productOfListId: 1,
                  content: 'Quarto comentário',
                  user: user,
                  date: new Date(2021, 5, 10),
                },
              ],
              globalCommentsDto: [
                {
                  id: 5,
                  userId: 1,
                  productId: 1,
                  content: 'Primeiro comentário global',
                  user: user,
                  date: new Date(2021, 3, 6),
                  isPublic: true,
                },
                {
                  id: 6,
                  userId: 2,
                  productId: 1,
                  content: 'Segundo comentário global',
                  user: user2,
                  date: new Date(2021, 2, 2),
                  isPublic: true,
                },
                {
                  id: 7,
                  userId: 2,
                  productId: 1,
                  content: 'Terceiro comentário global',
                  user: user2,
                  date: new Date(2021, 5, 10),
                  isPublic: false,
                },
                {
                  id: 8,
                  userId: 1,
                  productId: 1,
                  content: 'Quarto comentário global',
                  user: user2,
                  date: new Date(2021, 2, 10),
                  isPublic: false,
                },
              ],
            },
          })
        );
      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockReturnValue(Promise.resolve('pt_BR'));

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
                  <CommentaryScreen route={route} />
                </NavigationContext.Provider>
              }
            />
          </SafeAreaProvider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      getAllByTestId = renderResults.getAllByTestId;
    });

    it('should not change order to desc', async () => {
      const putUserPreferencesSpy = jest.spyOn(
        AuthService,
        'putUserPreferences'
      );
      putUserPreferencesSpy.mockClear();

      const sortButton = await waitFor(() => getByTestId('sort-button'));
      await waitFor(() => {
        fireEvent.press(sortButton);
      });

      const orderByDescButton = await waitFor(() =>
        getByTestId('order-by-desc-button')
      );
      await waitFor(() => {
        fireEvent.press(orderByDescButton);
      });

      expect(orderByDescButton.props.isDisabled).toBe(true);
      expect(putUserPreferencesSpy).not.toHaveBeenCalled();
    });

    it('should change order to asc', async () => {
      const putUserPreferencesSpy = jest.spyOn(
        AuthService,
        'putUserPreferences'
      );
      putUserPreferencesSpy.mockClear();

      const sortButton = await waitFor(() => getByTestId('sort-button'));
      await waitFor(() => {
        fireEvent.press(sortButton);
      });

      const orderByAscButton = await waitFor(() =>
        getByTestId('order-by-asc-button')
      );
      expect(orderByAscButton.props.isDisabled).toBe(false);

      await waitFor(() => {
        fireEvent.press(orderByAscButton);
      });

      expect(putUserPreferencesSpy).toHaveBeenCalled();
    });

    it('should add a new comentary', async () => {
      jest.spyOn(CommentaryService, 'addCommentary').mockReturnValue(
        Promise.resolve({
          data: {
            id: 9,
            userId: 1,
            productId: 1,
            content: 'Novo comentário',
            user: user2,
            date: new Date(2021, 2, 11),
            isPublic: false,
          },
        })
      );
      const commentaryTextArea = await waitFor(() =>
        getByTestId('commentary-text-area')
      );
      await waitFor(() => {
        fireEvent.changeText(commentaryTextArea, 'Novo comentário');
      });

      const addCommentaryButton = await waitFor(() =>
        getByTestId('add-commentary-button')
      );
      await waitFor(() => fireEvent.press(addCommentaryButton));

      const toast = await waitFor(() => getByText('addCommentarySuccess'));
      expect(toast).toBeDefined();
    });

    it('should not add a new comentary if server returns an error', async () => {
      const addCommentarySpy = jest.spyOn(CommentaryService, 'addCommentary');
      addCommentarySpy.mockReturnValue(Promise.reject(new Error('Error')));

      const commentaryTextArea = await waitFor(() =>
        getByTestId('commentary-text-area')
      );
      await waitFor(() => {
        fireEvent.changeText(commentaryTextArea, 'Novo comentário');
      });

      const addCommentaryButton = await waitFor(() =>
        getByTestId('add-commentary-button')
      );
      await waitFor(() => fireEvent.press(addCommentaryButton));

      const toast = await waitFor(() => getByText('addCommentaryFail'));
      expect(toast).toBeDefined();
    });

    it('should not add a new comentary if it is empty', async () => {
      const addCommentarySpy = jest.spyOn(CommentaryService, 'addCommentary');
      addCommentarySpy.mockClear();

      const commentaryTextArea = await waitFor(() =>
        getByTestId('commentary-text-area')
      );
      await waitFor(() => {
        fireEvent.changeText(commentaryTextArea, ' ');
      });

      const addCommentaryButton = await waitFor(() =>
        getByTestId('add-commentary-button')
      );
      await waitFor(() => fireEvent.press(addCommentaryButton));

      expect(addCommentarySpy).not.toHaveBeenCalled();
    });

    it('should delete a commentary', async () => {
      jest
        .spyOn(CommentaryService, 'removeCommentary')
        .mockReturnValue(Promise.resolve());

      const commentaryToBeRemoved = await waitFor(() =>
        getByTestId('remove-commentary-1')
      );
      await waitFor(() => fireEvent.press(commentaryToBeRemoved));

      const modal = await waitFor(() => getByTestId('remove-commentary-modal'));
      expect(modal.props.accessibilityValue).toStrictEqual({ text: 'visible' });

      const confirmRemovalButton = await waitFor(() =>
        getByTestId('button-confirm-removal')
      );
      await waitFor(() => fireEvent.press(confirmRemovalButton));

      const toast = await waitFor(() => getByText('removeCommentarySuccess'));
      expect(toast).toBeDefined();
    });

    it('should not delete a commentary if clicking on cancel', async () => {
      jest.spyOn(CommentaryService, 'removeCommentary').mockClear();

      const commentaryToBeRemoved = await waitFor(() =>
        getByTestId('remove-commentary-1')
      );
      await waitFor(() => fireEvent.press(commentaryToBeRemoved));

      const closeModalButton = await waitFor(() =>
        getByTestId('close-remove-commentary-modal-button')
      );
      await waitFor(() => fireEvent.press(closeModalButton));

      expect(CommentaryService.removeCommentary).not.toHaveBeenCalled();
    });

    it('should not delete a commentary if server returns an error', async () => {
      jest
        .spyOn(CommentaryService, 'removeCommentary')
        .mockReturnValue(Promise.reject(new Error('Error')));

      const commentaryToBeRemoved = await waitFor(() =>
        getByTestId('remove-commentary-1')
      );
      await waitFor(() => fireEvent.press(commentaryToBeRemoved));

      const confirmRemovalButton = await waitFor(() =>
        getByTestId('button-confirm-removal')
      );
      await waitFor(() => fireEvent.press(confirmRemovalButton));

      const toast = await waitFor(() => getByText('removeCommentaryFail'));
      expect(toast).toBeDefined();
    });

    it('should add a new private global comentary', async () => {
      jest.spyOn(CommentaryService, 'addGlobalCommentary').mockReturnValue(
        Promise.resolve({
          data: {
            id: 9,
            userId: 1,
            productId: 1,
            content: 'Novo comentário',
            user: user2,
            date: new Date(2021, 2, 11),
            isPublic: true,
          },
        })
      );
      const commentaryTextArea = await waitFor(() =>
        getByTestId('commentary-text-area')
      );
      await waitFor(() => {
        fireEvent.changeText(commentaryTextArea, 'Novo comentário');
      });

      const changeGlobalCheckbox = await waitFor(
        () => getAllByTestId('change-commentary-type-checkbox')[0]
      );
      await waitFor(() => fireEvent.press(changeGlobalCheckbox));

      const addCommentaryButton = await waitFor(() =>
        getByTestId('add-commentary-button')
      );
      await waitFor(() => fireEvent.press(addCommentaryButton));

      const toast = await waitFor(() =>
        getByText('addGlobalCommentarySuccess')
      );
      expect(toast).toBeDefined();
    });

    it('should add a new public global comentary', async () => {
      jest.spyOn(CommentaryService, 'addGlobalCommentary').mockReturnValue(
        Promise.resolve({
          data: {
            id: 9,
            userId: 1,
            productId: 1,
            content: 'Novo comentário',
            user: user2,
            date: new Date(2021, 2, 11),
            isPublic: false,
          },
        })
      );
      const commentaryTextArea = await waitFor(() =>
        getByTestId('commentary-text-area')
      );
      await waitFor(() => {
        fireEvent.changeText(commentaryTextArea, 'Novo comentário');
      });

      const changeGlobalCheckbox = await waitFor(
        () => getAllByTestId('change-commentary-type-checkbox')[0]
      );
      await waitFor(() => fireEvent.press(changeGlobalCheckbox));

      const changeVisibilityCheckbox = await waitFor(
        () => getAllByTestId('change-commentary-visibility-checkbox')[0]
      );
      await waitFor(() => fireEvent.press(changeVisibilityCheckbox));

      const addCommentaryButton = await waitFor(() =>
        getByTestId('add-commentary-button')
      );
      await waitFor(() => fireEvent.press(addCommentaryButton));

      const toast = await waitFor(() =>
        getByText('addGlobalCommentarySuccess')
      );
      expect(toast).toBeDefined();
    });

    it('should not add a new global comentary if it is empty', async () => {
      jest.spyOn(CommentaryService, 'addGlobalCommentary').mockClear();

      const commentaryTextArea = await waitFor(() =>
        getByTestId('commentary-text-area')
      );
      await waitFor(() => {
        fireEvent.changeText(commentaryTextArea, ' ');
      });

      const changeGlobalCheckbox = await waitFor(
        () => getAllByTestId('change-commentary-type-checkbox')[0]
      );
      await waitFor(() => fireEvent.press(changeGlobalCheckbox));

      const addCommentaryButton = await waitFor(() =>
        getByTestId('add-commentary-button')
      );
      await waitFor(() => fireEvent.press(addCommentaryButton));

      expect(CommentaryService.addCommentary).not.toHaveBeenCalled();
    });

    it('should not add a new global comentary if server returns an error', async () => {
      jest
        .spyOn(CommentaryService, 'addGlobalCommentary')
        .mockReturnValue(Promise.reject(new Error('Error')));

      const commentaryTextArea = await waitFor(() =>
        getByTestId('commentary-text-area')
      );
      await waitFor(() => {
        fireEvent.changeText(commentaryTextArea, 'Novo comentário');
      });

      const changeGlobalCheckbox = await waitFor(
        () => getAllByTestId('change-commentary-type-checkbox')[0]
      );
      await waitFor(() => fireEvent.press(changeGlobalCheckbox));

      const addCommentaryButton = await waitFor(() =>
        getByTestId('add-commentary-button')
      );
      await waitFor(() => fireEvent.press(addCommentaryButton));

      const toast = await waitFor(() => getByText('addGlobalCommentaryFail'));
      expect(toast).toBeDefined();
    });

    it('should delete a global commentary', async () => {
      jest
        .spyOn(CommentaryService, 'removeGlobalCommentary')
        .mockReturnValue(Promise.resolve());

      const commentaryToBeRemoved = await waitFor(() =>
        getByTestId('remove-global-commentary-5')
      );
      await waitFor(() => fireEvent.press(commentaryToBeRemoved));

      const modal = await waitFor(() => getByTestId('remove-commentary-modal'));
      expect(modal.props.accessibilityValue).toStrictEqual({ text: 'visible' });

      const confirmRemovalButton = await waitFor(() =>
        getByTestId('button-confirm-removal')
      );
      await waitFor(() => fireEvent.press(confirmRemovalButton));

      const toast = await waitFor(() =>
        getByText('removeGlobalCommentarySuccess')
      );
      expect(toast).toBeDefined();
    });

    it('should not delete a global commentary if clicking on cancel', async () => {
      jest.spyOn(CommentaryService, 'removeGlobalCommentary').mockClear();

      const commentaryToBeRemoved = await waitFor(() =>
        getByTestId('remove-global-commentary-5')
      );
      await waitFor(() => fireEvent.press(commentaryToBeRemoved));

      const closeModalButton = await waitFor(() =>
        getByTestId('close-remove-commentary-modal-button')
      );
      await waitFor(() => fireEvent.press(closeModalButton));

      expect(CommentaryService.removeGlobalCommentary).not.toHaveBeenCalled();
    });

    it('should not delete a global commentary if server returns an error', async () => {
      jest
        .spyOn(CommentaryService, 'removeGlobalCommentary')
        .mockReturnValue(Promise.reject(new Error('Error')));

      const commentaryToBeRemoved = await waitFor(() =>
        getByTestId('remove-global-commentary-5')
      );
      await waitFor(() => fireEvent.press(commentaryToBeRemoved));

      const confirmRemovalButton = await waitFor(() =>
        getByTestId('button-confirm-removal')
      );
      await waitFor(() => fireEvent.press(confirmRemovalButton));

      const toast = await waitFor(() =>
        getByText('removeGlobalCommentaryFail')
      );
      expect(toast).toBeDefined();
    });
  });

  describe('when it is not possible to get preference order', () => {
    let getByTestId, getByText;
    let user;

    beforeEach(() => {
      const route = {
        params: {
          product: {
            productId: 1,
            id: 1,
          },
        },
      };

      user = {
        id: 1,
        name: 'Fulano',
        username: 'fulanodetal',
        email: 'fulanodetal@gmail.com',
        preferences: {
          globalCommentsChronOrder: null,
          olderCommentsFirst: null
        }
      };

      user2 = {
        id: 2,
        name: 'Ciclano',
        username: 'ciclanodetal',
        email: 'ciclanodetal@gmail.com',
      };

      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn()),
      };

      jest
        .spyOn(ProductOfListService, 'getProductOfListComments')
        .mockReturnValue(Promise.reject());

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
                  <CommentaryScreen route={route} />
                </NavigationContext.Provider>
              }
            />
          </SafeAreaProvider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
    });

    it('should show toast warning user it was not possible to fetch commentaries', async () => {
      const toast = await waitFor(() =>
        getByText('couldntFetchCommentaries')
      );
      expect(toast).toBeDefined();
    });
  });
});
