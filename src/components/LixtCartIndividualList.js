import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { VStack, Box, Heading } from 'native-base';
import LixtCartProductItem from '../components/LixtCartProductItem';

export default function LixtCartIndividualList({
  selectedList,
  refreshIndividualList,
  navigate,
}) {
  const [itemsShownByCategory, setItemsShownByCategory] = useState({});

  useEffect(() => {
    listItemsByCategory();
  }, [selectedList]);

  const listItemsByCategory = () => {
    if (selectedList && selectedList?.productsOfList) {
      // Agrupa os produtos por categorias
      const groupedProducts = selectedList.productsOfList.reduce(
        (accumlator, currentProductOfList) => {
          accumlator[currentProductOfList.product.category.name] = [
            ...(accumlator[currentProductOfList.product.category.name] || []),
            currentProductOfList,
          ];
          return accumlator;
        },
        {}
      );
      setItemsShownByCategory(groupedProducts);
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
                    idSelectedList={p.listId}
                    product={p}
                    navigate={navigate}
                    refreshIndividualList={refreshIndividualList}
                  />
                ))}
              </Box>
            );
          })
        : null}
    </VStack>
  );
}

LixtCartIndividualList.propTypes = {
  navigate: PropTypes.func,
  selectedList: PropTypes.object,
  refreshIndividualList: PropTypes.func,
};
