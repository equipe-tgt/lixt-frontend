import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-dom';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ForgotPasswordScreen from './ForgotPasswordScreen';
import UserService from '../../services/UserService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('ForgotPasswordScreen component', () => {
  let getByTestId, getByText;
  let forgotPasswordButton;
  let navigationSpy;

  beforeEach(() => {
    const navigation = {
      navigate: jest.fn((path) => path),
    };
    navigationSpy = jest.spyOn(navigation, 'navigate');

    const renderResults = render(
      <SafeAreaProvider
        initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <NativeBaseProvider
          children={<ForgotPasswordScreen navigation={navigation} />}
        />
      </SafeAreaProvider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
    forgotPasswordButton = getByTestId('forgot-password-button');
  });

  describe('Email field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(forgotPasswordButton);
      });

      const emailError = getByTestId('error-forgot-password-email');
      expect(emailError.props.children).toBe('requiredField');
    });

    it('should show email invalid message when it is filled with an invalid email', async () => {
      const emailInput = getByTestId('forgot-password-email');

      await waitFor(() => fireEvent.changeText(emailInput, 'fulano.tal.com'));
      await waitFor(() => fireEvent.press(forgotPasswordButton));

      const emailError = getByTestId('error-forgot-password-email');

      expect(emailError.props.children).toBe('invalidEmail');
    });

    it('should show max length error when it has more than 120 characters', async () => {
      const emailInput = getByTestId('forgot-password-email');

      await waitFor(() =>
        fireEvent.changeText(
          emailInput,
          'really.really.really.really.really.really.really.really.really.really.really.really.really.really.really.long.email@gmail.com'
        )
      );
      await waitFor(() => fireEvent.press(forgotPasswordButton));

      const emailError = getByTestId('error-forgot-password-email');

      expect(emailError.props.children).toBe('fieldMaxChars');
    });

    it('should not show required field error when it is filled properly', async () => {
      const emailInput = getByTestId('forgot-password-email');

      await waitFor(() =>
        fireEvent.changeText(emailInput, 'fulano.de.tal@gmail.com')
      );
      await waitFor(() => fireEvent.press(forgotPasswordButton));

      const emailError = getByTestId('error-forgot-password-email');

      expect(emailError.props.children).toBeUndefined();
    });
  });

  describe('when form is properly filled', () => {
    it('should show error when email provided is not registed in the platform', async () => {
      const registerSpy = jest.spyOn(UserService, 'resetPassword');
      registerSpy.mockReturnValue(
        Promise.reject({
          response: {
            status: 404,
          },
        })
      );

      const emailInput = getByTestId('forgot-password-email');

      await waitFor(() =>
        fireEvent.changeText(emailInput, 'fulano.de.tal@gmail.com')
      );
      await waitFor(() => fireEvent.press(forgotPasswordButton));

      const toast = getByText('userDoesntExists');
      expect(toast).toBeDefined();
    });

    it('should show error when server returns default error', async () => {
      const registerSpy = jest.spyOn(UserService, 'resetPassword');
      registerSpy.mockReturnValue(
        Promise.reject({
          response: {
            data: 'Erro no servidor',
          },
        })
      );

      const emailInput = getByTestId('forgot-password-email');

      await waitFor(() =>
        fireEvent.changeText(emailInput, 'fulano.de.tal@gmail.com')
      );
      await waitFor(() => fireEvent.press(forgotPasswordButton));

      const toast = getByText('errorServerDefault');
      expect(toast).toBeDefined();
    });

    it('should redirect to the login page when request for password is concluded successfully', async () => {
      const registerSpy = jest.spyOn(UserService, 'resetPassword');
      registerSpy.mockReturnValue(Promise.resolve());

      const emailInput = getByTestId('forgot-password-email');

      await waitFor(() =>
        fireEvent.changeText(emailInput, 'fulano.de.tal@gmail.com')
      );
      await waitFor(() => fireEvent.press(forgotPasswordButton));

      const toast = getByText('emailSuccessfullySend');
      expect(toast).toBeDefined();
      expect(navigationSpy).toHaveBeenCalledWith('Login');
    });
  });

  it('should go to Login page when clicking on the login link', async () => {
    const backToLogin = getByText('backToLoginScreen');

    await waitFor(() => fireEvent.press(backToLogin));

    expect(navigationSpy).toHaveBeenCalledWith('Login');
  });
});
