import React from 'react';
import { Text, Input, FormControl } from "native-base";
import { View } from 'react-native';
import { useTranslation } from "react-i18next";

const LixtInput = ({
  labelName,
  id,
  error,
  isDisabled,
  onChangeText,
  onBlur,
  inputTestID,
  errorTestID,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <FormControl>
      <FormControl.Label htmlFor={id}>
        {t(labelName) || labelName}
      </FormControl.Label>
      <Input
        id={id}
        disabled={isDisabled}
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={!!error}
        isInvalid={!!error}
        testID={inputTestID}
        {...props}
      ></Input>
      <View style={{ height: "20px" }}>
        <Text
          color="rose.600"
          fontSize="sm"
          style={{ display: error ? 'flex' : 'none' }}
          testID={errorTestID}>
          {error}
        </Text>
      </View>
    </FormControl>
  );
}

export default LixtInput;
