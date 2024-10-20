import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
// Import your screen components here
import SettingsScreen from "./screens/SettingsScreen";
import AboutScreen from "./screens/AboutScreen";
import ListScreen from "./screens/ListScreen";
import { CoffeeShopsProvider } from "./context/CoffeeShopsContext";
import MainStack from "./components/Drawer/MainStack";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = ({ navigation }) => (
  <View style={styles.drawerContainer}>
    <View style={styles.appHeader}>
      <Image source={require("./assets/icon.png")} style={styles.appIcon} />
      <Text style={styles.appName}>MPLS Coffee</Text>
    </View>
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={() => navigation.navigate("Home")}
    >
      <Text style={styles.drawerItemText}>Map View</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={() => navigation.navigate("List")}
    >
      <Text style={styles.drawerItemText}>List View</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={() => navigation.navigate("About")}
    >
      <Text style={styles.drawerItemText}>About</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={() => navigation.navigate("Settings")}
    >
      <Text style={styles.drawerItemText}>Settings</Text>
    </TouchableOpacity>
  </View>
);

const App = () => {
  return (
    <CoffeeShopsProvider>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            drawerStyle: {
              backgroundColor: "#F0B23F",
              width: 240,
            },
            drawerLabelStyle: {
              color: "#F0B23F",
            },
            headerStyle: {
              backgroundColor: "#1E3237",
            },
            headerTintColor: "#F0B23F",
          }}
        >
          <Drawer.Screen
            name="Home"
            component={MainStack}
            options={{ headerShown: false }}
          />
          <Drawer.Screen name="List" component={ListScreen} />
          <Drawer.Screen name="About" component={AboutScreen} />
          <Drawer.Screen name="Settings" component={SettingsScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </CoffeeShopsProvider>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#1E3237",
  },
  appHeader: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40, // Space around the app icon and name
    backgroundColor: "#1E3237", // Dark background for header (similar to Apple style)
    borderBottomWidth: 1,
    borderBottomColor: "#2C3E50", // Subtle border to separate from menu
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 10,
  },
  appName: {
    color: "#F0B23F",
    fontSize: 22,
    fontWeight: "bold",
  },
  drawerItem: {
    padding: 16,
  },
  drawerItemText: {
    color: "#F0B23F",
    fontSize: 20,
  },
});

export default App;
