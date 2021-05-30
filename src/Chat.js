import React, {useState, useEffect, useCallback} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import {
  View,
  SafeAreaView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';

const db = firestore();
const chatsRef = db.collection('chat_live');

const Chat = ({navigation, route}) => {
  const user = route.params.user;
  const name = route.params.user.name;
  const [messages, setMessages] = useState([]);
  const [transferred, setTransferred] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = chatsRef.onSnapshot(querySnapshot => {
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({type}) => type === 'added')
        .map(({doc}) => {
          const message = doc.data();
          return {...message, createdAt: message.createdAt.toDate()};
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messagesFirestore);
    });
    return () => unsubscribe();
  }, []);

  const appendMessages = useCallback(
    messages => {
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, messages),
      );
    },
    [messages],
  );

  const handleSend = async messages => {
    console.log(messages);
    const writes = messages.map(m => chatsRef.add(m));
    await Promise.all(writes);
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      cropping: false,
      multiple: false,
      // mediaType: 'video',
    }).then(async image => {
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      let imgUrl = await uploadImage(imageUri);

      let msgs = [
        {
          _id: Date.now(),
          text: '',
          createdAt: new Date(),
          user: {
            _id: user._id,
            name: user.name,
          },
          image: imgUrl,
        },
      ];

      handleSend(msgs);
    });
  };

  const uploadImage = async image => {
    if (image == null) {
      return null;
    }
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    setUploading(true);
    setTransferred(0);

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    // Set transferred state
    task.on('state_changed', taskSnapshot => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

      setTransferred(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
          100,
      );
    });

    try {
      await task;

      const url = await storageRef.getDownloadURL();

      setUploading(false);

      return url;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <GiftedChat
        textInputStyle={{color: '#000'}}
        imageStyle={styles.img}
        messages={messages}
        user={user}
        onSend={handleSend}
      />
      <TouchableOpacity
        disabled={uploading}
        activeOpacity={0.6}
        onPress={choosePhotoFromLibrary}
        style={styles.attBtn}>
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.attText}>Attach Files</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'gray',
  },
  attBtn: {
    padding: 10,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  img: {
    width: 250,
    height: 200,
  },
});
