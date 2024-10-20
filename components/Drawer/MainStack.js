import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import MainScreen from "../../screens/MainScreen";

const Stack = createStackNavigator();

const MainStack = () => {
  return (
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
};

export default MainStack;
