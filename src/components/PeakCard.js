import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { Box, HStack, Icon, Text } from 'native-base';
import { AntDesign } from '@expo/vector-icons';

export default function PeakCard({ label, date, price, isUp }) {
  return (
    <Box style={styles.card} px={3} py={3}>
      <HStack alignItems="center" mb={2}>
        {isUp ? (
          <Icon
            size={3}
            as={<AntDesign name="caretup" />}
            color="danger.500"
            mr={3}
          />
        ) : (
          <Icon
            size={3}
            as={<AntDesign name="caretdown" />}
            color="success.500"
            mr={3}
          />
        )}

        <Text fontWeight="bold">{label}</Text>
      </HStack>
      <Text>{date}</Text>
      <Text>{price}</Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 3,
    borderWidth: 0.25,
    borderColor: '#252525',
  },
});

PeakCard.propTypes = {
  label: PropTypes.string,
  date: PropTypes.string,
  price: PropTypes.string,
  isUp: PropTypes.bool,
};
