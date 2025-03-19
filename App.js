import React, { useState, useEffect } from "react";
import { Appbar } from "react-native-paper";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider, Button, Avatar, Card, Icon } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Inbound from "./screens/Inbound";
import Enquiry from "./screens/Enquiry";
import Settings from "./screens/Settings";
import BlueToothPrint from "./screens/BlueToothPrinter";

function HomeScreen({ navigation }) {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title=" WMS m.i." />
        <Appbar.Action
          icon="bluetooth"
          onPress={() => navigation.navigate("Printing")}
        />
        <Appbar.Action
          icon="cog-outline"
          onPress={() => navigation.navigate("Settings")}
        />
      </Appbar.Header>
      <View className="flex justify-center h-4/6 w-full items-center space-y-3">
        <View className="flex flex-row w-3/4 justify-between">
          <CardBox
            title="Inbound"
            subTitle="Inbound Scanning"
            icon="qrcode-scan"
            onPress={() => navigation.navigate("Inbound")}
          />
          <CardBox
            title="Stock Inquiry"
            subTitle="Details & Location"
            icon="magnify"
            onPress={() => navigation.navigate("Enquiry")}
          />
        </View>
        <View className="flex flex-row w-3/4 justify-between">
          <CardBox
            title="Binning"
            subTitle="Put-away process"
            icon="bluetooth"
            onPress={() => navigation.navigate("UnderConstruction")}
          />
          <CardBox
            title="Picking"
            subTitle="Picking process"
            icon="transit-connection-variant"
            onPress={() => navigation.navigate("UnderConstruction")}
          />
        </View>
        <View className="flex flex-row w-3/4 justify-between">
          <CardBox
            title="Bluetooth"
            subTitle="Bluetooth Printer"
            icon="bluetooth"
            onPress={() => navigation.navigate("Printing")}
          />
          <CardBox
            title="Test API"
            subTitle="Test API Settings"
            icon="transit-connection-variant"
            onPress={() => navigation.navigate("Fetch")}
          />
        </View>
      </View>
    </>
  );
}

const CardBox = ({ onPress, title, subTitle, icon }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      className="bg-yellow-500 rounded-lg"
    >
      <View className="flex flex-row justify-center items-center p-2">
        <Icon source={icon} size={60} color="#fff" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{subTitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
    marginVertical: 10,
  },
  icon: {
    width: 60,
    height: 60,
    margin: 10,
  },
  image: {
    width: 200,
    height: 200,
    margin: 10,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 14,
    color: "#777",
  },
});

function FetchSample() {
  const [resultString, setResultString] = useState("hello");
  const [url, setUrl] = useState("");
  const retrieveStorage = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (error) {
      setMessage("Error getting settings.");
      showSnack();
    }
  };


  const fetchDataWithFetch = async () => {
    try {
      const requestUrl = `${url}/api/wms?id=T14001`;
      console.log(`Fetching data from: ${requestUrl}`);
      const response = await fetch(requestUrl);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Handle the data received from the API
      setResultString(JSON.stringify(data, null, 2));
    } catch (error) {
      // Handle errors
      setResultString(JSON.stringify(error, null, 2));
      console.error("Error:", error);
    }
  };

  const fetchDataWithAxios = async () => {
    const myAxiosInstance = axios.create({
      baseURL: url,
      timeout: 5000, // set a timeout value
      // other configurations...
    });

    try {
      const response = await myAxiosInstance.get("/api/wms?id=T14001");
      const data = response.data;
      setResultString(JSON.stringify(data, null, 2));
      // Handle the data received from the API
      console.log(data);
    } catch (error) {
      // Handle errors
      setResultString(JSON.stringify(error, null, 2));
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const setdata = async () => {
      const setdata = await retrieveStorage("userData");
      if (setdata) {
        setUrl(setdata.baseurl);
      }
    };
    setdata();
  }, []);

  return (
    <View className="flex justify-center h-full w-full items-center space-y-2">
      <Text>{`URL: ${url}`}</Text>
      <Text>{resultString}</Text>
      <Button icon="cog" mode="contained" onPress={() => fetchDataWithFetch()}>
        Fetch Sample
      </Button>
      <Button icon="cog" mode="contained" onPress={() => fetchDataWithAxios()}>
        Axios Sample
      </Button>
    </View>
  );
}


function UnderConstruction() {
  return (
    <View className="flex justify-center h-full w-full items-center space-y-2">
      <Text>SORRY, UNDER CONSTRUCTION</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: "WMS Mobile Interface v1.0.1a",
              headerShown: false,
            }}
          />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="UnderConstruction" component={UnderConstruction} options={{ title: "Under Construction", headerShown: true }} />
          <Stack.Screen name="Fetch" component={FetchSample} options={{ title: "Testing API", headerShown: true }} />
          <Stack.Screen name="Printing" component={BlueToothPrint} options={{ title: "Bluetooth Printer", headerShown: true }}/>
          <Stack.Screen
            name="Enquiry"
            component={Enquiry}
            options={{ title: "Stock Inquiry", headerShown: true }}
          />
          <Stack.Screen
            name="Inbound"
            component={Inbound}
            options={{ title: "Inbound Scanning" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
