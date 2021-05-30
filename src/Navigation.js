import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import NewUser from './NewUser';
import Chat from './Chat';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NewUser"
        options={{
          headerShown: false,
        }}>
        {props => <NewUser {...props} />}
      </Stack.Screen>

      <Stack.Screen
        name="Chat"
        options={{
          headerShown: false,
        }}>
        {props => <Chat {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default Navigation;
