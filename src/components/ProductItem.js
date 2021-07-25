import React from 'react';
import PropTypes from 'prop-types';
import { getMeasureType } from '../utils/measureTypes';
import { Pressable, Box, Menu, Text } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const ProductItem = ({ product, navigate, deleteFromList }) => {
  const { t } = useTranslation();

  return (
    <Pressable
      key={product.id}
      my={3}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      onPress={() => {
        navigate('ProductOfListDetails', {
          product,
        });
      }}
    >
      <Box>
        <Text fontWeight="bold">{product.name}</Text>
        <Text>
          {product.measureValue} {getMeasureType(product.measureType)}
        </Text>
        <Text>{product.price ? `R$ ${product.price}` : 'R$ 0,00'}</Text>
      </Box>

      <Menu
        trigger={(triggerProps) => {
          return (
            <Pressable p={3} {...triggerProps}>
              <Ionicons size={18} color="#27272a" name="ellipsis-vertical" />
            </Pressable>
          );
        }}
      >
        <Menu.Item
          onPress={() => {
            deleteFromList(product.id);
          }}
        >
          {t('remove')}
        </Menu.Item>
      </Menu>
    </Pressable>
  );
};

export default ProductItem;

ProductItem.propTypes = {
  navigate: PropTypes.func,
  deleteFromList: PropTypes.func,
  product: PropTypes.object,
};
