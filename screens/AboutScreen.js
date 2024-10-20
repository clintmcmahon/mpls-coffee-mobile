import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const AboutScreen = () => {
  const handleEmailPress = () => {
    Linking.openURL("mailto:info@parkasoftware.com");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About MPLS Coffee</Text>

        <Text style={styles.sectionTitle}>What Is This?</Text>
        <Text style={styles.text}>
          MPLS Coffee is a guide to find the closest cup of coffee to your
          location. The app helps people who want coffee find cups of joe in the
          Twin Cities.
        </Text>

        <Text style={styles.sectionTitle}>Features</Text>
        <Text style={styles.text}>
          • Interactive map of coffee shops in Minneapolis{"\n"}• Detailed
          information on each coffee shop{"\n"}• User ratings and reviews{"\n"}•
          Open hours and contact details{"\n"}• Directions to your chosen coffee
          destination{"\n"}• "Good Coffee" filter for discerning tastes{"\n"}•
          Real-time list of currently open coffee shops
        </Text>

        <Text style={styles.sectionTitle}>Good Coffee Filter</Text>
        <Text style={styles.text}>
          We have a "Good Coffee" filter that helps you find shops that truly
          care about making coffee that's good. This feature highlights
          establishments known for their high-quality beans, expert baristas,
          and commitment to the art of coffee-making. Say goodbye to mediocre
          brews and hello to exceptional coffee experiences! Turn it off if you
          just need some caffeine.
        </Text>

        <Text style={styles.sectionTitle}>Open Now Feature</Text>
        <Text style={styles.text}>
          Need coffee right away? Our "Open Now" list shows you all the coffee
          shops currently serving in real-time. No more disappointment from
          arriving at a closed shop – we've got you covered with up-to-date
          information on operating hours.
        </Text>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.text}>
          We're passionate about connecting coffee lovers with local businesses
          and helping you discover new favorite spots in Minneapolis. Whether
          you're a resident or just visiting, MPLS Coffee is your trusted
          companion for all things coffee in the city.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleEmailPress}
        >
          <Feather name="mail" size={20} color="#1E3237" />
          <Text style={styles.contactButtonText}>hello@mplscoffee.com</Text>
        </TouchableOpacity>
        <Text style={styles.text}>
          We'd love to hear your feedback, suggestions, or any questions you
          might have about MPLS Coffee. Don't hesitate to reach out!
        </Text>

        <Text style={styles.copyright}>
          © 2024 Parka Software Co. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3237",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E3237",
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#1E3237",
    marginBottom: 15,
    lineHeight: 24,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0B23F",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  contactButtonText: {
    color: "#1E3237",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  copyright: {
    fontSize: 14,
    color: "#1E3237",
    textAlign: "center",
    marginTop: 30,
    fontStyle: "italic",
  },
});

export default AboutScreen;
