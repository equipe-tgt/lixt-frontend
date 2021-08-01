import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

export const CheckedItemsContext = React.createContext({
  userIdCart: null,
  checkedItems: [],
});

export const CheckedItemsProvider = ({ children }) => {
  const [checkedItems, setCheckedItems] = useState([]);
  const [userIdCart, setUserIdCart] = useState(null);

  const checkItem = (item, toggleOption) => {
    const isItemChecked = checkedItems.includes(item);

    const copy = [...checkedItems];
    // Se a o usuário passou que quer marcar e o item ainda não existe na lista local
    // então insere
    if (toggleOption && !isItemChecked) {
      setCheckedItems([...copy, item]);
    } else if (!toggleOption && isItemChecked) {
      // Caso ele queira remover um item e esse item exista na lista local: remova
      setCheckedItems(copy.filter((c) => c === item));
    }
  };

  const checkMultipleItems = (items, toggleOption) => {
    const copy = [...checkedItems];

    if (toggleOption) {
      setCheckedItems([...copy, ...items]);
    } else {
      const finalList = copy.filter((i) => !items.includes(i));
      setCheckedItems(finalList);
    }
  };

  // Ao modificar os itens que estão marcados e desmarcados modifica também o storage local
  useEffect(() => {
    AsyncStorage.setItem(
      `checkedItems-${userIdCart}`,
      JSON.stringify(checkedItems)
    );
  }, [checkedItems]);

  // Ao atribuir um usuário, recupera os itens que o usuário marcou no storage local
  useEffect(() => {
    if (!userIdCart) return;
    AsyncStorage.getItem(`checkedItems-${userIdCart}`).then((value) => {
      if (value) {
        setCheckedItems(JSON.parse(value));
      }
    });
  }, [userIdCart]);

  return (
    <CheckedItemsContext.Provider
      value={{
        checkedItems,
        checkItem,
        checkMultipleItems,
        setUserIdCart: setUserIdCart,
      }}
    >
      {children}
    </CheckedItemsContext.Provider>
  );
};

CheckedItemsProvider.propTypes = {
  children: PropTypes.object,
};
