import React from 'react';
import { FormControl, Select } from 'native-base';
import { useTranslation } from 'react-i18next';

const LixtSelect = ({
  labelName,
  onValueChange,
  selectTestID,
  isDisabled,
  selectedValue,
  children,
}) => {
  const { t } = useTranslation();
  return (
    <FormControl>
      <FormControl.Label>{t(labelName) || labelName}</FormControl.Label>
      <Select
        isDisabled={isDisabled}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        testID={selectTestID}
      >
        {children}
      </Select>
    </FormControl>
  );
};

export default LixtSelect;
