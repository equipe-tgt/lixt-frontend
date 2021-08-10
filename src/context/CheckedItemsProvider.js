import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const CheckedItemsContext = React.createContext({
  checkedItems: [],
});

export const CheckedItemsProvider = ({ children }) => {
  const [checkedItems, setCheckedItems] = useState([]);

  const checkItem = (item, toggleOption) => {
    const isItemChecked = !!checkedItems.find((i) => i.id === item.id);

    const copy = [...checkedItems];
    // Se a o usuário passou que quer marcar e o item ainda não existe na lista local
    // então insere
    if (toggleOption && !isItemChecked) {
      setCheckedItems([...copy, item]);
    } else if (!toggleOption && isItemChecked) {
      // Caso ele queira remover um item e esse item exista na lista local: remova
      setCheckedItems(copy.filter((checkedItem) => checkedItem.id !== item.id));
    }
  };

  const checkMultipleItems = (items, toggleOption) => {
    const copy = [...checkedItems];
    // Se o usuário passou que quer marcar vários itens, insere os que
    // não estiverem inseridos já
    if (toggleOption) {
      for (const item of items) {
        if (!copy.find((i) => i.id === item.id)) {
          copy.push(item);
        }
      }
      setCheckedItems([...copy]);
    } else {
      // Se o usuário quer remover vários itens marcados, remove os que ele
      // passar
      const idsToExclude = items.map((item) => item.id);
      const finalList = copy.filter(({ id }) => !idsToExclude.includes(id));
      setCheckedItems(finalList);
    }
  };

  return (
    <CheckedItemsContext.Provider
      value={{
        checkedItems,
        checkItem,
        checkMultipleItems,
        setCheckedItems,
      }}
    >
      {children}
    </CheckedItemsContext.Provider>
  );
};

CheckedItemsProvider.propTypes = {
  children: PropTypes.object,
};
