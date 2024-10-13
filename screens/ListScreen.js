import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Switch,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { BlurView } from "expo-blur";
import LoadingIndicator from "../components/LoadingIndicator";

const API_URL = "https://api.mplscoffee.com/odata/CoffeeShops?$expand=hours";

const ListScreen = () => {
  const [coffeeShops, setCoffeeShops] = useState(null);
  const [filteredShops, setFilteredShops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isOpenNowEnabled, setIsOpenNowEnabled] = useState(true);
  const [isGoodCoffeeEnabled, setIsGoodCoffeeEnabled] = useState(true);

  useEffect(() => {
    fetchCoffeeShops();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (coffeeShops && coffeeShops.length > 0 && userLocation) {
      filterShops();
    }
  }, [isOpenNowEnabled, coffeeShops, userLocation, isGoodCoffeeEnabled]);

  const fetchCoffeeShops = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setCoffeeShops(data.value);
    } catch (error) {
      console.error("Error fetching coffee shops:", error);
    }
  };

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Radius of the earth in miles
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in miles
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const isOpenNow = (shop) => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todayHours = shop.hours.find((h) => h.dayOfWeek === currentDay);
    if (!todayHours) return false;

    const openMinutes = parseISODuration(todayHours.openTime);
    const closeMinutes = parseISODuration(todayHours.closeTime);

    if (closeMinutes < openMinutes) {
      // Open past midnight
      return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  };

  const filterShops = () => {
    if (coffeeShops) {
      let filtered = coffeeShops.map((shop) => ({
        ...shop,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          shop.latitude,
          shop.longitude
        ),
      }));

      if (isOpenNowEnabled) {
        filtered = filtered.filter((shop) => isOpenNow(shop));
      }

      if (isGoodCoffeeEnabled) {
        filtered = filtered.filter((shop) => shop.isGood);
      }

      filtered.sort((a, b) => a.distance - b.distance);
      setFilteredShops(filtered);
    }
  };

  const parseISODuration = (duration) => {
    const matches = duration.match(/PT(\d+)H(?:(\d+)M)?/);

    if (matches) {
      const hours = parseInt(matches[1], 10);
      const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
      return hours * 60 + minutes;
    }
    return 0;
  };

  const formatTime = (isoDuration) => {
    const minutes = parseISODuration(isoDuration);
    let hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${hours}:${mins.toString().padStart(2, "0")} ${ampm}`;
  };

  const getCurrentDayHours = (shop) => {
    const currentDay = new Date().getDay();
    const todayHours = shop.hours.find((h) => h.dayOfWeek === currentDay);
    if (todayHours) {
      const openTime = formatTime(todayHours.openTime);
      const closeTime = formatTime(todayHours.closeTime);

      return `${openTime} - ${closeTime}`;
    }
    return "Closed";
  };
  const formatDistance = (distance) => {
    if (distance == null) return "N/A";

    const formatted = distance.toFixed(2);
    if (distance < 1000) {
      return `${formatted} mi`;
    } else {
      const parts = formatted.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${parts.join(".")} mi`;
    }
  };

  const openDirections = (shop) => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${shop.latitude},${shop.longitude}`;
    const label = encodeURIComponent(shop.name);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url);
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
        {item.website && (
          <TouchableOpacity onPress={() => Linking.openURL(item.website)}>
            <Text style={styles.website}>Website</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.hours}>
          Hours today: {getCurrentDayHours(item)}
        </Text>
        <Text
          style={[
            styles.openStatus,
            isOpenNow(item) ? styles.open : styles.closed,
          ]}
        >
          {isOpenNow(item) ? "Open Now" : "Closed"}
        </Text>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={() => openDirections(item)}
        >
          <Feather name="map-pin" size={16} color="#4EBAAA" />
          <Text style={styles.directionsText}>Directions</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.distanceContainer}>
        <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
      </View>
    </View>
  );
  if (!coffeeShops) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.filterContainer}>
        <Text style={styles.filterText}>Open Now</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#4EBAAA" }}
          thumbColor={isOpenNowEnabled ? "#F0B23F" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setIsOpenNowEnabled(!isOpenNowEnabled)}
          value={isOpenNowEnabled}
        />
      </BlurView>
      <BlurView intensity={80} tint="dark" style={styles.filterContainer}>
        <Text style={styles.filterText}>Show Good Coffee</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#4EBAAA" }}
          thumbColor={isGoodCoffeeEnabled ? "#F0B23F" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setIsGoodCoffeeEnabled(!isGoodCoffeeEnabled)}
          value={isGoodCoffeeEnabled}
        />
      </BlurView>
      <FlatList
        data={filteredShops}
        renderItem={renderItem}
        keyExtractor={(item) => item.placeId}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E3237",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(30, 50, 55, 0.7)",
    padding: 10,
    zIndex: 10,
  },
  filterText: {
    color: "#F0B23F",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "#2A454C",
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  listItemContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F0B23F",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "#4EBAAA",
    marginBottom: 4,
  },
  website: {
    fontSize: 14,
    color: "#4EBAAA",
    textDecorationLine: "underline",
    marginBottom: 8,
  },
  hours: {
    fontSize: 14,
    color: "#4EBAAA",
    marginBottom: 4,
  },
  openStatus: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  open: {
    color: "#4EBAAA",
  },
  closed: {
    color: "#F0B23F",
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  directionsText: {
    fontSize: 14,
    color: "#4EBAAA",
    marginLeft: 4,
  },
  distanceContainer: {
    justifyContent: "center",
    marginLeft: 16,
  },
  distance: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#F0B23F",
  },
});

export default ListScreen;
