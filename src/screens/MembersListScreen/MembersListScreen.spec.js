import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { NavigationContext } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MembersListScreen from './MembersListScreen';
import { AuthContext } from '../../context/AuthProvider';
import ListMembersService from '../../services/ListMembersService';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('MembersListScreen component', () => {
  describe('when the owner is accessing the list', () => {
    let getByTestId, getByText, getAllByTestId;
    let user;
    const memberList = [{
      id: 1,
      user: {
        name: 'Fulano',
        username: 'fulanodetal',
        id: 1
      }
    }, {
      id: 2,
      user: {
        name: 'Ciclano',
        username: 'ciclanodetal',
        id: 2
      }
    }]
  
    beforeEach(() => {
      user = {
        id: 1,
        name: 'Fulano',
        username: 'fulanodetal'
      };
  
      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn())
      }
  
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
                  <MembersListScreen route={{
                    params: {
                      list: {
                        listMembers: memberList,
                        owner: 'fulanodetal',
                        ownerId: 1
                      }
                    }
                  }} />
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
  
    it('should list all members as element', () => {
      const member1 = getByTestId('member-1');
      const member2 = getByTestId('member-2');
  
      expect(member1).toBeDefined();
      expect(member2).toBeDefined();
    });

    it('should the owner name', () => {
      const ownerName = getByTestId('owner');
      expect(ownerName.props.children).toBe('fulanodetal');
    });
  
    it('should show "you" when member has the same id as user', () => {
      const member1 = getByTestId('member-1');
      const member2 = getByTestId('member-2');
  
      expect(member1.props.children).toEqual(["@", "fulanodetal", " ", "(you)"]);
      expect(member2.props.children).toEqual(['@', 'ciclanodetal', ' ', null]);
    });

    it('should have 2 remove buttons to remove 2 users', () => {
      const removeMemberButton = getAllByTestId('remove-member');
      
      expect(removeMemberButton.length).toBe(2);
      expect(removeMemberButton[0]).toBeDefined();
      expect(removeMemberButton[1]).toBeDefined();
    });

    it('should remove an user successfully', async () => {
      const deleteInvitationSpy = jest.spyOn(ListMembersService, 'deleteInvitation');
      deleteInvitationSpy.mockReturnValue(Promise.resolve());
    
      const removeMember1Button = getAllByTestId('remove-member')[0];

      await waitFor(() => {
        fireEvent.press(removeMember1Button);
      });

      const toast = getByText('memberRemoved');
      expect(toast).toBeDefined();

      const removeMemberButton = getAllByTestId('remove-member');
      expect(removeMemberButton.length).toBe(1);
    });

    it('should not remove an user due to server error', async () => {
      const deleteInvitationSpy = jest.spyOn(ListMembersService, 'deleteInvitation');
      deleteInvitationSpy.mockReturnValue(Promise.reject());
    
      const removeMember1Button = getAllByTestId('remove-member')[0];

      await waitFor(() => {
        fireEvent.press(removeMember1Button);
      });

      const toast = getByText('errorServerDefault');
      expect(toast).toBeDefined();

      const removeMemberButton = getAllByTestId('remove-member');
      expect(removeMemberButton.length).toBe(2);
    });
  });

  describe('when the owner is not accessing the list', () => {
    let getByTestId, getByText, getAllByTestId;
    let user;
    const memberList = [{
      id: 1,
      user: {
        name: 'Fulano',
        username: 'fulanodetal',
        id: 1
      }
    }, {
      id: 2,
      user: {
        name: 'Ciclano',
        username: 'ciclanodetal',
        id: 2
      }
    }]
  
    beforeEach(() => {
      user = {
        id: 1,
        name: 'Fulano',
        username: 'fulanodetal'
      };
  
      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn())
      }
  
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
                  <MembersListScreen route={{
                    params: {
                      list: {
                        listMembers: memberList,
                        owner: 'ciclanodetal',
                        ownerId: 2
                      }
                    }
                  }} />
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

    it('should the owner name', () => {
      const ownerName = getByTestId('owner');
      expect(ownerName.props.children).toBe('ciclanodetal');
    });

    it('should not have remove buttons', () => {
      expect(() => {
        const removeMemberButton = getAllByTestId('remove-member');
      }).toThrow('No instances found with testID: remove-member');
    });
  });
});
