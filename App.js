import React from 'react'
import { View, Text } from 'react-native'
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './screens/Login'
import Sign_up from './screens/Sign_up'
import ResetPassword from './screens/ResetPassword';
import VerifyEmail from './screens/VerifyEmail'

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    // <NavigationContainer>
    //   <Stack.Navigator>
    //     <Stack.Screen
    //       name = "Login"
    //       component = {Login}
    //       options = {{headerShown: false}}
    //     />
    //     <Stack.Screen
    //       name="Sign_up"
    //       component={Sign_up}
    //       options={{headerShown: false}}
    //     />
    //     <Stack.Screen
    //       name="ResetPassword"
    //       component={ResetPassword}
    //       options={{headerShown: false}}
    //     />
    //     {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
    //   </Stack.Navigator>
    // </NavigationContainer>
    <View>
      <VerifyEmail/>
    </View>
  )
}




export default App