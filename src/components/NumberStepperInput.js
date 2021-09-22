import React from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from 'native-base';

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
      <NumberInput onChange={onChange} testID={inputNumberStepperID} {...props}>
        <NumberInputField h={12} />
        <NumberInputStepper h={12}>
          <NumberIncrementStepper h={6} />
          <NumberDecrementStepper h={6} />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  );
}

NumberStepperInput.propTypes = {
  labelName: PropTypes.string,
  onChange: PropTypes.func,
  inputNumberStepperID: PropTypes.string,
};
