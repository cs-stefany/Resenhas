import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: number;
    color?: string;
    emptyColor?: string;
    onRatingChange?: (rating: number) => void;
    disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxStars = 5,
    size = 32,
    color = '#FFD700',
    emptyColor = '#DDB0C4',
    onRatingChange,
    disabled = false,
}) => {
    const handlePress = (selectedRating: number) => {
        if (!disabled && onRatingChange) {
            // Se clicar na mesma estrela, remove a seleção
            if (selectedRating === rating) {
                onRatingChange(0);
            } else {
                onRatingChange(selectedRating);
            }
        }
    };

    return (
        <View style={styles.container}>
            {[...Array(maxStars)].map((_, index) => {
                const starNumber = index + 1;
                const isFilled = starNumber <= rating;

                return (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handlePress(starNumber)}
                        disabled={disabled}
                        activeOpacity={disabled ? 1 : 0.7}
                        style={styles.starButton}
                    >
                        <Ionicons
                            name={isFilled ? 'star' : 'star-outline'}
                            size={size}
                            color={isFilled ? color : emptyColor}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    starButton: {
        padding: 4,
    },
});

export default StarRating;
