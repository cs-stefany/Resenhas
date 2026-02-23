import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { StyleSheet } from "react-native";
import { Filmes, Resenhas, Cenas } from "./unified";
import Home from "./Home";
import React from "react";

const Drawer = createDrawerNavigator();

function CDrawerItem(props: { name: string; icon: string; navigation: any; state: any }) {
    return (
        <DrawerItem
            inactiveTintColor="#CD9CB2"
            activeTintColor="#FFE1EE"
            activeBackgroundColor="#8F6277"
            focused={props.state.routeNames[props.state.index] === props.name}
            label={props.name}
            icon={(iconProps) => <Icon name={props.icon} {...iconProps} />}
            onPress={() => props.navigation.navigate(props.name)}
            style={styles.drawerItem}
        />
    );
}

function CDrawerContent(props: DrawerContentComponentProps) {
    return (
        <DrawerContentScrollView {...props} style={{ backgroundColor: "#FFE1EE" }}>
            <CDrawerItem name="Pagina Inicial" icon="home" {...props} />
            <CDrawerItem name="Filmes" icon="filmstrip-box" {...props} />
            <CDrawerItem name="Resenhas" icon="text-box" {...props} />
            <CDrawerItem name="Cenas" icon="video" {...props} />
        </DrawerContentScrollView>
    );
}

export default function Menu() {
    return (
        <Drawer.Navigator
            initialRouteName="Pagina Inicial"
            drawerContent={(props) => CDrawerContent(props)}
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: "#8F6277" },
                headerTintColor: "#FFE1EE",
            }}
        >
            <Drawer.Screen name="Pagina Inicial" component={Home} />
            <Drawer.Screen name="Filmes" component={Filmes} />
            <Drawer.Screen name="Resenhas" component={Resenhas} />
            <Drawer.Screen name="Cenas" component={Cenas} />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    drawerItem: {
        marginVertical: 2,
    },
});
