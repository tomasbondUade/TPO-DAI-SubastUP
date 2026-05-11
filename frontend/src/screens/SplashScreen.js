import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/banner principal.jpeg')}
        style={styles.bannerImage}
        resizeMode="contain"
      />
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bannerImage: {
    width: '100%',
    height: 300,
    marginBottom: 60,
  },
  spinnerContainer: {
    marginTop: 40,
  },
});
