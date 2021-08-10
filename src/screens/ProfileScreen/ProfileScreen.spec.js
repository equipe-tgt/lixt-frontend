import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Profile from './ProfileScreen';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('ProfileScreen component', () => {
  let getByTestId, getByText;
  let navigationSpy;
  let user;
  let logoutFn;

  beforeEach(() => {
    const navigation = {
      navigate: jest.fn((path) => path),
    };
    navigationSpy = jest.spyOn(navigation, 'navigate');

    user = {
      name: 'Fulano',
      username: 'fulanodetal',
    };
    logoutFn = jest.fn();

    const renderResults = render(
      <AuthContext.Provider
        value={{
          user,
          login: () => {},
          logout: logoutFn,
        }}
      >
        <ListContext.Provider
          value={{
            lists: [],
            setLists: () => {},
          }}
        >
          <SafeAreaProvider
            initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <NativeBaseProvider
              children={<Profile navigation={navigation} />}
            />
          </SafeAreaProvider>
        </ListContext.Provider>
      </AuthContext.Provider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
  });

  it('should show name and username from user based on the AuthContext', async () => {
    const name = getByTestId('user-name');
    const username = getByTestId('user-username');

    expect(name.props.children).toBe(user.name);
    expect(username.props.children).toBe(user.username);
  });

  it('should go to Invitations page when clicking on the invitations link', async () => {
    const invitationsLink = getByText('invitations');

    await waitFor(() => fireEvent.press(invitationsLink));

    expect(navigationSpy).toHaveBeenCalledWith('Invitations');
  });

  it('should go to Invite page when clicking on the invite link', async () => {
    const sendInvitationLink = getByText('sendInvitation');

    await waitFor(() => fireEvent.press(sendInvitationLink));

    expect(navigationSpy).toHaveBeenCalledWith('Invite');
  });

  it('should go to UpdatePassword page when clicking on the update password link', async () => {
    const updatePasswordLink = getByText('updatePassword');

    await waitFor(() => fireEvent.press(updatePasswordLink));

    expect(navigationSpy).toHaveBeenCalledWith('UpdatePassword');
  });

  it('should go to Settings page when clicking on the settings link', async () => {
    const settingsLink = getByText('settings');

    await waitFor(() => fireEvent.press(settingsLink));

    expect(navigationSpy).toHaveBeenCalledWith('Settings');
  });

  it('should logout when clicking the logout link', async () => {
    const logoutLink = getByText('logout');

    await waitFor(() => fireEvent.press(logoutLink));

    expect(logoutFn).toHaveBeenCalled();
  });
});
