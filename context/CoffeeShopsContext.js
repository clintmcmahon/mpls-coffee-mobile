// CoffeeShopsContext.js

import React, { createContext, useState, useEffect } from "react";

const CoffeeShopsContext = createContext();

export const CoffeeShopsProvider = ({ children }) => {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoffeeShops = async () => {
      try {
        const response = await fetch(
          "https://api.mplscoffee.com/odata/CoffeeShops?$expand=hours"
        );
        const data = await response.json();
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
