import React from 'react';

import Routes from './src/navigation/Routes';
import { AuthProvider } from './src/context/AuthProvider';
import { ListProvider } from './src/context/ListProvider';
import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider } from 'native-base';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <NativeBaseProvider>
          <ListProvider>
            <Routes />
          </ListProvider>
        </NativeBaseProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
