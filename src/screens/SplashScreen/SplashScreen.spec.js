import '@testing-library/jest-dom';
import React from 'React';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Splash from './SplashScreen';

jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('SplashScreen component', () => {
  let getByTestId, getByText;

  beforeEach(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  beforeEach(() => {
    const renderResults = render(
      <SafeAreaProvider
        initialSafeAreaInsets={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <NativeBaseProvider children={<Splash />} />
      </SafeAreaProvider>
    );

    getByTestId = renderResults.getByTestId;
    getByText = renderResults.getByText;
  });

  it('should', () => {
    expect(true).toBe(true);
  });
});
