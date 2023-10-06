import React from 'react'
import { StyleSheet } from 'react-native'
import { createDrawerNavigator } from '@react-navigation/drawer';
import Login from './Login';
import Sign_up from './Sign_up';
import ResetPassword from './ResetPassword';
import FillInformation from './FillInformation';
import VerifyEmail from './VerifyEmail';
import NewContent from './NewContent';
import Profile from './Profile';
import ProfilePremium from './ProfilePremium';
import Questions from './Questions';
import OutfitsRec from './OutfitsRec';
import Splash from './Splash';
import CustomDrawerContent from './components/CustomDrawerContent';
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';
import IconF from 'react-native-vector-icons/Feather'
import IconI from 'react-native-vector-icons/Ionicons'
import IconO from 'react-native-vector-icons/Octicons'
import IconA from 'react-native-vector-icons/AntDesign'
import IconFA from 'react-native-vector-icons/FontAwesome'
import EditProfile from './EditProfile';
import Ads from './Ads';
import CardInfo from './CardInfo';
import NewFashion from './NewFashion';
import QHistory from './QHistory';
import UserChatScreen from './UserChatScreen';
import AdminChatScreen from './AdminChatScreen';


// const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const nonDrawerOptions = {
  headerShown: false,
  drawerItemStyle: {
    display: 'none'
  }
};
const drawerOptions = {
  drawerItemStyle: {
    backgroundColor: 'white',
    width: 300,
    fontFamily: "Cuprum-VariableFont_wght",
  },
  headerStyle: {
    backgroundColor: '#f2a676',
    height: 70
  },
  headerTitleAlign: 'center',
  headerTintColor: 'black',
  drawerActiveTintColor: '#f2a676',
  draweractiveBackgroundColor: '#FAEBDC',
  drawerLabelStyle: {
    color: 'black',
    fontFamily: "Cuprum-VariableFont_wght",
    fontSize: 19,
    left: -20
  }
}

const StackNavigator = () => {
  return (
    <Drawer.Navigator
    initialRouteName="Splash"
    drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name = "Splash"
        component = {Splash}
        options = {nonDrawerOptions}
      />
      <Drawer.Screen
        name = "Login"
        component = {Login}
        options = {nonDrawerOptions}
      />
      <Drawer.Screen
        name="Sign_up"
        component={Sign_up}
        options={nonDrawerOptions}
      />
      <Drawer.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={nonDrawerOptions}
      />
      <Drawer.Screen
        name="FillInformation"
        component={FillInformation}
        options={nonDrawerOptions}
      />
      <Drawer.Screen
        name="VerifyEmail"
        component={VerifyEmail}
        options={nonDrawerOptions}
      />
      <Drawer.Screen
        name="EditProfile"
        component={EditProfile}
        options={nonDrawerOptions}
      />
      <Drawer.Screen
        name = "QHistory"
        component = {QHistory}
        options = {nonDrawerOptions}
      />
        <Drawer.Screen
          name="New Content"
          component={NewContent}
          options={{
            ...drawerOptions,
            drawerIcon: () => (
              <IconA name="staro" size={22} color="black" style={{left:-8}}/>
            ),
            headerTitleStyle:{fontSize: 30, fontFamily: "Cuprum-Bold"}
          }}
        />
      <Drawer.Screen
        name="New Fashion"
        component={NewFashion}
        options={{
          ...drawerOptions,
          drawerIcon: () => (
            <IconM name="hanger" size={22} color="black" style={{left:-8}}/>
          ),
          headerTitleStyle:{fontSize: 30, fontFamily: "Cuprum-Bold"}
        }}
      />
      <Drawer.Screen
        name="ProfilePremium"
        component={ProfilePremium}
        options={{...nonDrawerOptions, headerShown: true, headerStyle: {
          backgroundColor: '#f2a676',
          height: 70
        }, headerTitleStyle:{fontSize: 30, fontFamily: "Cuprum-Bold"},
        headerTitleAlign: 'center',
        headerTintColor: 'black',}}
      />
      <Drawer.Screen
        name="Ads"
        component={Ads}
        options={nonDrawerOptions}
      />
      <Drawer.Screen
        name="Outfit recommendation"
        component={OutfitsRec}
        options={{
          ...drawerOptions,
          drawerIcon: () => (
            <IconI name="shirt-outline" size={22} color="black" style={{left:-8}}/>
          ),
          headerTitleStyle:{fontSize: 26.8, fontFamily: "Cuprum-Bold"}
        }}
      />
      <Drawer.Screen
        name="Questions and Concerns"
        component={Questions}
        options={{
          ...drawerOptions,
          drawerIcon: () => (
            <IconM name="message-question-outline" size={22} color="black" style={{left:-8}}/>
          ),
          headerTitleStyle:{fontSize: 26.2, fontFamily: "Cuprum-Bold"}
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{...drawerOptions, 
          drawerIcon: () => (
            <IconF name="user" size={22} color="black" style={{left:-8}}/>
          ),
          headerTitleStyle:{fontSize: 30, fontFamily: "Cuprum-Bold"},
          drawerItemStyle:{
          marginTop: 470,
          borderTopColor: 'black',
          borderWidth: 1,
          borderRightColor: 'white',
          borderLeftColor: 'white',
          borderBottomColor: 'white',
          
        }}}
        
      />
      <Drawer.Screen
        name="CardInfo"
        component={CardInfo}
        options={nonDrawerOptions}
      />
       <Drawer.Screen
        name="UserChatScreen"
        component={UserChatScreen}
        options={nonDrawerOptions}
      />
      <Drawer.Screen
        name="AdminChatScreen"
        component={AdminChatScreen}
        options={nonDrawerOptions}
      />
      
      {/* <Stack.Screen
        name="MainDrawer"
        component={MainDrawer}
        options={{headerShown: true}}
      /> */}
      {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
    </Drawer.Navigator>
);
};

export default StackNavigator;