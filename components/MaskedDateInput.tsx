import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';

interface MaskedDateInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    label?: string;
    style?: any;
}

const MaskedDateInput: React.FC<MaskedDateInputProps> = ({
    value,
    onChangeText,
    placeholder = 'DD/MM/AAAA',
    label,
    style,
}) => {
    return (
        <View>
            {label && <Text style={styles.label}>{label}</Text>}
            <MaskedTextInput
                mask="99/99/9999"
                value={value}
                onChangeText={(text, rawText) => onChangeText(text)}
                placeholder={placeholder}
                keyboardType="numeric"
                style={[styles.input, style]}
                placeholderTextColor="#999"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#AD7E94',
        marginBottom: 4,
    },
    input: {
        backgroundColor: 'rgba(173, 126, 148, 0.3)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#CD9CB2',
        color: '#000',
        fontSize: 16,
    },
});

export default MaskedDateInput;
