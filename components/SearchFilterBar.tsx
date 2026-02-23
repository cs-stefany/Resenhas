import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchFilterBarProps {
    searchValue: string;
    onSearchChange: (text: string) => void;
    filterComponent: React.ReactNode;
    onAddPress: () => void;
    placeholder?: string;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
    searchValue,
    onSearchChange,
    filterComponent,
    onAddPress,
    placeholder = "Pesquisar...",
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#8F6277" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={placeholder}
                    placeholderTextColor="#AD7E94"
                    value={searchValue}
                    onChangeText={onSearchChange}
                />
            </View>

            <View style={styles.filterContainer}>
                {filterComponent}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE1EE',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#DDB0C4',
        gap: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(173, 126, 148, 0.3)',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 40,
        borderWidth: 1,
        borderColor: '#CD9CB2',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#8F6277',
        paddingVertical: 0,
    },
    filterContainer: {
        minWidth: 100,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#8F6277',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8F6277',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
});

export default SearchFilterBar;
