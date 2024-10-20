import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Linking,
  Platform,
  Modal,
  ScrollView,
  Switch,
  Animated,
} from "react-native";
import MapView from "react-native-map-clustering";
import { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Feather } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import LoadingIndicator from "../components/LoadingIndicator";
import CoffeeShopsContext from "../context/CoffeeShopsContext";
import * as utils from "../utils/functions";
import ShopHours from "../components/ShopHours";

const { width, height } = Dimensions.get("window");

const MINNEAPOLIS_REGION = {
  latitude: 44.9778,
  longitude: -93.265,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const MainScreen = ({ navigation }) => {
  const [region, setRegion] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filteredShops, setFilteredShops] = useState([]);
  const [isOpenNowEnabled, setIsOpenNowEnabled] = useState(true);
  const [isGoodCoffeeEnabled, setIsGoodCoffeeEnabled] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState("unknown");

  const mapRef = useRef(null);
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const { coffeeShops, loading } = useContext(CoffeeShopsContext);

  useEffect(() => {
    const setupInitialLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({});
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(newRegion);
          setUserLocation(newRegion);
        } catch (error) {
          console.error("Error getting location:", error);
          setRegion(MINNEAPOLIS_REGION);
        }
      } else {
        setRegion(MINNEAPOLIS_REGION);
      }
    };

    setupInitialLocation();
  }, []);

  useEffect(() => {
    if (locationPermission === "granted") {
      startPulseAnimation();
    }
  }, [locationPermission]);

  useEffect(() => {
    filterOpenShops();
  }, [isOpenNowEnabled, coffeeShops, isGoodCoffeeEnabled]);

  const getUserLocation = async () => {
    if (locationPermission !== "granted") {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status !== "granted") return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setUserLocation(newRegion);
      return newRegion;
    } catch (error) {
      console.error("Error getting user location:", error);
    }
  };

  const centerOnUserLocation = async () => {
    const userRegion = await getUserLocation();
    if (userRegion) {
      mapRef.current?.animateToRegion(userRegion, 1000);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const filterOpenShops = () => {
    if (coffeeShops) {
      if (!isOpenNowEnabled && !isGoodCoffeeEnabled) {
        setFilteredShops(coffeeShops);
        return;
      }

      const now = new Date();
      const currentDay = now.getDay();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let openShops = coffeeShops;

      if (isOpenNowEnabled) {
        openShops = coffeeShops.filter((shop) => {
          const todayHours = shop.hours.find((h) => h.dayOfWeek === currentDay);
          if (!todayHours) return false;

          const openMinutes = utils.parseISODuration(todayHours.openTime);
          const closeMinutes = utils.parseISODuration(todayHours.closeTime);

          // Handle cases where closing time is on the next day
          if (closeMinutes < openMinutes) {
            return (
              currentMinutes >= openMinutes || currentMinutes <= closeMinutes
            );
          }

          return (
            currentMinutes >= openMinutes && currentMinutes <= closeMinutes
          );
        });
      }

      if (isGoodCoffeeEnabled) {
        openShops = openShops.filter((shop) => shop.isGood);
      }

      setFilteredShops(openShops);
    }
  };

  const handleMarkerPress = (shop) => {
    setSelectedShop(shop);
    setModalVisible(true);
  };

  const zoomIn = () => {
    mapRef.current?.animateToRegion(
      {
        ...region,
        latitudeDelta: region.latitudeDelta / 2,
        longitudeDelta: region.longitudeDelta / 2,
      },
      300
    );
  };

  const zoomOut = () => {
    mapRef.current?.animateToRegion(
      {
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      },
      300
    );
  };

  const openDirections = (shop) => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${shop.latitude},${shop.longitude}`;
    const label = shop.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  const renderUserLocationMarker = () => {
    if (!userLocation || locationPermission !== "granted") return null;

    const scale = pulseAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.3],
    });

    return (
      <Marker coordinate={userLocation}>
        <View style={styles.userLocationMarkerContainer}>
          <Animated.View
            style={[styles.userLocationMarkerPulse, { transform: [{ scale }] }]}
          />
          <View style={styles.userLocationMarkerDot} />
        </View>
      </Marker>
    );
  };

  if (loading || !region) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsCompass={true}
        showsScale={true}
        mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
        customMapStyle={Platform.OS === "android" ? androidMapStyle : mapStyle} // Adjusted for iOS and Android
        clusterColor="#1E3237"
      >
        {filteredShops.map((shop) => (
          <Marker
            key={shop.placeId}
            coordinate={{ latitude: shop.latitude, longitude: shop.longitude }}
            onPress={() => handleMarkerPress(shop)}
          >
            <View style={styles.markerContainer}>
              <FontAwesome name="coffee" size={24} color="#1E3237" />
              <Text style={styles.shopLabel}>{shop.name}</Text>
            </View>
          </Marker>
        ))}
        {renderUserLocationMarker()}
      </MapView>
      <View style={styles.filterContainer}>
        <BlurView intensity={80} tint="dark" style={styles.openNowContainer}>
          <Text style={styles.filterText}>Open Now</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#4EBAAA" }}
            thumbColor={isOpenNowEnabled ? "#F0B23F" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setIsOpenNowEnabled(!isOpenNowEnabled)}
            value={isOpenNowEnabled}
          />
        </BlurView>
        <BlurView intensity={80} tint="dark" style={styles.isGoodContainer}>
          <Text style={styles.filterText}>Good Coffee</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#4EBAAA" }}
            thumbColor={isGoodCoffeeEnabled ? "#F0B23F" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setIsGoodCoffeeEnabled(!isGoodCoffeeEnabled)}
            value={isGoodCoffeeEnabled}
          />
        </BlurView>
      </View>
      <View style={styles.bottomRightControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnUserLocation}
        >
          <FontAwesome name="location-arrow" size={24} color="#F0B23F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={zoomIn}>
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={zoomOut}>
          <Text style={styles.controlButtonText}>-</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Feather name="x" size={24} color="#F0B23F" />
            </TouchableOpacity>
            <ScrollView>
              {selectedShop && (
                <>
                  <Text style={styles.modalTitle}>{selectedShop.name}</Text>
                  <Text
                    style={[
                      styles.openStatus,
                      utils.isOpenNow(selectedShop)
                        ? styles.open
                        : styles.closed,
                    ]}
                  >
                    {utils.isOpenNow(selectedShop) ? "Open Now" : "Closed"}
                  </Text>
                  <Text style={styles.address}>{selectedShop.address}</Text>
                  {selectedShop.website && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(selectedShop.website)}
                    >
                      <Text style={styles.website}>Website</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.ratingContainer}>
                    <View style={styles.starContainer}>
                      <Feather name="star" size={20} color="#F0B23F" />
                      <Text style={styles.ratingText}>
                        {selectedShop.rating.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.totalRatingsText}>
                      ({selectedShop.userRatingsTotal} ratings)
                    </Text>
                  </View>
                  <ShopHours selectedShop={selectedShop} />
                  <TouchableOpacity
                    style={styles.directionsButton}
                    onPress={() => openDirections(selectedShop)}
                  >
                    <Text style={styles.directionsButtonText}>
                      Get Directions
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E3237",
  },
  map: {
    width,
    height,
  },
  bottomRightControls: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#1E3237",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#4EBAAA",
  },
  zoomButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F0B23F",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30, 50, 55, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E3237",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F0B23F",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#4EBAAA",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F0B23F",
    marginLeft: 4,
  },
  totalRatingsText: {
    fontSize: 16,
    color: "#4EBAAA",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F0B23F",
    marginBottom: 12,
    marginTop: 20,
  },
  hoursText: {
    fontSize: 16,
    color: "#4EBAAA",
    marginBottom: 4,
  },
  directionsButton: {
    backgroundColor: "#4EBAAA",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 20,
  },
  directionsButtonText: {
    color: "#1E3237",
    fontSize: 18,
    fontWeight: "bold",
  },
  filterContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 10,
    zIndex: 10,
    width: "100%",
    flexDirection: "row",
  },
  openNowContainer: {
    padding: 10,
    width: "50%",
  },
  isGoodContainer: {
    padding: 10,
    width: "50%",
  },
  filterText: {
    color: "#F0B23F",
    marginRight: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  userLocationMarkerContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  userLocationMarkerPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 122, 255, 0.3)",
  },
  userLocationMarkerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgb(0, 122, 255)",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  settingsButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#1E3237",
    borderRadius: 20,
    padding: 10,
  },
  bottomRightControls: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#1E3237",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E3237",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F0B23F",
  },
  address: {
    fontSize: 16,
    color: "#4EBAAA",
    marginBottom: 5,
  },
  website: {
    fontSize: 16,
    color: "#4EBAAA",
    textDecorationLine: "underline",
    marginBottom: 8,
  },

  openStatus: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  open: {
    color: "#4EBAAA",
  },
  closed: {
    color: "#F0B23F",
  },
  markerContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  shopLabel: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: "400",
    color: "#1E3237",
    maxWidth: 150,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});

const mapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#1E3237",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#F0B23F",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1E3237",
      },
    ],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#4EBAAA",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#64779e",
      },
    ],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#4b6878",
      },
    ],
  },
  {
    featureType: "landscape.man_made",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#334e87",
      },
    ],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [
      {
        color: "#023e58",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#283d6a",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#6f9ba5",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1d2c4d",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#023e58",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#3C7680",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#304a57",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#98a5be",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1d2c4d",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#2c6675",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#255763",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#b0d5ce",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#023e58",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#98a5be",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1d2c4d",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#283d6a",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#3a4762",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#0e1626",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#4e6d70",
      },
    ],
  },
];

const androidMapStyle = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels.text",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#f1f1f1" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#e0e0e0" }],
  },
];

export default MainScreen;
