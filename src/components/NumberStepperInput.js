import React from 'react';
import PropTypes from 'prop-types';
import InputSpinner from 'react-native-input-spinner';

import { FormControl } from 'native-base';

import { useTranslation } from 'react-i18next';

export default function NumberStepperInput({
  labelName,
  onChange,
  inputNumberStepperID,
  ...props
}) {
  const { t } = useTranslation();

  return (
    <FormControl>
      <FormControl.Label>{t(labelName) || labelName}</FormControl.Label>
      <InputSpinner {...props} onChange={onChange} />
    </FormControl>
  );
}

NumberStepperInput.propTypes = {
  labelName: PropTypes.string,
  onChange: PropTypes.func,
  inputNumberStepperID: PropTypes.string,
};
