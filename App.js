import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import WebView from 'react-native-webview';
import { useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

const GITHUB_PAGES_URL = 'https://johannes60-sk.github.io/pose-tracker';

export default function App() {
  const [poseTrackerInfos, setCurrentPoseTrackerInfos] = useState();
  const [repsCounter, setRepsCounter] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const exercise = 'push_up';

  const handleCounter = (count) => {
    setRepsCounter(count);
  };

  const handleInfos = (infos) => {
    setCurrentPoseTrackerInfos(infos);
    console.log('Received infos:', infos);
  };

  const webViewCallback = (info) => {
    if (info?.type === 'counter') {
      handleCounter(info.current_count);
    } else {
      handleInfos(info);
    }
  };

  const onMessage = (event) => {
    try {
      let parsedData;
      if (typeof event.nativeEvent.data === 'string') {
        parsedData = JSON.parse(event.nativeEvent.data);
      } else {
        parsedData = event.nativeEvent.data;
      }
      console.log('Parsed data:', parsedData);
      webViewCallback(parsedData);
    } catch (error) {
      console.error('Error processing message:', error);
      console.log('Problematic data:', event.nativeEvent.data);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        style={styles.webView}
        source={{ uri: `${GITHUB_PAGES_URL}?exercise=${exercise}` }}
        originWhitelist={['*']}
        onMessage={onMessage}
        // Autoriser l'accès caméra dans le WebView (Android)
        onPermissionRequest={(request) => request.grant(request.resources)}
        mixedContentMode="compatibility"
        onError={(syntheticEvent) => {
          console.warn('WebView error:', syntheticEvent.nativeEvent);
        }}
      />
      <View style={styles.infoContainer}>
        <Text>Status : {!poseTrackerInfos ? 'Chargement IA...' : 'IA Active'}</Text>
        <Text>Exercice : {exercise.replace(/_/g, ' ')}</Text>
        <Text>Counter: {repsCounter}</Text>
        {poseTrackerInfos?.ready === false ? (
          <>
            <Text>Position : non prêt</Text>
            <Text>Info : {poseTrackerInfos?.postureDirection}</Text>
          </>
        ) : (
          <>
            <Text>Position : prêt</Text>
            <Text>Info : Lance ton {exercise.replace(/_/g, ' ')} !</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    flexDirection: 'column',
  },
  webView: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  infoContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
  },
});
