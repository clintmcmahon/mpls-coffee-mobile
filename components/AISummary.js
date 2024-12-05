import React from "react";
import { View, StyleSheet, Text } from "react-native";
const AISummary = ({ overview, description }) => {
  const getDescription = () => {
    if (description) {
      return description
        .split("\n")
        .map((line) => line.trim() + "\n")
        .join("\n");
    } else {
      return null;
    }
  };
  const enhancedDescription = getDescription();
  return (
    <>
      {overview && overview !== description && (
        <View style={{ marginBottom: 10 }}>
          <Text style={[styles.hoursText]}>{overview}</Text>
        </View>
      )}
      {description && description !== overview && (
        <View>
          <Text style={[styles.hoursText]}>{enhancedDescription}</Text>
        </View>
      )}
    </>
  );
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
  },
  highlight: {
    color: "#F0B23F",
    fontWeight: "bold",
  },
});

export default AISummary;
