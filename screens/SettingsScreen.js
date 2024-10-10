import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const SettingsScreen = ({ navigation }) => {
  const [locationPermission, setLocationPermission] = useState("unknown");
  const [locationServiceEnabled, setLocationServiceEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const checkLocationSettings = useCallback(async () => {
    let serviceEnabled = await Location.hasServicesEnabledAsync();
    setLocationServiceEnabled(serviceEnabled);

    if (!serviceEnabled) {
      setLocationPermission("disabled");
      setCurrentLocation(null);
      return;
    }

    let { status } = await Location.getForegroundPermissionsAsync();
    setLocationPermission(status);

    if (status === "granted") {
      getCurrentLocation();
    } else {
      setCurrentLocation(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkLocationSettings();
    }, [checkLocationSettings])
  );

  const getCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
    } catch (error) {
      console.log("Error getting current location:", error);
      Alert.alert("Error", "Unable to get current location. Please try again.");
    }
  };

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status === "granted") {
        getCurrentLocation();
      }
    } catch (error) {
      console.log("Error requesting location permission:", error);
      Alert.alert(
        "Error",
        "Unable to request location permission. Please try again."
      );
    }
  };

  const openSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  const renderLocationStatus = () => {
    if (!locationServiceEnabled) {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Location services are disabled on your device.
          </Text>
          <TouchableOpacity style={styles.button} onPress={openSettings}>
            <Text style={styles.buttonText}>Open Device Settings</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (locationPermission) {
      case "granted":
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Location access is enabled for this app.
            </Text>
          </View>
        );
      case "denied":
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Location access is denied for this app.
            </Text>
            <TouchableOpacity style={styles.button} onPress={openSettings}>
              <Text style={styles.buttonText}>Open App Settings</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Location permission has not been requested yet.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={requestLocationPermission}
            >
              <Text style={styles.buttonText}>Enable Location Access</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Settings</Text>

      {renderLocationStatus()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1E3237",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: "#F0B23F",
    fontSize: 18,
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F0B23F",
    marginBottom: 20,
  },
  statusContainer: {
    marginTop: 20,
  },
  statusText: {
    fontSize: 16,
    color: "#4EBAAA",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    color: "#F0B23F",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#4EBAAA",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#1E3237",
    fontSize: 16,
    textAlign: "center",
  },
});

export default SettingsScreen;
