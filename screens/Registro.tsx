import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ImageStyle,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { MaskedDateInput } from '../components';
import { useAlert } from '../contexts/AlertContext';
import { isSupabaseConfigured, supabase } from '../js/supabase';
import { traduzirErro } from '../js/tradutor';
import { isValidBrazilianDate } from '../js/validation';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Registro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [datanasc, setDatanasc] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [loading, setLoading] = useState(false);
    const { alert, showAlert } = useAlert();
    const navigation = useNavigation();

    const cadastrar = async () => {
        if (!isSupabaseConfigured) {
            alert('O CineFy ainda não está conectado ao servidor. Configure o Supabase para continuar.');
            return;
        }
        const emailNormalizado = email.trim().toLowerCase();
        if (nome.trim().length < 2) {
            alert('Digite seu nome.');
            return;
        }
        if (!EMAIL_PATTERN.test(emailNormalizado)) {
            alert('Digite um e-mail válido.');
            return;
        }
        if (!isValidBrazilianDate(datanasc, false)) {
            alert('Digite uma data de nascimento válida.');
            return;
        }
        if (senha.length < 8) {
            alert('A senha deve ter pelo menos 8 caracteres.');
            return;
        }
        if (senha !== confirmacao) {
            alert('As senhas não são iguais.');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: emailNormalizado,
            password: senha,
            options: {
                emailRedirectTo: Linking.createURL('confirmacao'),
                data: {
                    nome: nome.trim(),
                    datanasc,
                },
            },
        });
        setLoading(false);

        if (error) {
            alert(traduzirErro(error.message));
            return;
        }

        if (data.session) {
            showAlert({
                title: 'Conta criada!',
                message: 'Seu CineFy está pronto para usar.',
                buttons: [{ text: 'Começar' }],
            });
            return;
        }

        showAlert({
            title: 'Só falta confirmar',
            message: 'Enviamos um link para o seu e-mail. Abra o link para ativar a conta e depois volte para entrar.',
            buttons: [{
                text: 'Voltar ao login',
                onPress: () => navigation.navigate('Login' as never),
            }],
        });
    };

    return (
        <KeyboardAwareScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
            enableOnAndroid
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={20}
        >
            <View style={styles.brandRow}>
                <Image source={require('../assets/avatar.png')} style={styles.logo as ImageStyle} />
                <View>
                    <Text style={styles.brand}>CineFy</Text>
                    <Text style={styles.brandSubtitle}>Comece sua coleção</Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.title}>Crie sua conta</Text>
                <Text style={styles.subtitle}>Leva menos de um minuto.</Text>

                <Text style={styles.label}>Nome</Text>
                <TextInput
                    style={styles.input}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Como podemos chamar você?"
                    textContentType="name"
                    autoComplete="name"
                />

                <Text style={styles.label}>E-mail</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="voce@exemplo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    autoComplete="email"
                />

                <Text style={styles.label}>Data de nascimento</Text>
                <MaskedDateInput
                    value={datanasc}
                    onChangeText={setDatanasc}
                    placeholder="DD/MM/AAAA"
                    style={styles.dateInput}
                />

                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordRow}>
                    <TextInput
                        style={styles.passwordInput}
                        value={senha}
                        onChangeText={setSenha}
                        placeholder="Mínimo de 8 caracteres"
                        secureTextEntry={!mostrarSenha}
                        autoCapitalize="none"
                        textContentType="newPassword"
                        autoComplete="new-password"
                    />
                    <TouchableOpacity onPress={() => setMostrarSenha((value) => !value)} hitSlop={10}>
                        <Ionicons
                            name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                            size={22}
                            color="#8F6277"
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Confirme a senha</Text>
                <TextInput
                    style={styles.input}
                    value={confirmacao}
                    onChangeText={setConfirmacao}
                    placeholder="Digite a senha novamente"
                    secureTextEntry={!mostrarSenha}
                    autoCapitalize="none"
                    onSubmitEditing={cadastrar}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={cadastrar}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#FFFFFF" />
                        : <Text style={styles.buttonText}>Criar minha conta</Text>}
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#DDB0C4' },
    content: { flexGrow: 1, backgroundColor: '#FED2E5', paddingBottom: 32 },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: '#DDB0C4',
        paddingVertical: 22,
    },
    logo: { width: 72, height: 72 },
    brand: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
    brandSubtitle: { color: '#FFF7FA', marginTop: 2 },
    card: { paddingHorizontal: 26, paddingTop: 26 },
    title: { color: '#603F4F', fontSize: 25, fontWeight: '700' },
    subtitle: { color: '#8F6277', marginTop: 5, marginBottom: 22 },
    label: { color: '#603F4F', fontWeight: '600', marginBottom: 7, marginTop: 14 },
    input: {
        minHeight: 52,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DDB0C4',
        borderRadius: 14,
        paddingHorizontal: 15,
        color: '#35252D',
        fontSize: 16,
    },
    dateInput: {
        minHeight: 52,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 12,
    },
    passwordRow: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DDB0C4',
        borderRadius: 14,
        paddingHorizontal: 15,
    },
    passwordInput: { flex: 1, color: '#35252D', fontSize: 16, paddingVertical: 12 },
    button: {
        minHeight: 54,
        borderRadius: 27,
        backgroundColor: '#8F6277',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 28,
    },
    buttonDisabled: { opacity: 0.65 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
