import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { AlertProvider } from "./contexts/AlertContext";
import { FormModalProvider } from "./contexts/FormModalContext";
import { FormModal } from "./components";
import Login from "./screens/Login";
import Registro from "./screens/Registro";
import Menu from "./screens/Menu";
import React from "react";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <AlertProvider>
            <FormModalProvider>
                <NavigationContainer>
                    <Stack.Navigator
                        screenOptions={{
                            headerStyle: { backgroundColor: "#8F6277" },
                            headerTintColor: "#FFF",
                            animation: "slide_from_right",
                            animationDuration: 300,
                        }}
                    >
                        <Stack.Screen
                            name="Login"
                            component={Login}
                            options={{ animation: "fade" }}
                        />
                        <Stack.Screen
                            name="Registro"
                            component={Registro}
                            options={{ animation: "slide_from_bottom" }}
                        />
                        <Stack.Screen
                            name="Menu"
                            component={Menu}
                            options={{
                                headerShown: false,
                                animation: "fade_from_bottom",
                            }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
                <FormModal />
            </FormModalProvider>
        </AlertProvider>
    );
}
