import React from 'react';
import PropTypes from 'prop-types';
import { TextInputMask } from 'react-native-masked-text';
import { FormControl } from 'native-base';
import { useTranslation } from 'react-i18next';

export default function LixtNumberInput({ onChangeText, labelName, ...props }) {
  const { t } = useTranslation();
  return (
    <FormControl>
      <FormControl.Label>{t(labelName) || labelName}</FormControl.Label>
      <TextInputMask
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
        {...props}
        onChangeText={onChangeText}
      />
    </FormControl>
  );
}
LixtNumberInput.propTypes = {
  labelName: PropTypes.string,
  onChangeText: PropTypes.func,
};
