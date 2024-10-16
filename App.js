import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
// Import your screen components here
import MainScreen from "./screens/MainScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AboutScreen from "./screens/AboutScreen";
import ListScreen from "./screens/ListScreen";
import { CoffeeShopsProvider } from "./context/CoffeeShopsContext";
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const CustomDrawerContent = ({ navigation }) => (
  <View style={styles.drawerContainer}>
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

const MainStack = () => (
  <Stack.Navigator
    screenOptions={({ navigation }) => ({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{ marginLeft: 15 }}
        >
          <Feather name="menu" size={24} color="#F0B23F" />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: "#1E3237",
      },
      headerTintColor: "#F0B23F",
    })}
  >
    <Stack.Screen
      name="MainScreen"
      component={MainScreen}
      options={{ title: "MPLS Coffee" }}
    />
  </Stack.Navigator>
);

const App = () => {
  return (
    <CoffeeShopsProvider>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            drawerStyle: {
              backgroundColor: "#1E3237",
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
  drawerItem: {
    padding: 16,
  },
  drawerItemText: {
    color: "#F0B23F",
    fontSize: 16,
  },
});

export default App;
