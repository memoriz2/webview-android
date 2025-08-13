import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import LocationPermission from "./components/LocationPermission";
import WebViewComponent from "./components/WebView";

const Tab = createBottomTabNavigator();

export default function App() {
  console.log("App.tsx 렌더링 시작");

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#2196F3" />
      <Tab.Navigator
        initialRouteName="WebView"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === "Location") {
              iconName = focused ? "location" : "location-outline";
            } else if (route.name === "WebView") {
              iconName = focused ? "globe" : "globe-outline";
            } else {
              iconName = "help-outline";
            }

            console.log(`탭 아이콘 렌더링: ${route.name}, focused: ${focused}`);
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#2196F3",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        })}
      >
        <Tab.Screen
          name="WebView"
          component={WebViewComponent}
          options={{
            title: "웹뷰",
            tabBarLabel: "웹뷰",
          }}
          listeners={{
            tabPress: () => console.log("웹뷰 탭 클릭됨"),
            focus: () => console.log("웹뷰 탭 포커스됨"),
          }}
        />
        <Tab.Screen
          name="Location"
          component={LocationPermission}
          options={{
            title: "위치 권한",
            tabBarLabel: "위치 권한",
          }}
          listeners={{
            tabPress: () => console.log("위치 권한 탭 클릭됨"),
            focus: () => console.log("위치 권한 탭 포커스됨"),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
