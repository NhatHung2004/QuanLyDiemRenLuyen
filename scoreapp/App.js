// import React, { useEffect, useReducer, useRef } from "react";
// // import { NavigationContainer } from "@react-navigation/native";
// import {NavigationContainer, useNavigation} from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { Provider as PaperProvider } from "react-native-paper";
// import NewsFeed from "./Components/Boards/NewsFeed";
// import Events from "./Components/User/TroLySV/Events";
// import Contents from "./Components/Boards/Contents";
// import BaoThieu from "./Components/User/TroLySV/BaoThieu";
// import EventsSV from "./Components/User/Students/EventsSV";
// import MyUserReducer from "./configs/UserReducer"
// import { MyUserContext, MyDispatchContext } from "./configs/UserContext"
// import Login from "./Components/User/Login";
// import ManageEvents from "./Components/User/TroLySV/QLHoatDong/ManageEvents";
// import MainTGHD from "./Components/User/Students/ThamGiaHoatDong/MainTGHD";
// import ActivityDetail from "./Components/User/Students/ThamGiaHoatDong/ActivityDetail";
// import JoinedActivities from "./Components/User/Students/ThamGiaHoatDong/JoinedActivities";
// import Register from "./Components/User/Register";
// import UserProfile from "./Components/User/UserProfile";
// import ReportMissing from "./Components/User/Students/ThamGiaHoatDong/MissingReport";
// import MissingReport from "./Components/User/Students/ThamGiaHoatDong/MissingReport";
// import MissingReportActivities from "./Components/User/TroLySV/QLBaoThieu/MissingReportActivities";
// import MRADetail from "./Components/User/TroLySV/QLBaoThieu/MRADetail";
// import TrainingScoreStatistics from "./Components/User/Students/ThamGiaHoatDong/TrainingScoreStatistics";
// import DisciplineScore from "./Components/User/TroLySV/Statics/DisciplineScore";


// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();

// // Stack Navigator cho các màn hình chính
// const StackNavigator = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="NewsFeed" component={NewsFeed} />
//     <Stack.Screen name="Contents" component={Contents} />
//   </Stack.Navigator>
// );

// const UserProfileNavigator = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="UserProfile" component={UserProfile} />
//   </Stack.Navigator>
// );

// // Stack Navigator cho Events của trợ lý sinh viên
// const EventsStackNavigator = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="Events" component={Events} />
//     <Stack.Screen name="MissingReportActivities" component={MissingReportActivities} />
//     <Stack.Screen name="MRADetail" component={MRADetail} />
//     <Stack.Screen name="ManageEvents" component={ManageEvents} />
//     <Stack.Screen name="TrainingScoreStatistics" component={TrainingScoreStatistics} />
//   </Stack.Navigator>
// );

// // Stack Navigator cho Events của sinh viên
// const StudentEventsStackNavigator = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="Events" component={EventsSV} />
//     {/* <Stack.Screen name="MainTGHD" component={MainTGHD} /> */}
//     <Stack.Screen name="ActivityDetail" component={ActivityDetail} />
//     <Stack.Screen name="JoinedActivities" component={JoinedActivities} />
//     <Stack.Screen name="DisciplineScore" component={DisciplineScore} />
    
//   </Stack.Navigator>
// );

// const MainStackNavigator = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="MainTGHD" component={MainTGHD} />
//     <Stack.Screen name="ActivityDetail" component={ActivityDetail} />
//     <Stack.Screen name="MissingReport" component={MissingReport} />
//   </Stack.Navigator>
// );

// // Tab Navigator chính
// const TabNavigatorSV = () => (
//   <Tab.Navigator>
//     <Tab.Screen name="Home" component={MainStackNavigator} />
//     <Tab.Screen name="Events" component={StudentEventsStackNavigator} />
//     <Tab.Screen name="UserProfile" component={UserProfileNavigator} />
//   </Tab.Navigator>
// );

// const TabNavigatorTLSV = () => (
//   <Tab.Navigator>
//     <Tab.Screen name="Home" component={StackNavigator} />
//     <Tab.Screen name="Events" component={EventsStackNavigator} />
//     <Tab.Screen name="UserProfile" component={UserProfileNavigator} />
//   </Tab.Navigator>
// );

// // Stack Navigator cho Đăng nhập và Đăng ký
// const AuthNavigator = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="Login" component={Login} />
//   </Stack.Navigator>
// );

// // App chính
// export default function App() {
//   const [user, dispatch] = useReducer(MyUserReducer, null);
//   const userRole = user?.user?.role ?? null;
//   const navigationRef = useRef(null); // Khởi tạo navigationRef

//   // Kiểm tra khi user thay đổi (đăng xuất hoặc đăng nhập)
//   useEffect(() => {
//     console.log("Here");
//     if (user === null && navigationRef.current) {
      
//     }
//   }, [user]);

//   return (
//     <MyUserContext.Provider value={user}>
//       <MyDispatchContext.Provider value={dispatch}>
//         <PaperProvider>
//           <NavigationContainer ref={navigationRef}>
//             {user === null ? (
//               <AuthNavigator /> // Nếu user là null, điều hướng về AuthNavigator (đăng nhập)
//             ) : userRole === "Assistant" ? (
//               <TabNavigatorTLSV /> // Nếu role là trợ lý, điều hướng tới TabNavigatorTLSV
//             ) : (
//               <TabNavigatorSV /> // Nếu là sinh viên, điều hướng tới TabNavigatorSV
//             )}
//           </NavigationContainer>
//         </PaperProvider>
//       </MyDispatchContext.Provider>
//     </MyUserContext.Provider>
//   );
// }

import React, { useEffect, useReducer, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import NewsFeed from "./Components/Boards/NewsFeed";
import Events from "./Components/User/TroLySV/Events";
import Contents from "./Components/Boards/Contents";
import BaoThieu from "./Components/User/TroLySV/BaoThieu";
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
    <Stack.Screen name="Login" component={Login} />
  </Stack.Navigator>
);

// Stack Navigator cho Events của trợ lý sinh viên
const EventsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Events" component={Events} />
    <Stack.Screen name="MissingReportActivities" component={MissingReportActivities} />
    <Stack.Screen name="MRADetail" component={MRADetail} />
    <Stack.Screen name="ManageEvents" component={ManageEvents} />
    <Stack.Screen name="TrainingScoreStatistics" component={TrainingScoreStatistics} />
  </Stack.Navigator>
);

// Stack Navigator cho Events của sinh viên
const StudentEventsStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Events" component={EventsSV} />
    <Stack.Screen name="ActivityDetail" component={ActivityDetail} />
    <Stack.Screen name="JoinedActivities" component={JoinedActivities} />
    <Stack.Screen name="DisciplineScore" component={DisciplineScore} />
    <Stack.Screen name="MissingReport" component={MissingReport} />
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
    <Stack.Screen name="Login" component={Login} />
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
