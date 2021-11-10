import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CommentaryScreen from './CommentaryScreen';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import { NavigationContext } from '@react-navigation/native';
import CommentaryService from '../../services/CommentaryService';
import AuthService from '../../services/AuthService';
import ProductOfListService from '../../services/ProductOfListService';

jest.useFakeTimers();
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

const Component = ({ user, navContext, route }) => {
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
};

describe('CommentaryScreen component', () => {
  let getByTestId, getByText;
  let user, user2;

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
        globalCommentsChronOrder: true,
      };

      user2 = {
        id: 2,
        name: 'Ciclano',
        username: 'ciclanodetal',
        email: 'ciclanodetal@gmail.com',
        globalCommentsChronOrder: false,
      };

      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn()),
      };

      jest.spyOn(AuthService, 'getUserData').mockReturnValue(
        Promise.resolve({
          data: {
            globalCommentsChronOrder: true,
          },
        })
      );
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

      const renderResults = render(
        <Component user={user} navContext={navContext} route={route} />
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
    });

    it('should render', () => {
      expect(true).toBe(true);
    });

    it('should not change order to date', async () => {
      const settingsButton = getByTestId('settings-button');
      // const settingsButton = getByTestId("settings-button");
      // const orderByDateButton = getByTestId("order-by-date-button");
    });

    // it("should change order to user", () => {
    //   getByTestId("order-by-user-button");
    // });

    // it('should render', async () => {
    //   const addCommentaryButton = getByTestId("add-commentary-button");

    //   await waitFor(() => {
    //     fireEvent.press(addCommentaryButton);
    //   });
    // });
  });

  // describe('when preference order is by user', () => {
  //   let getByTestId, getByText;
  //   let user;

  //   beforeEach(() => {
  //     const route = {
  //       params: {
  //         product: {
  //           productId: 1
  //         }
  //       },
  //     };

  //     user = {
  //       id: 1,
  //       name: 'Fulano',
  //       username: 'fulanodetal',
  //       email: "fulanodetal@gmail.com",
  //       globalCommentsChronOrder: true,
  //     };

  //     user2 = {
  //       id: 2,
  //       name: "Ciclano",
  //       username: "ciclanodetal",
  //       email: "ciclanodetal@gmail.com",
  //       globalCommentsChronOrder: false
  //     };

  //     const navContext = {
  //       isFocused: () => true,
  //       // addListener returns an unscubscribe function.
  //       addListener: jest.fn(() => jest.fn()),
  //     };

  //     jest
  //       .spyOn(AuthService, 'getUserData')
  //       .mockReturnValue(Promise.resolve({
  //         data: {
  //           globalCommentsChronOrder: false
  //         }
  //       }));
  //     jest
  //       .spyOn(ProductOfListService, 'getProductOfListComments')
  //       .mockReturnValue(Promise.resolve({
  //         data: {
  //           commentsDto: [{
  //             id: 1,
  //             userId: 1,
  //             productOfListId: 1,
  //             content: "Primeiro comentário",
  //             user: user,
  //             date: new Date(2021, 1, 16)
  //           }, {
  //             id: 2,
  //             userId: 2,
  //             productOfListId: 1,
  //             content: "Segundo comentário",
  //             user: user2,
  //             date: new Date(2021, 2, 21)
  //           }, {
  //             id: 3,
  //             userId: 1,
  //             productOfListId: 1,
  //             content: "Terceiro comentário",
  //             user: user,
  //             date: new Date(2021, 1, 10)
  //           }, {
  //             id: 4,
  //             userId: 2,
  //             productOfListId: 1,
  //             content: "Quarto comentário",
  //             user: user,
  //             date: new Date(2021, 5, 10)
  //           }],
  //           globalCommentsDto: [{
  //             id: 5,
  //             userId: 1,
  //             productId: 1,
  //             content: "Primeiro comentário global",
  //             user: user,
  //             date: new Date(2021, 3, 6),
  //             isPublic: true
  //           }, {
  //             id: 6,
  //             userId: 2,
  //             productId: 1,
  //             content: "Segundo comentário global",
  //             user: user2,
  //             date: new Date(2021, 2, 2),
  //             isPublic: true
  //           }, {
  //             id: 7,
  //             userId: 2,
  //             productId: 1,
  //             content: "Terceiro comentário global",
  //             user: user2,
  //             date: new Date(2021, 5, 10),
  //             isPublic: false
  //           }, {
  //             id: 8,
  //             userId: 1,
  //             productId: 1,
  //             content: "Quarto comentário global",
  //             user: user2,
  //             date: new Date(2021, 2, 10),
  //             isPublic: false
  //           }]
  //         }
  //       }));

  //     const renderResults = render(<Component user={user} navContext={navContext} route={route} />);

  //     getByTestId = renderResults.getByTestId;
  //     getByText = renderResults.getByText;
  //   });

  //   it('should render', () => {
  //     expect(true).toBe(true);
  //   });
  // });

  // describe('when it is not possible to get preference order', () => {
  //   let getByTestId, getByText;
  //   let user;

  //   beforeEach(() => {
  //     const route = {
  //       params: {
  //         product: {
  //           productId: 1
  //         }
  //       },
  //     };

  //     user = {
  //       id: 1,
  //       name: 'Fulano',
  //       username: 'fulanodetal',
  //       email: "fulanodetal@gmail.com",
  //       globalCommentsChronOrder: true,
  //     };

  //     user2 = {
  //       id: 2,
  //       name: "Ciclano",
  //       username: "ciclanodetal",
  //       email: "ciclanodetal@gmail.com",
  //       globalCommentsChronOrder: false
  //     };

  //     const navContext = {
  //       isFocused: () => true,
  //       // addListener returns an unscubscribe function.
  //       addListener: jest.fn(() => jest.fn()),
  //     };

  //     jest
  //       .spyOn(AuthService, 'getUserData')
  //       .mockReturnValue(Promise.reject());
  //     jest
  //       .spyOn(ProductOfListService, 'getProductOfListComments')
  //       .mockReturnValue(Promise.reject());

  //     const renderResults = render(<Component user={user} navContext={navContext} route={route} />);

  //     getByTestId = renderResults.getByTestId;
  //     getByText = renderResults.getByText;
  //   });

  //   it('should render', () => {
  //     expect(true).toBe(true);
  //   });
  // });
});
