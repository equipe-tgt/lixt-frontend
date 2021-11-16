import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-dom';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RegisterScreen from './RegisterScreen';
import UserService from '../../services/UserService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('RegisterScreen component', () => {
  let getByTestId, getByText;
  let registerButton;
  let navigationSpy;

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

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
          children={<RegisterScreen navigation={navigation} />}
        />
      </SafeAreaProvider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
    registerButton = getByTestId('register-button');
  });

  describe('Name field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(registerButton);
      });

      const nameError = getByTestId('error-register-name');
      expect(nameError.props.children).toBe('requiredField');
    });

    it('should show max length error when it has more than 45 characters', async () => {
      const nameInput = getByTestId('register-name');

      await waitFor(() =>
        fireEvent.changeText(
          nameInput,
          'Este texto deve ter mais de quarenta e cinco caracteres'
        )
      );
      await waitFor(() => fireEvent.press(registerButton));

      const nameError = getByTestId('error-register-name');

      expect(nameError.props.children).toBe('fieldMaxChars');
    });

    it('should not show required field error when it is filled', async () => {
      const nameInput = getByTestId('register-name');

      await waitFor(() => fireEvent.changeText(nameInput, 'Fulano de Tal'));
      await waitFor(() => fireEvent.press(registerButton));

      const nameError = getByTestId('error-register-name');

      expect(nameError.props.children).toBeUndefined();
    });
  });

  describe('Email field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(registerButton);
      });

      const emailError = getByTestId('error-register-email');
      expect(emailError.props.children).toBe('requiredField');
    });

    it('should show email invalid message when it is filled with an invalid email', async () => {
      const emailInput = getByTestId('register-email');

      await waitFor(() => fireEvent.changeText(emailInput, 'fulano.tal.com'));
      await waitFor(() => fireEvent.press(registerButton));

      const emailError = getByTestId('error-register-email');

      expect(emailError.props.children).toBe('invalidEmail');
    });

    it('should show max length error when it has more than 120 characters', async () => {
      const emailInput = getByTestId('register-email');

      await waitFor(() =>
        fireEvent.changeText(
          emailInput,
          'really.really.really.really.really.really.really.really.really.really.really.really.really.really.really.long.email@gmail.com'
        )
      );
      await waitFor(() => fireEvent.press(registerButton));

      const emailError = getByTestId('error-register-email');

      expect(emailError.props.children).toBe('fieldMaxChars');
    });

    it('should not show required field error when it is filled properly', async () => {
      const emailInput = getByTestId('register-email');

      await waitFor(() =>
        fireEvent.changeText(emailInput, 'fulano.de.tal@gmail.com')
      );
      await waitFor(() => fireEvent.press(registerButton));

      const emailError = getByTestId('error-register-email');

      expect(emailError.props.children).toBeUndefined();
    });
  });

  describe('Username field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(registerButton);
      });

      const usernameError = getByTestId('error-register-username');
      expect(usernameError.props.children).toBe('requiredField');
    });

    it('should show max length error when it has more than 45 characters', async () => {
      const usernameInput = getByTestId('register-username');

      await waitFor(() =>
        fireEvent.changeText(
          usernameInput,
          'usuarioextremamentemuitograndemesmogigantemente'
        )
      );
      await waitFor(() => fireEvent.press(registerButton));

      const usernameError = getByTestId('error-register-username');

      expect(usernameError.props.children).toBe('fieldMaxChars');
    });

    it('should not show required field error when it is filled properly', async () => {
      const usernameInput = getByTestId('register-username');

      await waitFor(() => fireEvent.changeText(usernameInput, 'usuariobacana'));
      await waitFor(() => fireEvent.press(registerButton));

      const usernameError = getByTestId('error-register-username');

      expect(usernameError.props.children).toBeUndefined();
    });
  });

  describe('Password field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(registerButton);
      });

      const passwordError = getByTestId('error-register-password');

      expect(passwordError.props.children).toBe('requiredField');
    });

    it('should show max length error when it have more than 20 characters', async () => {
      const passwordInput = getByTestId('register-password');

      await waitFor(() =>
        fireEvent.changeText(passwordInput, 'senhamuitolongaegigante')
      );
      await waitFor(() => fireEvent.press(registerButton));

      const passwordError = getByTestId('error-register-password');

      expect(passwordError.props.children).toBe('longPassword');
    });

    it('should show min length error when it have less than 8 characters', async () => {
      const passwordInput = getByTestId('register-password');

      await waitFor(() => fireEvent.changeText(passwordInput, '123'));
      await waitFor(() => fireEvent.press(registerButton));

      const passwordError = getByTestId('error-register-password');

      expect(passwordError.props.children).toBe('passwordMinLength');
    });

    it('should not show required field error when it is filled properly', async () => {
      const passwordInput = getByTestId('register-password');

      await waitFor(() => fireEvent.changeText(passwordInput, '123456789'));
      await waitFor(() => fireEvent.press(registerButton));

      const passwordInputError = getByTestId('error-register-password');

      expect(passwordInputError.props.children).toBeUndefined();
    });
  });

  describe('Confirm Password field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(registerButton);
      });

      const confirmPasswordError = getByTestId(
        'error-register-confirm-password'
      );

      expect(confirmPasswordError.props.children).toBe('requiredField');
    });

    it("should show passwords doesn't match error when passwords are not equal", async () => {
      const passwordInput = getByTestId('register-password');
      const confirmPasswordInput = getByTestId('register-confirm-password');

      await waitFor(() => {
        fireEvent.changeText(passwordInput, '123456789');
        fireEvent.changeText(confirmPasswordInput, '12345678910101010');
      });
      await waitFor(() => fireEvent.press(registerButton));

      const passwordError = getByTestId('error-register-password');
      const confirmPasswordError = getByTestId(
        'error-register-confirm-password'
      );

      expect(passwordError.props.children).toBeUndefined();
      expect(confirmPasswordError.props.children).toBe('passwordsDontMatch');
    });
  });

  describe('when form is properly filled', () => {
    it('should show error when trying to register an already taken email', async () => {
      const registerSpy = jest.spyOn(UserService, 'doRegister');
      registerSpy.mockReturnValue(
        Promise.reject({
          response: {
            data: 'Email já cadastrado na plataforma',
          },
        })
      );

      await waitFor(() => {
        fireEvent.changeText(getByTestId('register-name'), 'Fulano de Tal');
        fireEvent.changeText(
          getByTestId('register-email'),
          'fulano.de.tal@gmail.com'
        );
        fireEvent.changeText(getByTestId('register-username'), 'fulanodetal');
        fireEvent.changeText(getByTestId('register-password'), '12345678');
        fireEvent.changeText(
          getByTestId('register-confirm-password'),
          '12345678'
        );
      });
      await waitFor(() => fireEvent.press(registerButton));

      const toast = getByText('emailAlreadyTaken');
      expect(toast).toBeDefined();
    });

    it('should show error when trying to register an already taken username', async () => {
      const registerSpy = jest.spyOn(UserService, 'doRegister');
      registerSpy.mockReturnValue(
        Promise.reject({
          response: {
            data: 'Usuário já cadastrado na plataforma',
          },
        })
      );

      await waitFor(() => {
        fireEvent.changeText(getByTestId('register-name'), 'Fulano de Tal');
        fireEvent.changeText(
          getByTestId('register-email'),
          'fulano.de.tal@gmail.com'
        );
        fireEvent.changeText(getByTestId('register-username'), 'fulanodetal');
        fireEvent.changeText(getByTestId('register-password'), '12345678');
        fireEvent.changeText(
          getByTestId('register-confirm-password'),
          '12345678'
        );
      });
      await waitFor(() => fireEvent.press(registerButton));

      const toast = getByText('usernameAlreadyTaken');
      expect(toast).toBeDefined();
    });

    it('should show error when server returns default error', async () => {
      const registerSpy = jest.spyOn(UserService, 'doRegister');
      registerSpy.mockReturnValue(
        Promise.reject({
          response: {
            data: 'Erro no servidor',
          },
        })
      );

      await waitFor(() => {
        fireEvent.changeText(getByTestId('register-name'), 'Fulano de Tal');
        fireEvent.changeText(
          getByTestId('register-email'),
          'fulano.de.tal@gmail.com'
        );
        fireEvent.changeText(getByTestId('register-username'), 'fulanodetal');
        fireEvent.changeText(getByTestId('register-password'), '12345678');
        fireEvent.changeText(
          getByTestId('register-confirm-password'),
          '12345678'
        );
      });
      await waitFor(() => fireEvent.press(registerButton));

      const toast = getByText('errorServerDefault');
      expect(toast).toBeDefined();
    });

    it('should redirect to the login page when register is concluded successfully', async () => {
      const registerSpy = jest.spyOn(UserService, 'doRegister');
      registerSpy.mockReturnValue(Promise.resolve());

      await waitFor(() => {
        fireEvent.changeText(getByTestId('register-name'), 'Fulano de Tal');
        fireEvent.changeText(
          getByTestId('register-email'),
          'fulano.de.tal@gmail.com'
        );
        fireEvent.changeText(getByTestId('register-username'), 'fulanodetal');
        fireEvent.changeText(getByTestId('register-password'), '12345678');
        fireEvent.changeText(
          getByTestId('register-confirm-password'),
          '12345678'
        );
      });
      await waitFor(() => fireEvent.press(registerButton));

      expect(navigationSpy).toHaveBeenCalledWith('Login');
    });
  });

  it('should go to Login page when clicking on the login link', async () => {
    const loginLink = getByText('doLogin');

    await waitFor(() => fireEvent.press(loginLink));

    expect(navigationSpy).toHaveBeenCalledWith('Login');
  });
});
