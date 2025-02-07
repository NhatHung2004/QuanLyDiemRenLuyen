import React, { useEffect, useReducer, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon, Provider as PaperProvider } from "react-native-paper";
import NewsFeed from "./Components/Boards/NewsFeed";
import Events from "./Components/User/TroLySV/Events";
import Contents from "./Components/Boards/Contents";
import EventsSV from "./Components/User/Students/EventsSV";
import MyUserReducer from "./configs/UserReducer";
import { MyUserContext, MyDispatchContext } from "./configs/UserContext";
import Login from "./Components/User/Login";
import ManageEvents from "./Components/User/TroLySV/QLHoatDong/ManageEvents";
import MainTGHD from "./Components/User/Students/ThamGiaHoatDong/MainTGHD";
import ActivityDetail from "./Components/User/Students/ThamGiaHoatDong/ActivityDetail";
import JoinedActivities from "./Components/User/Students/ThamGiaHoatDong/JoinedActivities";
import Register from "./Components/User/Register";
import UserProfile from "./Components/User/UserProfile";
import ReportMissing from "./Components/User/Students/ThamGiaHoatDong/MissingReport";
import MissingReport from "./Components/User/Students/ThamGiaHoatDong/MissingReport";
import MissingReportActivities from "./Components/User/TroLySV/QLBaoThieu/MissingReportActivities";
import MRADetail from "./Components/User/TroLySV/QLBaoThieu/MRADetail";
import TrainingScoreStatistics from "./Components/User/Students/ThamGiaHoatDong/TrainingScoreStatistics";
import DisciplineScore from "./Components/User/TroLySV/Statics/DisciplineScore";
import DisciplineScoreUpdate from "./Components/User/TroLySV/QLDRL/DisciplineScoreUpdate";
import UserManagement from "./Components/User/TroLySV/QLUsers/UserManagement";
import EventsAdmin from "./Components/User/TroLySV/EventsAdmin";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const UserProfileNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="UserProfile" component={UserProfile} />
    <Stack.Screen name="Login" component={Login} />
  </Stack.Navigator>
);

// Stack Navigator cho Events của trợ lý sinh viên
const EventsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="Events" component={Events} />
    <Stack.Screen name="MissingReportActivities" component={MissingReportActivities} />
    <Stack.Screen name="MRADetail" component={MRADetail} />
    <Stack.Screen name="ManageEvents" component={ManageEvents} />
    <Stack.Screen name="TrainingScoreStatistics" component={TrainingScoreStatistics} />
    <Stack.Screen name="DisciplineScoreUpdate" component={DisciplineScoreUpdate} />
    <Stack.Screen name="UserManagement" component={UserManagement} />
  </Stack.Navigator>
);

// Stack Navigator cho Events của admin
const EventsStackNavigatorAdmin = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="Events" component={EventsAdmin} />
    <Stack.Screen name="MissingReportActivities" component={MissingReportActivities} />
    <Stack.Screen name="MRADetail" component={MRADetail} />
    <Stack.Screen name="ManageEvents" component={ManageEvents} />
    <Stack.Screen name="TrainingScoreStatistics" component={TrainingScoreStatistics} />
    <Stack.Screen name="DisciplineScoreUpdate" component={DisciplineScoreUpdate} />
    <Stack.Screen name="UserManagement" component={UserManagement} />
  </Stack.Navigator>
);

// Stack Navigator cho Events của sinh viên
const StudentEventsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="Events" component={EventsSV} />
    <Stack.Screen name="ActivityDetail" component={ActivityDetail} />
    <Stack.Screen name="JoinedActivities" component={JoinedActivities} />
    <Stack.Screen name="DisciplineScore" component={DisciplineScore} />
    <Stack.Screen name="MissingReport" component={MissingReport} />
  </Stack.Navigator>
);

const MainStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: true }}>
    <Stack.Screen name="MainTGHD" component={MainTGHD} />
    <Stack.Screen name="ActivityDetail" component={ActivityDetail} />
    <Stack.Screen name="MissingReport" component={MissingReport} />
  </Stack.Navigator>
);

// Tab Navigator chính
const TabNavigatorSV = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={MainStackNavigator} options={{title: "Trang chính", tabBarIcon: () => <Icon source="home-account" size={30}></Icon>}}/>
    <Tab.Screen name="Events" component={StudentEventsStackNavigator}  options={{title: "Sự kiện", tabBarIcon: () => <Icon source="calendar" size={30}></Icon>}}/>
    <Tab.Screen name="UserProfile" component={UserProfileNavigator}  options={{title: "Cá nhân", tabBarIcon: () => <Icon source="account" size={30}></Icon>}}/>
  </Tab.Navigator>
);

const TabNavigatorTLSV = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Events" component={EventsStackNavigator}  options={{title: "Sự kiện", tabBarIcon: () => <Icon source="calendar" size={30}></Icon>}}/>
    <Tab.Screen name="UserProfile" component={UserProfileNavigator} options={{title: "Cá nhân", tabBarIcon: () => <Icon source="account" size={30}></Icon>}}/>
  </Tab.Navigator>
);


const TabNavigatorAdmin = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Events" component={EventsStackNavigatorAdmin}  options={{title: "Sự kiện", tabBarIcon: () => <Icon source="calendar" size={30}></Icon>}}/>
    <Tab.Screen name="UserProfile" component={UserProfileNavigator} options={{title: "Cá nhân", tabBarIcon: () => <Icon source="account" size={30}></Icon>}}/>
  </Tab.Navigator>
);

// Stack Navigator cho Đăng nhập và Đăng ký
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Register" component={Register} />
  </Stack.Navigator>
);




// App chính
const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  console.log("user", user);
  const userRole = user ? user.user?.role : null;
  console.log("user", user);

  return (
    <MyDispatchContext.Provider value={dispatch}>
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <PaperProvider>
          <NavigationContainer key={user ? user?.user?.role : Math.random()}>
            {user?.user === null ? (
              <AuthNavigator />
            ) : userRole === "Assistant" ? (
              <TabNavigatorTLSV />
            ) : userRole === "Admin" ? (
              <TabNavigatorAdmin />
            ) : (
              <TabNavigatorSV />
            )}
          </NavigationContainer>
        </PaperProvider>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
    </MyDispatchContext.Provider>
  );
};


export default App;
