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
  error: PropTypes.string,
  onChangeText: PropTypes.func,
  onBlur: PropTypes.func,
  inputTestID: PropTypes.string,
  errorTestID: PropTypes.string,
};
