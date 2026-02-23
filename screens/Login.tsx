import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageStyle,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { supabase } from "../js/supabase";
import { useAlert } from "../contexts/AlertContext";
import { traduzirErro } from "../js/tradutor";
import style from "../js/style";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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

  const irParaRegistro = () => {
    navigation.navigate("Registro" as never);
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      alert("Preencha email e senha para continuar.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (error) {
      alert(traduzirErro(error.message));
      return;
    }

    console.log("Logado como ", data.user?.email);
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
        <Image
          source={require("../assets/avatar.png")}
          style={style.avatarLogo as ImageStyle}
        />
        <Text style={style.titleApp}>CineFy</Text>
      </View>

      <View style={style.formContainer}>
        <View style={style.inputContainer}>
          <View style={style.distancia}>
            <Text style={style.inputLabel}>Email:</Text>
            <TextInput
              placeholder="Email"
              onChangeText={(texto) => setEmail(texto.trim().toLowerCase())}
              style={style.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={style.distancia}>
            <Text style={style.inputLabel}>Senha:</Text>
            <TextInput
              placeholder="Senha"
              onChangeText={(texto) => setSenha(texto)}
              style={style.input}
              secureTextEntry
            />
          </View>
        </View>

        <View style={style.buttonContainer}>
          <TouchableOpacity style={style.button} onPress={handleLogin}>
            <Text style={style.buttonText}>Login</Text>
          </TouchableOpacity>

          <Text style={style.registerText} onPress={irParaRegistro}>
            Não tem uma conta?{" "}
            <Text style={style.registerLink}>Cadastre-se</Text>
          </Text>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Login;
