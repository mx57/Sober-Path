import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: any;
}

export const Skeleton = ({ width, height, borderRadius = 8, style }: SkeletonProps) => {
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
});
