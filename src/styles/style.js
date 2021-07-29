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
        },
      },
    },
  },
});
