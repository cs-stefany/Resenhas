import { View, Text, TouchableOpacity, Image, ImageStyle } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { supabase } from "../js/supabase";
import { useAlert } from "../contexts/AlertContext";
import style from "../js/style";
import React from "react";

const Home = () => {
    const { confirm, alert } = useAlert();

    const handleSignOut = () => {
        confirm("Sair da conta", "Deseja mesmo sair do CineFy?", async () => {
            const { error } = await supabase.auth.signOut();
            if (error) alert("Não foi possível sair. Tente novamente.");
        });
    };

    return (
        <View style={style.containerHome}>
            <View style={style.rectangle}>
                <Text style={style.cinefyText}>Cinefy</Text>
            </View>
            <View style={{ marginTop: 70 }}>
                <Image source={require("../assets/avatar.png")} style={style.avatarImage as ImageStyle} />
                <Text style={style.textBelowAvatar}>Imortalize a magia de</Text>
                <Text style={style.textBelowAvatar}>cada filme</Text>
            </View>
            <View style={style.logoutIconContainer}>
                <TouchableOpacity onPress={handleSignOut} accessibilityLabel="Sair da conta">
                    <Icon name="logout" size={50} color="#8F6277" />
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default Home;
