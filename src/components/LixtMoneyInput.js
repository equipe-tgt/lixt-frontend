import React from 'react';
import PropTypes from 'prop-types';
import { TextInputMask } from 'react-native-masked-text';
import { FormControl, Text } from 'native-base';
import { useTranslation, getI18n } from 'react-i18next';

export default function LixtMoneyInput({ onChangeText, labelName, hasHelperText, error, ...props }) {
  const { t } = useTranslation();
  const i18nInstance = getI18n();

  const getSeparator = () => {
    switch (i18nInstance.language) {
      case 'pt_BR': {
        return ',';
      }
      case 'en_US': {
        return '.';
      }
      default: return '';
    }
  }

  const getDelimiter = () => {
    switch (i18nInstance.language) {
      case 'pt_BR': {
        return '.';
      }
      case 'en_US': {
        return ',';
      }
      default: return '';
    }
  }

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
        type={'money'}
        options={{
          precision: 2,
          separator:  getSeparator(),
          delimiter: getDelimiter(),
          unit: '',
        }}
        onChangeText={onChangeText}
        {...props}
      />
      {
        hasHelperText ? (
          <FormControl.HelperText>
            <Text
              style={error ? { color: '#fb7185' } : { display: 'none' }}
            >
              {error}
            </Text>
          </FormControl.HelperText>
        ) : null
      }
    </FormControl>
  );
}
LixtMoneyInput.propTypes = {
  labelName: PropTypes.string,
  hasHelperText: PropTypes.bool,
  error: PropTypes.string,
  onChangeText: PropTypes.func,
};
