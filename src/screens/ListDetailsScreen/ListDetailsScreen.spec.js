import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ListDetails from './ListDetailsScreen';
import { AuthContext } from '../../context/AuthProvider';
import { ListContext } from '../../context/ListProvider';
import { NavigationContext } from '@react-navigation/native';
import ListMembersService from '../../services/ListMembersService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('ListDetailsScreen component', () => {
  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  describe('when the user is the owner of the list', () => {
    let getByTestId, getByText, queryByTestId;
    let navigationSpy;
    let user;
    const list = {
      listMembers: [{
        id: 1,
        user: {
          id: 2,
          name: 'Ciclano',
          username: 'ciclanodetal',
          email: 'ciclanodetal@gmail.com',
        },
        statusListMember: 'ACCEPT'
      }],
      productOfList: [],
      nameList: 'Lista #01',
      owner: 'fulanodetal',
      ownerId: 1,
      description: 'Olar',
    };

    beforeEach(() => {
      const navigation = {
        navigate: jest.fn((path) => path),
      };
      navigationSpy = jest.spyOn(navigation, 'navigate');

      const route = {
        params: {
          list,
        },
      };

      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn()),
      };

      user = {
        id: 1,
        name: 'Fulano',
        username: 'fulanodetal',
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
              lists: [],
              setLists: () => {},
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider
                children={
                  <NavigationContext.Provider value={navContext}>
                    <ListDetails navigation={navigation} route={route} />
                  </NavigationContext.Provider>
                }
              />
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      queryByTestId = renderResults.queryByTestId;
      getByText = renderResults.getByText;
    });

    it('should show amount of members in the list', () => {
      const listMember1 = queryByTestId('list-member-0');
      expect(listMember1).toBeDefined();
    });

    it('should show the user is the owner of the list', () => {
      const text = getByText('youAreTheListOwner');

      expect(text).toBeDefined();
    });

    it('should redirect to invite page when clicking invite link', async () => {
      const inviteButton = getByTestId('invite-button');

      await waitFor(() => {
        fireEvent.press(inviteButton);
      });

      expect(navigationSpy).toHaveBeenCalledWith('Invite', {
        list,
      });
    });

    it('should remove an user', async () => {
      jest
        .spyOn(ListMembersService, 'deleteInvitation')
        .mockReturnValue(Promise.resolve());

      const removeMemberButton = getByTestId('remove-member-button-0');

      await waitFor(() => {
        fireEvent.press(removeMemberButton);
      });

      expect(
        getByTestId('remove-member-modal').props.accessibilityValue
      ).toStrictEqual({ text: 'visible' });

      const confirmRemoveMemberButton = getByTestId('button-confirm-removal-member')

      await waitFor(() => {
        fireEvent.press(confirmRemoveMemberButton);
      });

      const toast = getByText('memberRemoved')
      expect(toast).toBeDefined()

      expect(
        getByTestId('remove-member-modal').props.accessibilityValue
      ).toStrictEqual({ text: 'hidden' });
    });

    it('should not remove an user if server returns an error', async () => {
      jest
        .spyOn(ListMembersService, 'deleteInvitation')
        .mockReturnValue(Promise.reject());

      const removeMemberButton = getByTestId('remove-member-button-0');

      await waitFor(() => {
        fireEvent.press(removeMemberButton);
      });

      const confirmRemoveMemberButton = getByTestId('button-confirm-removal-member')

      await waitFor(() => {
        fireEvent.press(confirmRemoveMemberButton);
      });

      const toast = getByText('errorServerDefault')
      expect(toast).toBeDefined()
    });

    it('should close remove member modal', async () => {
      jest.spyOn(ListMembersService, 'deleteInvitation').mockClear()

      const removeMemberButton = getByTestId('remove-member-button-0');

      await waitFor(() => {
        fireEvent.press(removeMemberButton);
      });

      expect(
        getByTestId('remove-member-modal').props.accessibilityValue
      ).toStrictEqual({ text: 'visible' });

      const closeModalButton = getByTestId('close-remove-member-modal-button')

      await waitFor(() => {
        fireEvent.press(closeModalButton);
      });

      expect(ListMembersService.deleteInvitation).not.toHaveBeenCalled()
    });
  });

  describe('when the user is not the owner of the list', () => {
    let getByTestId, getByText;
    let navigationSpy;
    let user;
    let list;

    beforeEach(() => {
      list = {
        id: 1,
        listMembers: [
          {
            userId: 1,
            statusListMember: 'ACCEPT',
            user: {
              id: 1,
              name: 'Fulano',
              username: 'fulanodetal',
            },
          },
        ],
        productOfList: [],
        nameList: 'Lista #01',
        owner: 'ciclanodetal',
        ownerId: 2,
        description: 'Olar',
      };
      const navigation = {
        navigate: jest.fn((path) => path),
      };
      navigationSpy = jest.spyOn(navigation, 'navigate');

      const route = {
        params: {
          list,
        },
      };

      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn()),
      };

      user = {
        id: 1,
        name: 'Fulano',
        username: 'fulanodetal',
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
                list,
                {
                  id: 2,
                  listMembers: [
                    {
                      userId: 1,
                      user: {
                        id: 1,
                        name: 'Fulano',
                        username: 'fulanodetal',
                      },
                    },
                  ],
                  productOfList: [],
                  nameList: 'Lista #02',
                  owner: 'ciclanodetal',
                  ownerId: 2,
                  description: 'Olar 2',
                },
              ],
              setLists: () => {},
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider
                children={
                  <NavigationContext.Provider value={navContext}>
                    <ListDetails navigation={navigation} route={route} />
                  </NavigationContext.Provider>
                }
              />
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
    });

    it('should show members in the list', () => {
      const listMember1 = getByTestId('list-member-0');
      expect(listMember1).toBeDefined();
    });

    it('should show the user is not the owner of the list', () => {
      const text = getByText('ciclanodetal isTheListOwner');

      expect(text).toBeDefined();
    });

    it('should leave the list successfully and redirect to the Lists page', async () => {
      jest
        .spyOn(ListMembersService, 'deleteInvitation')
        .mockReturnValue(Promise.resolve());

      const leaveListButton = getByTestId('leave-list');

      await waitFor(() => {
        fireEvent.press(leaveListButton);
      });

      expect(
        getByTestId('leave-list-modal').props.accessibilityValue
      ).toStrictEqual({ text: 'visible' });

      const confirmLeaveListButton = getByTestId('button-confirm-leave-list')

      await waitFor(() => {
        fireEvent.press(confirmLeaveListButton);
      });

      expect(navigationSpy).toHaveBeenCalledWith('Lists');
    });

    it('should not leave the list if server returns an error', async () => {
      jest
        .spyOn(ListMembersService, 'deleteInvitation')
        .mockReturnValue(Promise.reject());

      const leaveListButton = getByTestId('leave-list');

      await waitFor(() => {
        fireEvent.press(leaveListButton);
      });

      expect(
        getByTestId('leave-list-modal').props.accessibilityValue
      ).toStrictEqual({ text: 'visible' });

      const confirmLeaveListButton = getByTestId('button-confirm-leave-list')

      await waitFor(() => {
        fireEvent.press(confirmLeaveListButton);
      });

      const toast = getByText('errorServerDefault');
      expect(toast).toBeDefined();
    });

    it('should close leave list modal', async () => {
      jest.spyOn(ListMembersService, 'deleteInvitation').mockClear()

      const leaveListButton = getByTestId('leave-list');

      await waitFor(() => {
        fireEvent.press(leaveListButton);
      });

      expect(
        getByTestId('leave-list-modal').props.accessibilityValue
      ).toStrictEqual({ text: 'visible' });

      const closeModalButton = getByTestId('close-leave-list-modal-button')

      await waitFor(() => {
        fireEvent.press(closeModalButton);
      });

      expect(ListMembersService.deleteInvitation).not.toHaveBeenCalled()
    });
  });

  describe('when the user is part of the list', () => {
    let getByTestId, getByText;
    let navigationSpy;
    let user;
    let list;

    beforeEach(() => {
      list = {
        id: 1,
        listMembers: [
          {
            userId: 3,
            statusListMember: 'ACCEPT',
            user: {
              id: 3,
              name: 'Fernando',
              username: 'fernandodetal',
            },
          },
        ],
        productOfList: [],
        nameList: 'Lista #01',
        owner: 'ciclanodetal',
        ownerId: 2,
        description: 'Olar',
      };
      const navigation = {
        navigate: jest.fn((path) => path),
      };
      navigationSpy = jest.spyOn(navigation, 'navigate');

      const route = {
        params: {
          list,
        },
      };

      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn()),
      };

      user = {
        id: 1,
        name: 'Fulano',
        username: 'fulanodetal',
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
                list,
                {
                  id: 2,
                  listMembers: [
                    {
                      userId: 1,
                      user: {
                        id: 1,
                        name: 'Fulano',
                        username: 'fulanodetal',
                      },
                    },
                  ],
                  productOfList: [],
                  nameList: 'Lista #02',
                  owner: 'ciclanodetal',
                  ownerId: 2,
                  description: 'Olar 2',
                },
              ],
              setLists: () => {},
            }}
          >
            <SafeAreaProvider
              initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <NativeBaseProvider
                children={
                  <NavigationContext.Provider value={navContext}>
                    <ListDetails navigation={navigation} route={route} />
                  </NavigationContext.Provider>
                }
              />
            </SafeAreaProvider>
          </ListContext.Provider>
        </AuthContext.Provider>
      );

      getByTestId = renderResults.getByTestId;
      getByText = renderResults.getByText;
    });

    it('should not leave the list', async () => {
      jest.spyOn(ListMembersService, 'deleteInvitation').mockClear()

      const leaveListButton = getByTestId('leave-list');

      await waitFor(() => {
        fireEvent.press(leaveListButton);
      });

      expect(
        getByTestId('leave-list-modal').props.accessibilityValue
      ).toStrictEqual({ text: 'visible' });

      const confirmLeaveListButton = getByTestId('button-confirm-leave-list')

      await waitFor(() => {
        fireEvent.press(confirmLeaveListButton);
      });

      expect(ListMembersService.deleteInvitation).toHaveBeenCalledWith(undefined, user)
    })
  });
});
