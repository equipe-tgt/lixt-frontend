import React from 'react';
import PropTypes from 'prop-types';
import { TextInputMask } from 'react-native-masked-text';
import { FormControl, Text } from 'native-base';
import { useTranslation } from 'react-i18next';

export default function LixtNumberInput({
  onChangeText,
  labelName,
  hasHelperText,
  error,
  ...props
}) {
  const { t } = useTranslation();
  return (
    <FormControl>
      <FormControl.Label>{t(labelName) || labelName}</FormControl.Label>
      <TextInputMask
        {...props}
        style={{
          borderColor: '#e4e4e7',
          borderWidth: 1,
          borderRadius: 5,
          lineHeight: 16,
          fontSize: 16,
          paddingLeft: 3,
          alignItems: 'center',
          flexDirection: 'row',
          paddingVertical: 12,
        }}
        type={'only-numbers'}
        onChangeText={onChangeText}
      />
      {hasHelperText ? (
        <FormControl.HelperText>
          <Text style={error ? { color: '#fb7185' } : { display: 'none' }}>
            {error}
          </Text>
        </FormControl.HelperText>
      ) : null}
    </FormControl>
  );
}
LixtNumberInput.propTypes = {
  hasHelperText: PropTypes.bool,
  labelName: PropTypes.string,
  error: PropTypes.string,
  onChangeText: PropTypes.func,
};
