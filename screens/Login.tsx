import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ImageStyle,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { isSupabaseConfigured, supabase } from '../js/supabase';
import { useAlert } from '../contexts/AlertContext';
import { traduzirErro } from '../js/tradutor';
import { nomeDeUsuarioValido, normalizarNomeDeUsuario, usuarioParaEmailInterno } from '../js/authIdentity';

export default function Login() {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [loading, setLoading] = useState(false);
    const { alert } = useAlert();
    const navigation = useNavigation();

    const usuarioNormalizado = normalizarNomeDeUsuario(usuario);

    const entrar = async () => {
        Keyboard.dismiss();
        if (!isSupabaseConfigured) {
            alert('O CineFy ainda não está conectado ao servidor. Configure o Supabase para continuar.');
            return;
        }
        if (!nomeDeUsuarioValido(usuarioNormalizado)) {
            alert('Digite um nome de usuário válido.');
            return;
        }
        if (!senha) {
            alert('Digite sua senha para continuar.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: usuarioParaEmailInterno(usuarioNormalizado),
            password: senha,
        });
        setLoading(false);

        if (error) {
            alert(traduzirErro(error.message));
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid
                extraScrollHeight={18}
            >
                <View style={styles.brandArea}>
                    <Image
                        source={require('../assets/avatar.png')}
                        style={styles.logo as ImageStyle}
                    />
                    <Text style={styles.appName}>CineFy</Text>
                    <Text style={styles.tagline}>Suas histórias favoritas, do seu jeito.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}>Que bom ter você de volta</Text>
                    <Text style={styles.subtitle}>Entre para continuar sua coleção.</Text>

                    <View style={styles.field}>
                        <Text style={styles.label}>Nome de usuário</Text>
                        <View style={styles.inputRow}>
                            <Ionicons name="person-outline" size={21} color="#8F6277" />
                            <TextInput
                                style={styles.input}
                                placeholder="Seu usuário"
                                placeholderTextColor="#A68B98"
                                value={usuario}
                                onChangeText={setUsuario}
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="username"
                                autoComplete="username"
                                returnKeyType="next"
                            />
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.inputRow}>
                            <Ionicons name="lock-closed-outline" size={21} color="#8F6277" />
                            <TextInput
                                style={styles.input}
                                placeholder="Sua senha"
                                placeholderTextColor="#A68B98"
                                value={senha}
                                onChangeText={setSenha}
                                secureTextEntry={!mostrarSenha}
                                autoCapitalize="none"
                                textContentType="password"
                                autoComplete="current-password"
                                returnKeyType="go"
                                onSubmitEditing={entrar}
                            />
                            <TouchableOpacity
                                accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                onPress={() => setMostrarSenha((value) => !value)}
                                hitSlop={10}
                            >
                                <Ionicons
                                    name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color="#8F6277"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryButton, loading && styles.disabledButton]}
                        onPress={entrar}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#FFFFFF" />
                            : <Text style={styles.primaryButtonText}>Entrar</Text>}
                    </TouchableOpacity>

                    <View style={styles.registerRow}>
                        <Text style={styles.registerText}>Ainda não tem uma conta?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Registro' as never)}>
                            <Text style={styles.registerLink}> Criar conta</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#DDB0C4' },
    scrollContent: { flexGrow: 1, backgroundColor: '#FED2E5' },
    brandArea: {
        minHeight: 250,
        backgroundColor: '#DDB0C4',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 18,
        paddingBottom: 26,
    },
    logo: { width: 112, height: 112 },
    appName: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', marginTop: 2 },
    tagline: { color: '#FFF7FA', fontSize: 14, marginTop: 4 },
    card: {
        flex: 1,
        marginTop: -18,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: '#FED2E5',
        paddingHorizontal: 26,
        paddingTop: 32,
        paddingBottom: 36,
    },
    title: { color: '#603F4F', fontSize: 25, fontWeight: '700', textAlign: 'center' },
    subtitle: { color: '#8F6277', fontSize: 15, textAlign: 'center', marginTop: 7, marginBottom: 26 },
    field: { marginBottom: 16 },
    label: { color: '#603F4F', fontSize: 14, fontWeight: '600', marginBottom: 7 },
    inputRow: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DDB0C4',
        borderRadius: 14,
        paddingHorizontal: 15,
    },
    input: { flex: 1, color: '#35252D', fontSize: 16, paddingVertical: 12 },
    primaryButton: {
        minHeight: 54,
        borderRadius: 27,
        backgroundColor: '#8F6277',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 22,
        shadowColor: '#603F4F',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    disabledButton: { opacity: 0.65 },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    registerText: { color: '#765A68' },
    registerLink: { color: '#8F6277', fontWeight: '700' },
});
