import 'react-native-gesture-handler';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AlertProvider } from "./contexts/AlertContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FormModalProvider } from "./contexts/FormModalContext";
import { FormModal, Loading } from "./components";
import Login from "./screens/Login";
import Registro from "./screens/Registro";
import RedefinirSenha from "./screens/RedefinirSenha";
import Menu from "./screens/Menu";
import React from "react";

const Stack = createNativeStackNavigator();

function RootNavigator() {
    const { session, initializing, recoveringPassword } = useAuth();

    if (initializing) {
        return <Loading />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                id="RootStack"
                screenOptions={{
                    headerStyle: { backgroundColor: "#8F6277" },
                    headerTintColor: "#FFF",
                    animation: "slide_from_right",
                    animationDuration: 300,
                }}
            >
                {recoveringPassword ? (
                    <Stack.Screen
                        name="RedefinirSenha"
                        component={RedefinirSenha}
                        options={{ headerShown: false, animation: "fade" }}
                    />
                ) : session ? (
                    <Stack.Screen
                        name="Menu"
                        component={Menu}
                        options={{ headerShown: false, animation: "fade" }}
                    />
                ) : (
                    <>
                        <Stack.Screen
                            name="Login"
                            component={Login}
                            options={{ headerShown: false, animation: "fade" }}
                        />
                        <Stack.Screen
                            name="Registro"
                            component={Registro}
                            options={{
                                title: "Criar conta",
                                animation: "slide_from_right",
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <AlertProvider>
                <AuthProvider>
                    <FormModalProvider>
                        <RootNavigator />
                <FormModal />
                    </FormModalProvider>
                </AuthProvider>
            </AlertProvider>
        </SafeAreaProvider>
    );
}
