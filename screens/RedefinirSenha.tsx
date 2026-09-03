import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../js/supabase';
import { traduzirErro } from '../js/tradutor';

export default function RedefinirSenha() {
    const [senha, setSenha] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [loading, setLoading] = useState(false);
    const { alert, showAlert } = useAlert();
    const { finishPasswordRecovery, cancelPasswordRecovery } = useAuth();

    const salvar = async () => {
        if (senha.length < 8) {
            alert('Use uma senha com pelo menos 8 caracteres.');
            return;
        }
        if (senha !== confirmacao) {
            alert('As senhas não são iguais.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: senha });
        setLoading(false);

        if (error) {
            alert(traduzirErro(error.message));
            return;
        }

        showAlert({
            title: 'Senha atualizada',
            message: 'Sua nova senha já está ativa.',
            buttons: [{ text: 'Continuar', onPress: finishPasswordRecovery }],
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.iconCircle}>
                    <Ionicons name="lock-closed" size={34} color="#8F6277" />
                </View>
                <Text style={styles.title}>Crie uma nova senha</Text>
                <Text style={styles.subtitle}>
                    Escolha uma senha segura que você ainda não tenha usado no CineFy.
                </Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Nova senha</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            value={senha}
                            onChangeText={setSenha}
                            placeholder="Mínimo de 8 caracteres"
                            secureTextEntry={!mostrarSenha}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setMostrarSenha((value) => !value)}>
                            <Ionicons
                                name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color="#8F6277"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Confirme a nova senha</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            value={confirmacao}
                            onChangeText={setConfirmacao}
                            placeholder="Digite novamente"
                            secureTextEntry={!mostrarSenha}
                            autoCapitalize="none"
                            onSubmitEditing={salvar}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={salvar} disabled={loading}>
                    {loading
                        ? <ActivityIndicator color="#FFFFFF" />
                        : <Text style={styles.primaryButtonText}>Salvar nova senha</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={cancelPasswordRecovery} disabled={loading}>
                    <Text style={styles.cancelText}>Cancelar e voltar ao login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FED2E5' },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    iconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#FFE1EE',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#603F4F',
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        color: '#8F6277',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 28,
    },
    field: { marginBottom: 16 },
    label: { color: '#603F4F', fontWeight: '600', marginBottom: 7 },
    inputRow: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#DDB0C4',
        paddingHorizontal: 16,
    },
    input: { flex: 1, color: '#35252D', fontSize: 16, paddingVertical: 12 },
    primaryButton: {
        minHeight: 54,
        borderRadius: 27,
        backgroundColor: '#8F6277',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    cancelText: {
        color: '#8F6277',
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: 20,
    },
});
