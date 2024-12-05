import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// Import your screen components here
import MainScreen from "./screens/MainScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AboutScreen from "./screens/AboutScreen";
import ListScreen from "./screens/ListScreen";
import { CoffeeShopsProvider } from "./context/CoffeeShopsContext";
import CustomDrawerContent from "./components/CustomDrawerContent";
const Drawer = createDrawerNavigator();

const App = () => {
  return (
    <CoffeeShopsProvider>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Map"
          drawerContent={(props) => <CustomDrawerContent {...props} />} // Use custom drawer content
          screenOptions={{
            headerStyle: {
              backgroundColor: "#1E3237", // Custom header color
            },
            headerTintColor: "#F0B23F", // Custom header text/icon color
          }}
        >
          <Drawer.Screen name="Map" component={MainScreen} />
          <Drawer.Screen name="List" component={ListScreen} />
          <Drawer.Screen name="About" component={AboutScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </CoffeeShopsProvider>
  );
};

export default App;
