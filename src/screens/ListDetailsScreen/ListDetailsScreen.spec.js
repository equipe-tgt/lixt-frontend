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
  describe('when the user is the owner of the list', () => {
    let getByTestId, getByText;
    let navigationSpy;
    let user;
    const list = {
      listMembers: [],
      productOfList: [],
      nameList: 'Lista #01',
      owner: 'fulanodetal',
      ownerId: 1,
      description: 'Olar'
    }
  
    beforeEach(() => {
      const navigation = {
        navigate: jest.fn((path) => path),
      };
      navigationSpy = jest.spyOn(navigation, 'navigate');
  
      const route = {
        params: {
          list
        }
      }
  
      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn())
      }
  
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
      getByText = renderResults.getByText;
    });

    it('should show amount of members in the list', () => {
      const amountMembers = getByTestId('amount-members');
      expect(amountMembers.props.children).toBe(1);
    });

    it('should show the user is the owner of the list', () => {
      const text = getByText('youAreTheListOwner');

      expect(text).toBeDefined();
    });
  
    it('should redirect to invite page when clicking invite link', async () => {
      const inviteButton = getByTestId('invite-button')

      await waitFor(() => {
        fireEvent.press(inviteButton)
      })

      expect(navigationSpy).toHaveBeenCalledWith('Invite', {
        list
      })
    })
  });

  describe('when the user is not the owner of the list', () => {
    let getByTestId, getByText;
    let navigationSpy;
    let user;
    let list;
  
    beforeEach(() => {
      list = {
        id: 1,
        listMembers: [{
          userId: 1,
          name: 'Fulano',
          username: 'fulanodetal',
          statusListMember: 'ACCEPT'
        }],
        productOfList: [],
        nameList: 'Lista #01',
        owner: 'ciclanodetal',
        ownerId: 2,
        description: 'Olar'
      }
      const navigation = {
        navigate: jest.fn((path) => path),
      };
      navigationSpy = jest.spyOn(navigation, 'navigate');
  
      const route = {
        params: {
          list
        }
      }
  
      const navContext = {
        isFocused: () => true,
        // addListener returns an unscubscribe function.
        addListener: jest.fn(() => jest.fn())
      }
  
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
                  listMembers: [{
                    userId: 1,
                    name: 'Fulano',
                    username: 'fulanodetal',
                  }],
                  productOfList: [],
                  nameList: 'Lista #02',
                  owner: 'ciclanodetal',
                  ownerId: 2,
                  description: 'Olar 2'
                }
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

    it('should show amount of members in the list', () => {
      const amountMembers = getByTestId('amount-members');
      expect(amountMembers.props.children).toBe(2);
    });

    it('should show the user is not the owner of the list', () => {
      const text = getByText('ciclanodetal isTheListOwner');

      expect(text).toBeDefined();
    });
  
    it('should leave the list successfully and redirect to the Lists page', async () => {
      jest.spyOn(ListMembersService, 'deleteInvitation')
        .mockReturnValue(Promise.resolve());

      const leaveListButton = getByTestId('leave-list')

      await waitFor(() => {
        fireEvent.press(leaveListButton)
      })

      expect(navigationSpy).toHaveBeenCalledWith('Lists');
    })

    it('should not leave the list if server returns an error', async () => {
      jest.spyOn(ListMembersService, 'deleteInvitation')
        .mockReturnValue(Promise.reject());

      const leaveListButton = getByTestId('leave-list')

      await waitFor(() => {
        fireEvent.press(leaveListButton)
      })

      const toast = getByText('errorServerDefault')
      expect(toast).toBeDefined();
    })
  });
});
