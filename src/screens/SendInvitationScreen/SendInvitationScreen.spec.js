import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-dom';
import { NativeBaseProvider } from 'native-base';
import { NavigationContext } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import SendInvitationScreen from './SendInvitationScreen';
import ListMembersService from '../../services/ListMembersService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('SendInvitationScreen component', () => {
  let getByTestId, getByText;
  let navigationSpy;
  let user;
  let sendInvitationButton;

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
        list: {
          id: 1,
          nameList: 'Lista 01',
        },
      },
    };

    user = {
      name: 'Fulano',
      username: 'fulanodetal',
    };

    const navContext = {
      isFocused: () => true,
      // addListener returns an unscubscribe function.
      addListener: jest.fn(() => jest.fn()),
    };

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
            lists: [
              {
                id: 1,
                nameList: 'Lista 01',
              },
              {
                id: 2,
                nameList: 'Lista 02',
              },
            ],
          }}
        >
          <SafeAreaProvider
            initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <NativeBaseProvider
              children={
                <NavigationContext.Provider value={navContext}>
                  <SendInvitationScreen navigation={navigation} route={route} />
                </NavigationContext.Provider>
              }
            />
          </SafeAreaProvider>
        </ListContext.Provider>
      </AuthContext.Provider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
    sendInvitationButton = getByTestId('send-invitation-button');
  });

  describe('Select list field', () => {
    it('should change select list value', async () => {
      const selectList = getByTestId('select-list');

      await waitFor(() => {
        fireEvent(selectList, 'valueChange', 2);
      });
      expect(selectList.props.value).toBe('Lista 02');
    });
  });

  describe('Username field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(sendInvitationButton);
      });

      const usernameError = getByTestId('error-invitation-username-or-email');
      expect(usernameError.props.children).toBe('requiredField');
    });

    it('should not show required field error when it is filled properly', async () => {
      const usernameInput = getByTestId('invitation-username-or-email');

      await waitFor(() => fireEvent.changeText(usernameInput, 'usuariobacana'));
      await waitFor(() => fireEvent.press(sendInvitationButton));

      const usernameError = getByTestId('error-invitation-username-or-email');

      expect(usernameError.props.children).toBeUndefined();
    });
  });

  describe('when form is properly filled', () => {
    it(
      'should show error when trying to send an invite to a user who already' +
        ' received an invite',
      async () => {
        const registerSpy = jest.spyOn(ListMembersService, 'sendInvite');
        registerSpy.mockReturnValue(
          Promise.reject({
            response: {
              status: 409,
            },
          })
        );

        await waitFor(() => {
          fireEvent.changeText(
            getByTestId('invitation-username-or-email'),
            'ciclanodetal'
          );
        });
        await waitFor(() => fireEvent.press(sendInvitationButton));

        const toast = getByText('repeatedInvitation');
        expect(toast).toBeDefined();
      }
    );

    it('should successfully send an email to non registered user', async () => {
      const registerSpy = jest.spyOn(ListMembersService, 'sendInvite');
      registerSpy.mockReturnValue(
        Promise.reject({
          response: {
            status: 404,
          },
        })
      );

      await waitFor(() => {
        fireEvent.changeText(
          getByTestId('invitation-username-or-email'),
          'ciclanodetal'
        );
      });
      await waitFor(() => fireEvent.press(sendInvitationButton));

      expect(
        getByTestId('invite-to-platform-modal').props.accessibilityValue
      ).toStrictEqual({ text: 'visible' });

      jest.spyOn(ListMembersService, 'inviteToThePlatform').mockReturnValue(Promise.resolve());

      await waitFor(() => {
        fireEvent.changeText(
          getByTestId('invite-to-platform-email-input'),
          'ciclano@tal.com'
        );
      });

      const confirmSendInvitation = await waitFor(() =>
        getByTestId('button-confirm-send-invitation')
      );

      await waitFor(() => fireEvent.press(confirmSendInvitation));

      const toast = getByText('sentEmail');
      expect(toast).toBeDefined();
    });

    it('should not send email if user is registered and invite to the platform modal was called', async () => {
      const registerSpy = jest.spyOn(ListMembersService, 'sendInvite');
      registerSpy.mockReturnValueOnce(
        Promise.reject({
          response: {
            status: 404,
          },
        })
      );

      await waitFor(() => {
        fireEvent.changeText(
          getByTestId('invitation-username-or-email'),
          'ciclanodetal'
        );
      });
      await waitFor(() => fireEvent.press(sendInvitationButton));

      expect(
        getByTestId('invite-to-platform-modal').props.accessibilityValue
      ).toStrictEqual({ text: 'visible' });

      jest.spyOn(ListMembersService, 'inviteToThePlatform').mockReturnValue(Promise.reject({
        response: {
          status: 409
        }
      }));

      registerSpy.mockReturnValueOnce(
        Promise.resolve()
      );

      await waitFor(() => {
        fireEvent.changeText(
          getByTestId('invite-to-platform-email-input'),
          'ciclano@tal.com'
        );
      });

      const confirmSendInvitation = await waitFor(() =>
        getByTestId('button-confirm-send-invitation')
      );

      await waitFor(() => fireEvent.press(confirmSendInvitation));

      const toastTitle = getByText('userAlreadyOnPlatform');
      expect(toastTitle).toBeDefined();
      const toastDescription = getByText('weSentAnInviteToThem')
      expect(toastDescription).toBeDefined();
    });

    it('should show error when when server returns default error', async () => {
      const registerSpy = jest.spyOn(ListMembersService, 'sendInvite');
      registerSpy.mockReturnValue(
        Promise.reject({
          response: {
            status: 500,
          },
        })
      );

      await waitFor(() => {
        fireEvent.changeText(
          getByTestId('invitation-username-or-email'),
          'ciclanodetal'
        );
      });
      await waitFor(() => fireEvent.press(sendInvitationButton));

      const toast = getByText('errorServerDefault');
      expect(toast).toBeDefined();
    });

    it('should show success message when sendInvite method is resolved', async () => {
      const registerSpy = jest.spyOn(ListMembersService, 'sendInvite');
      registerSpy.mockReturnValue(Promise.resolve());

      await waitFor(() => {
        fireEvent.changeText(
          getByTestId('invitation-username-or-email'),
          'ciclanodetal'
        );
      });
      await waitFor(() => fireEvent.press(sendInvitationButton));

      const toast = getByText('invitationSent');
      expect(toast).toBeDefined();
    });

    it('should show success message when sendInvite method is resolved', async () => {
      await waitFor(() => {
        fireEvent.changeText(
          getByTestId('invitation-username-or-email'),
          'fulanodetal'
        );
      });
      await waitFor(() => fireEvent.press(sendInvitationButton));

      const toast = getByText('invitationToYourself');
      expect(toast).toBeDefined();
    });
  });
});
