import React, { useReducer } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import NewsFeed from "./Components/Boards/NewsFeed";
import Events from "./Components/User/TroLySV/Events";
import Contents from "./Components/Boards/Contents";
import BaoThieu from "./Components/User/TroLySV/BaoThieu";
import MyUserReducer from "./configs/UserReducer"
import { MyUserContext, MyDispatchContext } from "./configs/UserContext"
import Login from "./Components/User/Login";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator cho các màn hình chính
const StackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NewsFeed" component={NewsFeed} />
    <Stack.Screen name="Contents" component={Contents} />
  </Stack.Navigator>
);

// Stack Navigator cho Events
const EventsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Events" component={Events} />
    <Stack.Screen name="BaoThieu" component={BaoThieu} />
  </Stack.Navigator>
);

// Tab Navigator chính
const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={StackNavigator} />
    <Tab.Screen name="Events" component={EventsStackNavigator} />
  </Tab.Navigator>
);

// Stack Navigator cho Đăng nhập và Đăng ký
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* <Stack.Screen name="Login" component={Login} /> */}
    <Stack.Screen name="Login" component={Login} />
  </Stack.Navigator>
);

// App chính
export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <PaperProvider>
          <NavigationContainer>
            {/* Điều hướng dựa trên trạng thái của user */}
            {user === null ? <AuthNavigator /> : <TabNavigator />}
          </NavigationContainer>
        </PaperProvider>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
}
