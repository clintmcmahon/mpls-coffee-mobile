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
  Image,
} from "react-native";
import { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Feather } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import LoadingIndicator from "../components/LoadingIndicator";
import CoffeeShopsContext from "../context/CoffeeShopsContext";
import * as utils from "../utils/functions";
import ShopHours from "../components/ShopHours";
import AISummary from "../components/AISummary";
import MapView from "react-native-map-clustering";
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
  const [isGoodCoffeeEnabled, setIsGoodCoffeeEnabled] = useState(false);
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
        minZoom={5}
        maxZoom={10}
        minPoints={4}
        clusterColor="#1E3237"
      >
        {filteredShops.map((shop) => (
          <Marker
            key={shop.placeId}
            coordinate={{ latitude: shop.latitude, longitude: shop.longitude }}
            onPress={() => handleMarkerPress(shop)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.iconContainer}>
                <FontAwesome name="coffee" size={18} color="#FFFFFF" />
              </View>
              <Text
                style={styles.shopLabel}
                numberOfLines={2} // Limit to one line
                ellipsizeMode="tail" // Show ellipsis for overflow
              >
                {shop.name}
              </Text>
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
          <Text style={styles.filterText}>Specialty Coffee</Text>
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
                  <View style={styles.headerContainer}>
                    <Text style={styles.modalTitle}>{selectedShop.name}</Text>
                    <View style={styles.ratingContainer}>
                      <View style={styles.starContainer}>
                        <Feather name="star" size={14} color="#F0B23F" />
                        <Text style={styles.ratingText}>
                          {selectedShop.rating.toFixed(1)}
                        </Text>
                      </View>
                      <Text style={styles.totalRatingsText}>
                        ({selectedShop.userRatingsTotal})
                      </Text>
                      <Text style={styles.separator}>•</Text>
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

                      {selectedShop.website && (
                        <>
                          <Text style={styles.separator}>•</Text>
                          <TouchableOpacity
                            onPress={() =>
                              Linking.openURL(selectedShop.website)
                            }
                          >
                            <Text style={styles.website}>Website</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>

                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: selectedShop.imageUrl }}
                      style={styles.shopImage}
                    />
                  </View>
                  <AISummary
                    overview={selectedShop.aiOverview}
                    description={selectedShop.aiDescription}
                  />

                  <Text style={styles.sectionTitle}>Address</Text>
                  <Text style={[{ paddingBottom: 10 }, styles.address]}>
                    {selectedShop.address}
                  </Text>

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
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "95%",
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#F0B23F",
    marginLeft: 4,
  },
  totalRatingsText: {
    fontSize: 16,
    color: "#4EBAAA",
  },
  separator: {
    marginLeft: 6,
    marginRight: 6,
    color: "#F0B23F",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F0B23F",
    marginBottom: 12,
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
    color: "#F0B23F",
  },

  openStatus: {
    fontSize: 16,
    color: "#F0B23F",
  },

  markerContainer: {
    alignItems: "center", // Center icon and text
    justifyContent: "center",
  },
  iconContainer: {
    backgroundColor: "#1E3237", // Icon background color
    borderRadius: 20, // Rounded container for the icon
    padding: 10,
    shadowColor: "#000", // Add subtle shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  shopLabel: {
    marginTop: 6, // Space between the icon and text
    fontSize: 10,
    fontWeight: "600",
    color: "#1E3237", // Main text color (dark green)
    textAlign: "center",
    maxWidth: 125, // Limit label width

    // White Outline
    textShadowColor: "#FFFFFF",
    textShadowOffset: { width: -1, height: -1 }, // Top-left
    textShadowRadius: 1,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 1, height: 1 }, // Bottom-right
    shadowOpacity: 0.7,
  },
});

export default MainScreen;
