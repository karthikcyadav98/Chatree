import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

const NewUser = ({navigation}) => {
  const [user, setUser] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    readUser();
  }, []);

  const readUser = async () => {
    const user = await AsyncStorage.getItem('user');

    if (user) {
      setUser(JSON.parse(user));
      navigation.replace('Chat', {user: JSON.parse(user)});
    }
  };

  const handleEnterChat = async () => {
    if (name.length > 2) {
      setErrorMsg('');
      const _id = Math.random().toString(36).substring(7);
      const user = {_id, name};
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigation.replace('Chat', {user: user});
    } else {
      setErrorMsg('Username should be minimum of 3 charaters.');
    }
  };

  return (
    <SafeAreaView style={styles.fullScreen}>
      <View style={styles.container}>
        <Text style={styles.username}>USERNAME</Text>
        <TextInput
          placeholderStyle={{color: '#000'}}
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
        {errorMsg !== '' && <Text style={styles.errorMsg}>{errorMsg}</Text>}

        <TouchableOpacity
          onPress={handleEnterChat}
          style={styles.btnView}
          activeOpacity={0.6}>
          <Text style={styles.btnText}>ENTER CHAT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NewUser;

const styles = StyleSheet.create({
  fullScreen: {flex: 1},
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  username: {
    color: '#0084ff',
    margin: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },
  input: {
    color: '#000',
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 15,
  },
  errorMsg: {
    color: 'red',
  },
  btnView: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#0084ff',
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
  },
});
