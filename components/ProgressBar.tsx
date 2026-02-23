import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface ProgressBarProps {
    progress: number; // 0 to 100
    height?: number;
    backgroundColor?: string;
    fillColor?: string;
    showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 8,
    backgroundColor = '#DDB0C4',
    fillColor = '#8F6277',
    showPercentage = true,
}) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: progress,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const width = animatedWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <View style={[styles.progressContainer, { height, backgroundColor }]}>
                <Animated.View
                    style={[
                        styles.progressFill,
                        {
                            width,
                            backgroundColor: fillColor,
                            height,
                        },
                    ]}
                />
            </View>
            {showPercentage && (
                <Text style={styles.percentageText}>
                    {Math.round(progress)}%
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    progressContainer: {
        width: '80%',
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressFill: {
        borderRadius: 10,
    },
    percentageText: {
        marginTop: 5,
        color: '#8F6277',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default ProgressBar;
