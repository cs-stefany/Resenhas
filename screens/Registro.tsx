import React, { useRef, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { MaskedDateInput } from '../components';
import { useAlert } from '../contexts/AlertContext';
import { isSupabaseConfigured, supabase } from '../js/supabase';
import { traduzirErro } from '../js/tradutor';
import { isValidBrazilianDate } from '../js/validation';
import { nomeDeUsuarioValido, normalizarNomeDeUsuario, usuarioParaEmailInterno } from '../js/authIdentity';

export default function Registro() {
    const scrollRef = useRef<KeyboardAwareScrollView | null>(null);
    const [nome, setNome] = useState('');
    const [usuario, setUsuario] = useState('');
    const [datanasc, setDatanasc] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [loading, setLoading] = useState(false);
    const { alert, showAlert } = useAlert();
    const navigation = useNavigation();

    const manterCamposDeSenhaVisiveis = () => {
        setTimeout(() => scrollRef.current?.scrollToEnd(true), 180);
    };

    const cadastrar = async () => {
        if (!isSupabaseConfigured) {
            alert('O CineFy ainda não está conectado ao servidor. Configure o Supabase para continuar.');
            return;
        }
        const usuarioNormalizado = normalizarNomeDeUsuario(usuario);
        if (nome.trim().length < 2) {
            alert('Digite seu nome.');
            return;
        }
        if (!nomeDeUsuarioValido(usuarioNormalizado)) {
            alert('O usuário deve ter entre 3 e 24 caracteres e usar apenas letras, números, ponto, hífen ou sublinhado.');
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
            email: usuarioParaEmailInterno(usuarioNormalizado),
            password: senha,
            options: {
                data: {
                    nome: nome.trim(),
                    datanasc,
                    usuario: usuarioNormalizado,
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
                message: `Seu usuário é ${usuarioNormalizado}. Guarde seu usuário e sua senha para entrar novamente.`,
                buttons: [{ text: 'Começar' }],
            });
            return;
        }

        showAlert({
            title: 'Não foi possível entrar',
            message: 'A conta foi criada, mas a sessão não foi iniciada. Volte ao login e tente entrar com seu usuário e senha.',
            buttons: [{
                text: 'Voltar ao login',
                onPress: () => navigation.navigate('Login' as never),
            }],
        });
    };

    return (
        <KeyboardAwareScrollView
            ref={scrollRef}
            style={styles.screen}
            contentContainerStyle={styles.content}
            enableOnAndroid
            enableAutomaticScroll
            enableResetScrollToCoords={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            extraHeight={110}
            extraScrollHeight={110}
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

                <Text style={styles.label}>Nome de usuário</Text>
                <TextInput
                    style={styles.input}
                    value={usuario}
                    onChangeText={setUsuario}
                    placeholder="Ex.: stefany26"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="username"
                    autoComplete="username-new"
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
                        onFocus={manterCamposDeSenhaVisiveis}
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
                    onFocus={manterCamposDeSenhaVisiveis}
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
    content: { flexGrow: 1, backgroundColor: '#FED2E5', paddingBottom: 64 },
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
