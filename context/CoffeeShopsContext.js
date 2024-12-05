// CoffeeShopsContext.js

import React, { createContext, useState, useEffect } from "react";
import data from "./coffeeshops.json";
const CoffeeShopsContext = createContext();

export const CoffeeShopsProvider = ({ children }) => {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoffeeShops = async () => {
      try {
        setCoffeeShops(data.value);
      } catch (error) {
        console.error("Error fetching coffee shops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoffeeShops();
  }, []);

  return (
    <CoffeeShopsContext.Provider value={{ coffeeShops, loading }}>
      {children}
    </CoffeeShopsContext.Provider>
  );
};

export default CoffeeShopsContext;
