import React from 'react';
import { Text, Input, FormControl } from "native-base";
import { useTranslation } from "react-i18next";

const LixtInput = ({
  labelName,
  error,
  isDisabled,
  onChangeText,
  onBlur,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <FormControl>
      <FormControl.Label>{t(labelName) || labelName}</FormControl.Label>
      <Input
        disabled={isDisabled}
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={!!error}
        isInvalid={!!error}
        {...props}
      ></Input>
      <Text
        color="rose.600"
        fontSize="sm"
        height="20px"
        style={{ visibility: error ? 'visible' : 'hidden' }}>
        {error}
      </Text>
    </FormControl>
  );
}

export default LixtInput;
