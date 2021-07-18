import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-dom';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthProvider';
import LoginScreen from './LoginScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('LoginScreen component', () => {
  let getByTestId, getByText;
  let loginButton;
  let navigationSpy;
  let loginFn;

  beforeEach(() => {
    const navigation = {
      navigate: jest.fn((path) => path),
    };
    navigationSpy = jest.spyOn(navigation, 'navigate');

    const user = {};
    loginFn = jest.fn();

    const renderResults = render(
      <AuthContext.Provider
        value={{
          user,
          login: loginFn,
          logout: () => {},
        }}
      >
        <SafeAreaProvider
          initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <NativeBaseProvider
            children={<LoginScreen navigation={navigation} />}
          />
        </SafeAreaProvider>
      </AuthContext.Provider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
    loginButton = getByTestId('login-button');
  });

  describe('Username field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(loginButton);
      });

      const usernameError = getByTestId('error-login-email-or-username');
      expect(usernameError.props.children).toBe('requiredField');
    });

    it('should not show required field error when it is filled properly', async () => {
      const usernameInput = getByTestId('login-email-or-username');

      await waitFor(() => fireEvent.changeText(usernameInput, 'usuariobacana'));
      await waitFor(() => fireEvent.press(loginButton));

      const usernameError = getByTestId('error-login-email-or-username');

      expect(usernameError.props.children).toBeUndefined();
    });
  });

  describe('Password field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(loginButton);
      });

      const passwordError = getByTestId('error-login-password');

      expect(passwordError.props.children).toBe('requiredField');
    });

    it('should show max length error when it have more than 20 characters', async () => {
      const passwordInput = getByTestId('login-password');

      await waitFor(() =>
        fireEvent.changeText(passwordInput, 'senhamuitolongaegigante')
      );
      await waitFor(() => fireEvent.press(loginButton));

      const passwordError = getByTestId('error-login-password');

      expect(passwordError.props.children).toBe('longPassword');
    });

    it('should not show required field error when it is filled properly', async () => {
      const passwordInput = getByTestId('login-password');

      await waitFor(() => fireEvent.changeText(passwordInput, '123456789'));
      await waitFor(() => fireEvent.press(loginButton));

      const passwordInputError = getByTestId('error-login-password');

      expect(passwordInputError.props.children).toBeUndefined();
    });
  });

  describe('when form is properly filled', () => {
    it(
      'should show incorrect data error when backend returns 401 code when' +
        ' clicking to login',
      async () => {
        loginFn.mockReturnValue(
          Promise.reject({
            response: {
              status: 401,
            },
          })
        );

        await waitFor(() => {
          fireEvent.changeText(
            getByTestId('login-email-or-username'),
            'fulanodetal'
          );
          fireEvent.changeText(getByTestId('login-password'), '12345678');
        });
        await waitFor(() => fireEvent.press(loginButton));

        const toast = getByText('incorrectData');
        expect(toast).toBeDefined();
      }
    );

    it(
      'should show incorrect data error when backend returns 400 code when' +
        ' clicking to login',
      async () => {
        loginFn.mockReturnValue(
          Promise.reject({
            response: {
              status: 400,
            },
          })
        );

        await waitFor(() => {
          fireEvent.changeText(
            getByTestId('login-email-or-username'),
            'fulanodetal'
          );
          fireEvent.changeText(getByTestId('login-password'), '12345678');
        });
        await waitFor(() => fireEvent.press(loginButton));

        const toast = getByText('incorrectData');
        expect(toast).toBeDefined();
      }
    );

    it('should show error when server returns default error', async () => {
      loginFn.mockReturnValue(
        Promise.reject({
          response: {
            status: 500,
            data: 'Erro no servidor',
          },
        })
      );

      await waitFor(() => {
        fireEvent.changeText(
          getByTestId('login-email-or-username'),
          'fulanodetal'
        );
        fireEvent.changeText(getByTestId('login-password'), '12345678');
      });
      await waitFor(() => fireEvent.press(loginButton));

      const toast = getByText('errorServerDefault');
      expect(toast).toBeDefined();
    });
  });

  it('should go to Register page when clicking on the register link', async () => {
    const registerLink = getByText('signIn');

    await waitFor(() => fireEvent.press(registerLink));

    expect(navigationSpy).toHaveBeenCalledWith('Register');
  });

  it('should go to Forgot Password page when clicking on the forgot password link', async () => {
    const forgotPasswordLink = getByText('forgotPassword');

    await waitFor(() => fireEvent.press(forgotPasswordLink));

    expect(navigationSpy).toHaveBeenCalledWith('ForgotPassword');
  });
});
