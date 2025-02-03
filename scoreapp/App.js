import React, { useReducer } from "react";
// import { NavigationContainer } from "@react-navigation/native";
import {NavigationContainer} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import NewsFeed from "./Components/Boards/NewsFeed";
import Events from "./Components/User/TroLySV/Events";
import Contents from "./Components/Boards/Contents";
import BaoThieu from "./Components/User/TroLySV/BaoThieu";
import EventsSV from "./Components/User/Students/EventsSV";
import MyUserReducer from "./configs/UserReducer"
import { MyUserContext, MyDispatchContext } from "./configs/UserContext"
import Login from "./Components/User/Login";
import ManageEvents from "./Components/User/TroLySV/QLHoatDong/ManageEvents";
import MainTGHD from "./Components/User/Students/ThamGiaHoatDong/MainTGHD";
import ActivityDetail from "./Components/User/Students/ThamGiaHoatDong/ActivityDetail";
import JoinedActivities from "./Components/User/Students/ThamGiaHoatDong/JoinedActivities";
import Register from "./Components/User/Register";
import UserProfile from "./Components/User/UserProfile";
import ReportMissing from "./Components/User/Students/ThamGiaHoatDong/MissingReport";
import MissingReport from "./Components/User/Students/ThamGiaHoatDong/MissingReport";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator cho các màn hình chính
const StackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NewsFeed" component={NewsFeed} />
    <Stack.Screen name="Contents" component={Contents} />
  </Stack.Navigator>
);

const UserProfileNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="UserProfile" component={UserProfile} />
    
  </Stack.Navigator>
);

// Stack Navigator cho Events của trợ lý sinh viên
const EventsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Events" component={Events} />
    <Stack.Screen name="BaoThieu" component={BaoThieu} />
    <Stack.Screen name="ManageEvents" component={ManageEvents} />
  </Stack.Navigator>
);

// Stack Navigator cho Events của sinh viên
const StudentEventsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Events" component={EventsSV} />
    {/* <Stack.Screen name="MainTGHD" component={MainTGHD} /> */}
    <Stack.Screen name="ActivityDetail" component={ActivityDetail} />
    <Stack.Screen name="JoinedActivities" component={JoinedActivities} />
    
  </Stack.Navigator>
);

const MainStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTGHD" component={MainTGHD} />
    <Stack.Screen name="ActivityDetail" component={ActivityDetail} />
    <Stack.Screen name="MissingReport" component={MissingReport} />
  </Stack.Navigator>
);

// Tab Navigator chính
const TabNavigatorSV = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={MainStackNavigator} />
    <Tab.Screen name="Events" component={StudentEventsStackNavigator} />
    <Tab.Screen name="UserProfile" component={UserProfileNavigator} />
  </Tab.Navigator>
);

const TabNavigatorTLSV = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={StackNavigator} />
    <Tab.Screen name="Events" component={EventsStackNavigator} />
    <Tab.Screen name="UserProfile" component={UserProfileNavigator} />
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

  const userRole = user ? user.user.role : null;

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <PaperProvider>
          <NavigationContainer>
            {/* Điều hướng dựa trên trạng thái của user */}
            {user === null ? (
              <AuthNavigator />  // Người dùng chưa đăng nhập, điều hướng tới AuthNavigator
            ) : userRole === 'Assistant' ? (
              <TabNavigatorTLSV />  // Nếu role là admin, điều hướng tới AdminTabNavigator
            ) : (
              <TabNavigatorSV />  // Nếu là người dùng bình thường, điều hướng tới TabNavigator
            )}
            {/* {<TabNavigator />} */}
          </NavigationContainer>
        </PaperProvider>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
}
