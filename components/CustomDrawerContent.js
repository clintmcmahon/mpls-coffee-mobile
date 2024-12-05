import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

// Custom Drawer Content with an App Icon
const CustomDrawerContent = (props) => {
  return (
    <View style={styles.drawerContainer}>
      {/* Header with App Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={require("../assets/logo.png")} // Replace with the path to your icon
          style={styles.icon}
        />
        <Text style={styles.appName}>MPLS Coffee</Text>
      </View>

      {/* Drawer Items */}
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => props.navigation.navigate("Map")}
      >
        <Text style={styles.drawerItemText}>Map View</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => props.navigation.navigate("List")}
      >
        <Text style={styles.drawerItemText}>List View</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => props.navigation.navigate("About")}
      >
        <Text style={styles.drawerItemText}>About</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#1E3237", // Drawer background color
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40, // Space around the icon and app name
    paddingBottom: 20,
    backgroundColor: "#1E3237", // Background color for the icon header
    borderBottomWidth: 1,
    borderBottomColor: "#1E3237",
    marginTop: 40,
    borderBottomColor: "#2C3E50",
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 20, // Rounded icon for a modern look
  },
  appName: {
    color: "#F0B23F", // App name color
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  drawerItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  drawerItemText: {
    color: "#F0B23F",
    fontSize: 18,
  },
});
