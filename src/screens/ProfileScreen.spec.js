import 'react-native';
import React from 'react';
import ProfileScreen from './ProfileScreen';
// import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { NativeBaseProvider } from 'native-base';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import { AuthContext } from '../context/AuthProvider';

const AuthContextCustomRender = (component, valueProps) => {
  return renderer.create(
    <NativeBaseProvider>
      <AuthContext.Provider value={valueProps}>
        {component}
      </AuthContext.Provider>
    </NativeBaseProvider>
  );
};

it('renders correctly', () => {
  const tree = AuthContextCustomRender(<ProfileScreen />, {
    user: {},
    logout: () => {},
  });
});
