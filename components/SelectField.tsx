import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SelectOption {
    label: string;
    value: string;
}

interface SelectFieldProps {
    value: string;
    options: SelectOption[];
    onValueChange: (value: string) => void;
    placeholder: string;
    title: string;
    compact?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
    value,
    options,
    onValueChange,
    placeholder,
    title,
    compact = false,
}) => {
    const [visible, setVisible] = useState(false);

    const selectedLabel = useMemo(
        () => options.find((option) => option.value === value)?.label,
        [options, value],
    );

    const selectOption = (option: SelectOption) => {
        onValueChange(option.value);
        setVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.trigger, compact && styles.compactTrigger]}
                onPress={() => setVisible(true)}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel={`${title}: ${selectedLabel || placeholder}`}
            >
                <Ionicons
                    name={compact ? 'funnel-outline' : 'chevron-down-circle-outline'}
                    size={compact ? 19 : 21}
                    color="#FFFFFF"
                />
                <Text style={styles.triggerText} numberOfLines={1}>
                    {selectedLabel || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setVisible(false)}
            >
                <View style={styles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
                    <View style={styles.sheet}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setVisible(false)}
                                accessibilityLabel="Fechar seleção"
                            >
                                <Ionicons name="close" size={25} color="#8F6277" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value || 'all'}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.optionsList}
                            renderItem={({ item }) => {
                                const selected = item.value === value;

                                return (
                                    <TouchableOpacity
                                        style={[styles.option, selected && styles.selectedOption]}
                                        onPress={() => selectOption(item)}
                                        activeOpacity={0.78}
                                    >
                                        <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
                                            {item.label}
                                        </Text>
                                        {selected && (
                                            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    trigger: {
        minHeight: 52,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#8F6277',
        backgroundColor: '#AD7E94',
    },
    compactTrigger: {
        minHeight: 44,
        borderRadius: 22,
        borderWidth: 1,
        paddingHorizontal: 16,
    },
    triggerText: {
        flex: 1,
        minWidth: 0,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        includeFontPadding: false,
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(53, 37, 45, 0.58)',
    },
    sheet: {
        maxHeight: '72%',
        backgroundColor: '#FFE1EE',
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingBottom: 18,
        shadowColor: '#35252D',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
        elevation: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 17,
        borderBottomWidth: 1,
        borderBottomColor: '#DDB0C4',
    },
    title: {
        color: '#6F4559',
        fontSize: 19,
        fontWeight: '700',
    },
    closeButton: {
        width: 38,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 19,
        backgroundColor: '#FED2E5',
    },
    optionsList: {
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    option: {
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginVertical: 3,
        borderRadius: 14,
        backgroundColor: '#FED2E5',
    },
    selectedOption: {
        backgroundColor: '#8F6277',
    },
    optionText: {
        flex: 1,
        color: '#6F4559',
        fontSize: 16,
        fontWeight: '500',
    },
    selectedOptionText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
});

export default SelectField;
