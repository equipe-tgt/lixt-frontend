import React from 'react';
import { HStack, Pressable, Text } from 'native-base';
import PropTypes from 'prop-types';

export default function ButtonGroupSelector({
  options,
  selectedOption,
  onSelectOption,
  translate,
}) {
  return (
    <HStack justifyContent="space-around">
      {options.map((option, index) => (
        <Pressable
          backgroundColor={option === selectedOption ? '#22d3ee' : '#fff'}
          borderRadius={option === selectedOption ? 4 : 0}
          py={4}
          px={3}
          key={index}
          onPress={() => {
            onSelectOption(option);
          }}
        >
          <Text
            fontSize={12}
            color={option === selectedOption ? '#fff' : '#333'}
          >
            {translate(option)}
          </Text>
        </Pressable>
      ))}
    </HStack>
  );
}

ButtonGroupSelector.propTypes = {
  options: PropTypes.array,
  translate: PropTypes.func,
  onSelectOption: PropTypes.func,
  selectedOption: PropTypes.any,
};
