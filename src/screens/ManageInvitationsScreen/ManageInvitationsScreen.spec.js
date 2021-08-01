import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ManageInvitations from './ManageInvitationsScreen';
import { AuthContext } from '../../context/AuthProvider';
import ListMembersService from '../../services/ListMembersService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('ManageInvitationsScreen component', () => {
  describe('when server returns default error while getting invitations', () => {
    let getByTestId, getByText, rerender, findByTestId;
    const user = {
      name: 'Fulano',
      username: 'fulanodetal',
    };
  
    beforeEach(() => {
      jest.spyOn(ListMembersService, 'getInvitations')
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
              children={<ManageInvitations />}
            />
          </SafeAreaProvider>
        </AuthContext.Provider>
      );
  
      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      rerender = renderResults.rerender;
      findByTestId = renderResults.findByTestId;
    });
  
    it('should show no invitations', async () => {
      const noInvitationsFound = getByText('noInvitationsFound');
      expect(noInvitationsFound).toBeDefined();
    });
  });

  describe('when there is an ACCEPT invitation in the received invitations', () => {
    let getByTestId, getByText, rerender, findByTestId;
    const user = {
      name: 'Fulano',
      username: 'fulanodetal',
    };
  
    beforeEach(() => {
      const getInvitationsApy = jest.spyOn(ListMembersService, 'getInvitations');
      getInvitationsApy.mockImplementation((index) => {
        console.log({ index });
        return new Promise((resolve) => {
          if (index === 0) {
            resolve({
              data: []
            });
          } else {
            resolve({
              data: [{
                id: 1,
                nameList: 'Lista #01',
                userInvited: 'fulanodetal',
                userWhoInvite: 'ciclanodetal',
                statusListMember: 'ACCEPT'
              }]
            });
          }
        });
      });
  
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
              children={<ManageInvitations />}
            />
          </SafeAreaProvider>
        </AuthContext.Provider>
      );
  
      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      rerender = renderResults.rerender;
      findByTestId = renderResults.findByTestId;
    });
  
    it('should show the invite as accepted', async () => {
      const receivedInviteTabs = await findByTestId('received-invitations-tab');
      await waitFor(() => {
        fireEvent.press(receivedInviteTabs);
      });

      const receivedInvite = await findByTestId('received-invite-1');
      expect(receivedInvite.props.children).toBe('ciclanodetal hasInvitedYou Lista #01');

      const receivedInviteStatus = await findByTestId('received-invite-status-1');
      expect(receivedInviteStatus.props.children).toBe('youAccepted');
    });
  });

  describe('when there is an REJECT invitation in the received invitations', () => {
    let getByTestId, getByText, rerender, findByTestId;
    const user = {
      name: 'Fulano',
      username: 'fulanodetal',
    };
  
    beforeEach(() => {
      const getInvitationsApy = jest.spyOn(ListMembersService, 'getInvitations');
      getInvitationsApy.mockImplementation((index) => {
        console.log({ index });
        return new Promise((resolve) => {
          if (index === 0) {
            resolve({
              data: []
            });
          } else {
            resolve({
              data: [{
                id: 1,
                nameList: 'Lista #01',
                userInvited: 'fulanodetal',
                userWhoInvite: 'ciclanodetal',
                statusListMember: 'REJECT'
              }]
            });
          }
        });
      });
  
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
              children={<ManageInvitations />}
            />
          </SafeAreaProvider>
        </AuthContext.Provider>
      );
  
      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      rerender = renderResults.rerender;
      findByTestId = renderResults.findByTestId;
    });
  
    it('should show the invite as accepted', async () => {
      const receivedInviteTabs = await findByTestId('received-invitations-tab');
      await waitFor(() => {
        fireEvent.press(receivedInviteTabs);
      });

      const receivedInvite = await findByTestId('received-invite-1');
      expect(receivedInvite.props.children).toBe('ciclanodetal hasInvitedYou Lista #01');

      const receivedInviteStatus = await findByTestId('received-invite-status-1');
      expect(receivedInviteStatus.props.children).toBe('youRejected');
    });
  });

  describe('when there is an WAITING invitation in the received invitations', () => {
    let getByTestId, getByText, rerender, findByTestId;
    const user = {
      name: 'Fulano',
      username: 'fulanodetal',
    };
  
    beforeEach(() => {
      const getInvitationsApy = jest.spyOn(ListMembersService, 'getInvitations');
      getInvitationsApy.mockImplementation((index) => {
        console.log({ index });
        return new Promise((resolve) => {
          if (index === 0) {
            resolve({
              data: []
            });
          } else {
            resolve({
              data: [{
                id: 1,
                nameList: 'Lista #01',
                userInvited: 'fulanodetal',
                userWhoInvite: 'ciclanodetal',
                statusListMember: 'WAITING'
              }]
            });
          }
        });
      });
  
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
              children={<ManageInvitations />}
            />
          </SafeAreaProvider>
        </AuthContext.Provider>
      );
  
      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      rerender = renderResults.rerender;
      findByTestId = renderResults.findByTestId;
    });
  
    it('should accept the invite successfully', async () => {
      jest.spyOn(ListMembersService, 'handleInvitation')
        .mockReturnValue(Promise.resolve({
          data: {
            id: 1,
            statusListMember: 'ACCEPT'
          }
        }));
      const receivedInviteTabs = await findByTestId('received-invitations-tab');
      await waitFor(() => {
        fireEvent.press(receivedInviteTabs);
      });

      const receivedInvite = await findByTestId('received-invite-1');
      expect(receivedInvite.props.children).toBe('ciclanodetal hasInvitedYou Lista #01');

      const acceptInvitation = await findByTestId('accept-invitation');
      await waitFor(() => {
        fireEvent.press(acceptInvitation);
      });

      const receivedInviteStatus = await findByTestId('received-invite-status-1');
      expect(receivedInviteStatus.props.children).toBe('youAccepted');
    });

    it('should not accept the invite when server returns error', async () => {
      jest.spyOn(ListMembersService, 'handleInvitation')
        .mockReturnValue(Promise.reject());

      const receivedInviteTabs = await findByTestId('received-invitations-tab');
      await waitFor(() => {
        fireEvent.press(receivedInviteTabs);
      });

      const receivedInvite = await findByTestId('received-invite-1');
      expect(receivedInvite.props.children).toBe('ciclanodetal hasInvitedYou Lista #01');

      const acceptInvitation = await findByTestId('accept-invitation');
      await waitFor(() => {
        fireEvent.press(acceptInvitation);
      });

      expect(() => {
        getByTestId('received-invite-status-1');
      }).toThrow('No instances found with testID: received-invite-status-1');
    });

    it('should reject the invite successfully', async () => {
      jest.spyOn(ListMembersService, 'handleInvitation')
        .mockReturnValue(Promise.resolve({
          data: {
            id: 1,
            statusListMember: 'REJECT'
          }
        }));
      const receivedInviteTabs = await findByTestId('received-invitations-tab');
      await waitFor(() => {
        fireEvent.press(receivedInviteTabs);
      });

      const receivedInvite = await findByTestId('received-invite-1');
      expect(receivedInvite.props.children).toBe('ciclanodetal hasInvitedYou Lista #01');

      const rejectedInvitation = await findByTestId('reject-invitation');
      await waitFor(() => {
        fireEvent.press(rejectedInvitation);
      });

      const receivedInviteStatus = await findByTestId('received-invite-status-1');
      expect(receivedInviteStatus.props.children).toBe('youRejected');
    });

    it('should not reject the invite when server returns error', async () => {
      jest.spyOn(ListMembersService, 'handleInvitation')
        .mockReturnValue(Promise.reject());

      const receivedInviteTabs = await findByTestId('received-invitations-tab');
      await waitFor(() => {
        fireEvent.press(receivedInviteTabs);
      });

      const receivedInvite = await findByTestId('received-invite-1');
      expect(receivedInvite.props.children).toBe('ciclanodetal hasInvitedYou Lista #01');

      const rejectedInvitation = await findByTestId('reject-invitation');
      await waitFor(() => {
        fireEvent.press(rejectedInvitation);
      });

      expect(() => {
        getByTestId('received-invite-status-1');
      }).toThrow('No instances found with testID: received-invite-status-1');
    });
  });

  describe('when there is an unknown invitation in the sent invitations', () => {
    let getByTestId, getByText, rerender, findByTestId;
    const user = {
      name: 'Fulano',
      username: 'fulanodetal',
    };
  
    beforeEach(() => {
      const getInvitationsApy = jest.spyOn(ListMembersService, 'getInvitations');
      getInvitationsApy.mockImplementation((index) => {
        console.log({ index });
        return new Promise((resolve) => {
          if (index === 0) {
            resolve({
              data: []
            });
          } else {
            resolve({
              data: [{
                id: 1,
                nameList: 'Lista #01',
                userInvited: 'fulanodetal',
                userWhoInvite: 'ciclanodetal',
                statusListMember: 'UNKNOWN'
              }]
            });
          }
        });
      });
  
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
              children={<ManageInvitations />}
            />
          </SafeAreaProvider>
        </AuthContext.Provider>
      );
  
      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
      rerender = renderResults.rerender;
      findByTestId = renderResults.findByTestId;
    });
  
    it('should show no status', async () => {
      const sentInvite = await findByTestId('sent-invite-status-1');
      expect(sentInvite.props.children).toEqual(["Status: ", undefined]);
    });
  });
});
