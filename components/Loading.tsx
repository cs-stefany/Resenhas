import { ActivityIndicator, View } from "react-native";
import style from "../js/style";
import React from "react";

export default function Loading() {
    return (
        <View style={style.containerCenter}>
            <ActivityIndicator size={60} color="#8F6277" />
        </View>
    );
}
