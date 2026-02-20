import { View, Text, TextInput, TouchableOpacity, Image, ImageStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { supabase } from "../js/supabase";
import { useAlert } from "../contexts/AlertContext";
import { Usuario } from "../model/Usuario";
import style from "../js/style";

const Registro = () => {
    const [formUsuario, setFormUsuario] = useState<Partial<Usuario>>({});
    const { alert } = useAlert();

    const navigation = useNavigation();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    navigation.navigate("Menu" as never);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const handleSignUp = async () => {
        if (!formUsuario.email || !formUsuario.senha) {
            alert("Email e senha são obrigatórios");
            return;
        }

        if (formUsuario.senha.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: formUsuario.email,
            password: formUsuario.senha,
        });

        if (error) {
            alert(error.message);
            return;
        }

        if (data.user) {
            const { error: profileError } = await supabase
                .from('usuarios')
                .update({
                    nome: formUsuario.nome || '',
                    datanasc: formUsuario.datanasc || '',
                })
                .eq('id', data.user.id);

            if (profileError) {
                console.log("Erro ao atualizar perfil:", profileError.message);
            }

            alert("Conta criada com sucesso!");
        }
    };

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1, backgroundColor: "#DDB0C4" }}
            contentContainerStyle={{ flexGrow: 1 }}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={20}
        >
            <View style={style.containerSuperiorAvatar}>
                <Image source={require("../assets/avatar.png")} style={style.avatarLogo as ImageStyle} />
                <Text style={style.titleApp}>CineFy</Text>
            </View>

            <View style={style.formContainer}>
                <View style={style.inputContainer}>
                    <View style={style.distancia}>
                        <Text style={style.inputLabel}>Nome:</Text>
                        <TextInput
                            placeholder="Nome"
                            onChangeText={(texto) =>
                                setFormUsuario({
                                    ...formUsuario,
                                    nome: texto,
                                })
                            }
                            style={style.input}
                        />
                    </View>
                    <View style={style.distancia}>
                        <Text style={style.inputLabel}>E-mail:</Text>
                        <TextInput
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={(texto) =>
                                setFormUsuario({
                                    ...formUsuario,
                                    email: texto,
                                })
                            }
                            style={style.input}
                        />
                    </View>
                    <View style={style.distancia}>
                        <Text style={style.inputLabel}>Senha:</Text>
                        <TextInput
                            placeholder="Senha (mínimo 6 caracteres)"
                            onChangeText={(texto) =>
                                setFormUsuario({
                                    ...formUsuario,
                                    senha: texto,
                                })
                            }
                            secureTextEntry
                            style={style.input}
                        />
                    </View>
                    <View style={style.distancia}>
                        <Text style={style.inputLabel}>Data de Nascimento:</Text>
                        <TextInput
                            placeholder="DD/MM/AAAA"
                            onChangeText={(texto) =>
                                setFormUsuario({
                                    ...formUsuario,
                                    datanasc: texto,
                                })
                            }
                            style={style.input}
                        />
                    </View>
                </View>
                <View style={style.buttonContainer}>
                    <TouchableOpacity style={style.button} onPress={handleSignUp}>
                        <Text style={style.buttonText}>Registrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
};

export default Registro;
