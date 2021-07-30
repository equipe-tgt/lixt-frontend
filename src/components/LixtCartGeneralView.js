import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { VStack, Box, Heading } from 'native-base';
import LixtCartProductItem from '../components/LixtCartProductItem';

export default function LixtCartGeneralView({ selectedList, navigate }) {
  const [itemsShownByCategory, setItemsShownByCategory] = useState({});

  useEffect(() => {
    listItemsByCategory();
  }, [selectedList]);

  const listItemsByCategory = () => {
    if (selectedList && selectedList?.groupedProducts) {
      // Agrupa os produtos por categorias
      const productsByCategory = selectedList.groupedProducts.reduce(
        (accumlator, currentProductOfList) => {
          accumlator[currentProductOfList.product.category.name] = [
            ...(accumlator[currentProductOfList.product.category.name] || []),
            currentProductOfList,
          ];
          return accumlator;
        },
        {}
      );
      setItemsShownByCategory(productsByCategory);
    }
    return {};
  };

  return (
    <VStack w="90%" mx="auto">
      {Object.keys(itemsShownByCategory).length > 0
        ? Object.keys(itemsShownByCategory).map((category, index) => {
            return (
              <Box key={index} my={3}>
                <Heading
                  style={{ textTransform: 'uppercase', letterSpacing: 4 }}
                  mb={2}
                  fontWeight="normal"
                  size="sm"
                >
                  {category}
                </Heading>
                {itemsShownByCategory[category].map((p) => (
                  <LixtCartProductItem
                    key={p.id}
                    idSelectedList="view-all"
                    product={p}
                    navigate={navigate}
                    refreshIndividualList={null}
                  />
                ))}
              </Box>
            );
          })
        : null}
    </VStack>
  );
}

LixtCartGeneralView.propTypes = {
  navigate: PropTypes.func,
  selectedList: PropTypes.object,
  refreshIndividualList: PropTypes.func,
};
