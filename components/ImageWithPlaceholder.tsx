import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, ImageStyle, ViewStyle } from 'react-native';

interface ImageWithPlaceholderProps {
    uri: string;
    style?: ImageStyle;
    placeholderColor?: string;
}

const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
    uri,
    style,
    placeholderColor = '#DDB0C4',
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (isLoading) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 0.6,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 0.3,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [isLoading]);

    const defaultImageStyle: ImageStyle = {
        width: 150,
        height: 150,
        borderRadius: 8,
    };

    const combinedStyle = { ...defaultImageStyle, ...style };

    const placeholderStyle: ViewStyle = {
        ...combinedStyle,
        position: 'absolute',
        backgroundColor: placeholderColor,
        justifyContent: 'center',
        alignItems: 'center',
    };

    return (
        <View style={[combinedStyle, styles.container]}>
            {isLoading && !hasError && (
                <Animated.View
                    style={[
                        placeholderStyle,
                        { opacity: pulseAnim }
                    ]}
                />
            )}

            {hasError ? (
                <View style={[placeholderStyle, { opacity: 0.5 }]}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/723/723082.png' }}
                        style={combinedStyle}
                    />
                </View>
            ) : (
                <Image
                    source={{ uri }}
                    style={[combinedStyle, isLoading && styles.hidden]}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    hidden: {
        opacity: 0,
    },
});

export default ImageWithPlaceholder;
