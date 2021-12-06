import React from 'react';
import PropTypes from 'prop-types';
import { Text, Input, FormControl } from 'native-base';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

const LixtInput = ({
  labelName,
  error,
  onChangeText,
  onBlur,
  inputTestID,
  errorTestID,
  helperText,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <FormControl>
      <FormControl.Label>{t(labelName) || labelName}</FormControl.Label>
      <Input
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={!!error}
        testID={inputTestID}
        {...props}
      ></Input>
      {helperText && !error ? (
        <FormControl.HelperText>{t(helperText)}</FormControl.HelperText>
      ) : null}
      <View style={{ height: 20 }}>
        <Text
          color="rose.600"
          fontSize="sm"
          style={{ display: error ? 'flex' : 'none' }}
          testID={errorTestID}
        >
          {t(error)}
        </Text>
      </View>
    </FormControl>
  );
};

export default LixtInput;

LixtInput.propTypes = {
  labelName: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  onChangeText: PropTypes.func,
  onBlur: PropTypes.func,
  inputTestID: PropTypes.string,
  errorTestID: PropTypes.string,
};
