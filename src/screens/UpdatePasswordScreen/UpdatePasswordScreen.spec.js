import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import UserService from '../../services/UserService';
import UpdatePassword from './UpdatePasswordScreen';
import { AuthContext } from '../../context/AuthProvider';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('UpdatePasswordScreen component', () => {
  let getByTestId, getByText;
  let updateButton;
  let navigationSpy;
  let user;

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  beforeEach(() => {
    const navigation = {
      navigate: jest.fn((path) => path),
    };
    navigationSpy = jest.spyOn(navigation, 'navigate');

    user = {};

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
            children={<UpdatePassword navigation={navigation} />}
          />
        </SafeAreaProvider>
      </AuthContext.Provider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
    updateButton = getByTestId('update-button');
  });

  describe('Password field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(updateButton);
      });

      const passwordError = getByTestId('error-update-password');

      expect(passwordError.props.children).toBe('requiredField');
    });

    it('should show max length error when it have more than 20 characters', async () => {
      const passwordInput = getByTestId('update-password');

      await waitFor(() =>
        fireEvent.changeText(passwordInput, 'senhamuitolongaegigante')
      );
      await waitFor(() => fireEvent.press(updateButton));

      const passwordError = getByTestId('error-update-password');

      expect(passwordError.props.children).toBe('longPassword');
    });

    it('should show min length error when it have less than 8 characters', async () => {
      const passwordInput = getByTestId('update-password');

      await waitFor(() => fireEvent.changeText(passwordInput, '123'));
      await waitFor(() => fireEvent.press(updateButton));

      const passwordError = getByTestId('error-update-password');

      expect(passwordError.props.children).toBe('passwordMinLength');
    });

    it('should not show required field error when it is filled properly', async () => {
      const passwordInput = getByTestId('update-password');

      await waitFor(() => fireEvent.changeText(passwordInput, '123456789'));
      await waitFor(() => fireEvent.press(updateButton));

      const passwordInputError = getByTestId('error-update-password');

      expect(passwordInputError.props.children).toBeUndefined();
    });
  });

  describe('Confirm Password field', () => {
    it('should show required field error when it is empty', async () => {
      await waitFor(() => {
        fireEvent.press(updateButton);
      });

      const confirmPasswordError = getByTestId('error-update-confirm-password');

      expect(confirmPasswordError.props.children).toBe('requiredField');
    });

    it("should show passwords doesn't match error when passwords are not equal", async () => {
      const passwordInput = getByTestId('update-password');
      const confirmPasswordInput = getByTestId('update-confirm-password');

      await waitFor(() => {
        fireEvent.changeText(passwordInput, '123456789');
        fireEvent.changeText(confirmPasswordInput, '12345678910101010');
      });
      await waitFor(() => fireEvent.press(updateButton));

      const passwordError = getByTestId('error-update-password');
      const confirmPasswordError = getByTestId('error-update-confirm-password');

      expect(passwordError.props.children).toBeUndefined();
      expect(confirmPasswordError.props.children).toBe('passwordsDontMatch');
    });
  });

  describe('when form is properly filled', () => {
    it('should show error when server returns default error', async () => {
      const updatePasswordSpy = jest.spyOn(UserService, 'updatePassword');
      updatePasswordSpy.mockReturnValue(
        Promise.reject({
          response: {
            status: 500,
            data: 'Erro no servidor',
          },
        })
      );

      await waitFor(() => {
        fireEvent.changeText(getByTestId('update-password'), '12345678');
        fireEvent.changeText(
          getByTestId('update-confirm-password'),
          '12345678'
        );
      });
      await waitFor(() => fireEvent.press(updateButton));

      const toast = getByText('errorServerDefault');
      expect(toast).toBeDefined();
    });
  });

  it('should show successfull message when server returns no error', async () => {
    const updatePasswordSpy = jest.spyOn(UserService, 'updatePassword');
    updatePasswordSpy.mockReturnValue(Promise.resolve());

    await waitFor(() => {
      fireEvent.changeText(getByTestId('update-password'), '12345678');
      fireEvent.changeText(getByTestId('update-confirm-password'), '12345678');
    });
    await waitFor(() => fireEvent.press(updateButton));

    const toast = getByText('passwordUpdatedSucessfully');
    expect(toast).toBeDefined();
  });

  it('should redirect to Profile page when server returns no error', async () => {
    const updatePasswordSpy = jest.spyOn(UserService, 'updatePassword');
    updatePasswordSpy.mockReturnValue(Promise.resolve());

    await waitFor(() => {
      fireEvent.changeText(getByTestId('update-password'), '12345678');
      fireEvent.changeText(getByTestId('update-confirm-password'), '12345678');
    });
    await waitFor(() => fireEvent.press(updateButton));

    expect(navigationSpy).toHaveBeenCalledWith('Profile');
  });
});
