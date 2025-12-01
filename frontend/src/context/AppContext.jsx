import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchData } from "../utils/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {

  return (
    <AppContext.Provider value={{ }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
