import React from "react";
import { View, StyleSheet, Text } from "react-native";
const ShopHours = ({ selectedShop }) => {
  // Get current day as a string (e.g., "Monday")
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = daysOfWeek[new Date().getDay()];
  if (selectedShop.weekdayDescriptions) {
    return (
      <View>
        <Text style={styles.sectionTitle}>Hours</Text>
        {selectedShop.weekdayDescriptions.split("|").map((day, index) => {
          // Extract the day name from the text (e.g., "Monday" from "Monday: 6:00 AM – 6:00 PM")
          const dayName = day.split(":")[0];

          // Determine if the current day matches to apply the highlight
          const isToday = dayName.trim() === currentDay;

          return (
            <Text
              key={index}
              style={[styles.hoursText, isToday && styles.highlight]}
            >
              {day.trim()}
            </Text>
          );
        })}
      </View>
    );
  } else {
    return null;
  }
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#F0B23F",
  },
  hoursText: {
    fontSize: 16,
    marginVertical: 2,
    color: "#4EBAAA",
    marginBottom: 4,
  },
  highlight: {
    color: "#F0B23F",

    fontWeight: "bold",
  },
});

export default ShopHours;
