import React, { useState } from 'react';

export const ListContext = React.createContext({
  lists: [],
});

export const ListProvider = ({ children }) => {
  const [lists, setLists] = useState([]);

  return (
    <ListContext.Provider value={{ lists, setLists }}>
      {children}
    </ListContext.Provider>
  );
};
