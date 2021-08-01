import { StyleSheet } from 'react-native';
import { extendTheme } from 'native-base';

export const screenBasicStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export const nativeBaseTheme = extendTheme({
  components: {
    Checkbox: {
      baseStyle: {
        _checkbox: {
          borderRadius: 'full',
          _disabled: {
            bg: '#1a1b1c',
            borderColor: '#1a1b1c',
            opacity: 0.1,
          },
        },
      },
    },
  },
});
