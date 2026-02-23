import React, { useEffect } from 'react'
import Container from './src/navigation/Container'
import { LogBox } from 'react-native';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { LogLevel, OneSignal } from 'react-native-onesignal';

const App = () => {

  useEffect(() => {
    LogBox.ignoreAllLogs();
    OneSignal.Debug.setLogLevel(6);
    OneSignal.initialize('d6148736-6459-4778-abec-95105ff68939');
    OneSignal.Notifications.requestPermission(true);

    // console.log('✅ OneSignal Initialized');
    // setTimeout(() => {
    // RNBootSplash.hide({fade: true});
    // }, 2000);
    // OneSignal.User.addEventListener('change', (event) => {
    //   console.log("🔥 OneSignal User changed:", event);
    // });
  }, []);




  return (
    <Provider store={store}>
      <Container />
    </Provider>
  )
}

export default App