import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    Dimensions,
    ImageStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

import { useFormModal, EntityType } from '../contexts/FormModalContext';
import { useAlert } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../js/supabase';
import { uploadImage } from '../js/uploadImage';
import { isValidBrazilianDate } from '../js/validation';
import {
    ImageWithPlaceholder,
    ProgressBar,
    StarRating,
    MaskedDateInput,
} from './index';

const { height } = Dimensions.get('window');

const GENEROS = [
    { label: "Ação", value: "Acao" },
    { label: "Aventura", value: "Aventura" },
    { label: "Animação", value: "Animacao" },
    { label: "Comédia", value: "Comedia" },
    { label: "Crime", value: "Crime" },
    { label: "Documentário", value: "Documentario" },
    { label: "Drama", value: "Drama" },
    { label: "Fantasia", value: "Fantasia" },
    { label: "Ficção científica", value: "Ficcao Cientifica" },
    { label: "Guerra", value: "Guerra" },
    { label: "História", value: "Historia" },
    { label: "Horror", value: "Horror" },
    { label: "Mistério", value: "Misterio" },
    { label: "Musical", value: "Musical" },
    { label: "Romance", value: "Romance" },
    { label: "Suspense", value: "Suspense" },
    { label: "Terror", value: "Terror" },
    { label: "Western", value: "Western" },
];

const DEFAULT_IMAGE = '';

interface FormModalProps {
    onSave?: () => void;
}

const FormModal: React.FC<FormModalProps> = ({ onSave }) => {
    const { state, close, notifySaved } = useFormModal();
    const { alert, showAlert } = useAlert();
    const { session } = useAuth();
    const { isOpen, mode, entity, editingItem, filmes } = state;

    // Form state
    const [formData, setFormData] = useState<any>({});
    const [imagePath, setImagePath] = useState(DEFAULT_IMAGE);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const userId = session?.user.id ?? null;

    // Reset form when modal opens/closes or entity changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && editingItem) {
                setFormData({ ...editingItem });
                if (editingItem.urlfoto) {
                    setImagePath(editingItem.urlfoto);
                } else {
                    setImagePath(DEFAULT_IMAGE);
                }
            } else {
                setFormData(getDefaultFormData(entity));
                setImagePath(DEFAULT_IMAGE);
            }
        }
    }, [isOpen, mode, entity, editingItem]);

    const getDefaultFormData = (entity: EntityType) => {
        switch (entity) {
            case 'filme':
                return { titulo: '', genero: '', sinopse: '', datalancamento: '', urlfoto: '' };
            case 'resenha':
                return { idFilme: '0', titulo: '', texto: '', estrelas: 0 };
            case 'cena':
                return { idFilme: '0', titulo: '', descricao: '', observacao: '', estrelas: 0, urlfoto: '' };
            default:
                return {};
        }
    };

    const getTitle = () => {
        const action = mode === 'create' ? 'Adicionar' : 'Editar';
        const entityName = entity === 'filme' ? 'Filme' : entity === 'resenha' ? 'Resenha' : 'Cena';
        return `${action} ${entityName}`;
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    // Image handling
    const selecionaFoto = () => {
        showAlert({
            title: "Selecionar Foto",
            message: "Escolha uma opção:",
            buttons: [
                { text: "Câmera", style: "default", onPress: () => abrirCamera() },
                { text: "Galeria", style: "default", onPress: () => abrirGaleria() },
                { text: "Cancelar", style: "cancel" },
            ],
        });
    };

    const abrirCamera = async () => {
        const permissao = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissao.granted) {
            alert("Você precisa permitir o acesso à câmera.");
            return;
        }
        const foto = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
        });
        if (!foto.canceled && foto.assets?.[0]) {
            enviaFoto(foto.assets[0]);
        }
    };

    const abrirGaleria = async () => {
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissao.granted) {
            alert("Você precisa permitir o acesso à galeria.");
            return;
        }
        const foto = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
        });
        if (!foto.canceled && foto.assets?.[0]) {
            enviaFoto(foto.assets[0]);
        }
    };

    const enviaFoto = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!userId || !asset.uri) {
            alert("Não foi possível processar a imagem.");
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setImagePath(asset.uri);

        const { url, error } = await uploadImage(asset.uri, userId, {
            onProgress: (progress) => setUploadProgress(progress),
        });

        if (error) {
            alert('Erro ao enviar imagem: ' + error);
            setUploading(false);
            setUploadProgress(0);
            return;
        }

        if (url) {
            updateField('urlfoto', url);
        }

        setUploading(false);
        setUploadProgress(0);
    };

    // Validation
    const validar = (): boolean => {
        switch (entity) {
            case 'filme':
                if (!formData.titulo?.trim()) {
                    alert("O título é obrigatório.");
                    return false;
                }
                if (!formData.genero) {
                    alert("O gênero é obrigatório.");
                    return false;
                }
                if (!formData.datalancamento?.trim()) {
                    alert("A data de lançamento é obrigatória.");
                    return false;
                }
                if (!isValidBrazilianDate(formData.datalancamento)) {
                    alert("Digite uma data de lançamento válida.");
                    return false;
                }
                if (!formData.urlfoto) {
                    alert("É necessário adicionar uma foto do filme.");
                    return false;
                }
                break;

            case 'resenha':
                if (!formData.idFilme || formData.idFilme === '0') {
                    alert("Selecione um filme.");
                    return false;
                }
                if (!formData.titulo?.trim()) {
                    alert("O título é obrigatório.");
                    return false;
                }
                if (!formData.texto?.trim()) {
                    alert("O texto da resenha é obrigatório.");
                    return false;
                }
                break;

            case 'cena':
                if (!formData.idFilme || formData.idFilme === '0') {
                    alert("Selecione um filme.");
                    return false;
                }
                if (!formData.titulo?.trim()) {
                    alert("O título é obrigatório.");
                    return false;
                }
                if (!formData.descricao?.trim()) {
                    alert("A descrição é obrigatória.");
                    return false;
                }
                if (!formData.urlfoto) {
                    alert("É necessário adicionar uma foto da cena.");
                    return false;
                }
                break;
        }
        return true;
    };

    // Save
    const salvar = async () => {
        if (!validar()) return;
        if (!userId) {
            alert('Sua sessão expirou. Entre novamente para salvar.');
            return;
        }

        const tableName = entity === 'filme' ? 'filmes' : entity === 'resenha' ? 'resenhas' : 'cenas';

        setSaving(true);
        try {
            if (mode === 'create') {
                let insertData: any = { user_id: userId };

                if (entity === 'filme') {
                    insertData = {
                        ...insertData,
                        titulo: formData.titulo,
                        genero: formData.genero,
                        sinopse: formData.sinopse || '',
                        datalancamento: formData.datalancamento,
                        urlfoto: formData.urlfoto,
                    };
                } else if (entity === 'resenha') {
                    insertData = {
                        ...insertData,
                        id_filme: formData.idFilme,
                        titulo: formData.titulo,
                        texto: formData.texto,
                        estrelas: formData.estrelas || 0,
                    };
                } else if (entity === 'cena') {
                    insertData = {
                        ...insertData,
                        id_filme: formData.idFilme,
                        titulo: formData.titulo,
                        descricao: formData.descricao,
                        observacao: formData.observacao || '',
                        estrelas: formData.estrelas || 0,
                        urlfoto: formData.urlfoto,
                    };
                }

                const { error } = await supabase.from(tableName).insert(insertData);

                if (error) {
                    alert("Erro ao salvar: " + error.message);
                    return;
                }

                alert(`${getTitle().replace('Adicionar ', '')} adicionado(a) com sucesso!`);
            } else {
                let updateData: any = {};

                if (entity === 'filme') {
                    updateData = {
                        titulo: formData.titulo,
                        genero: formData.genero,
                        sinopse: formData.sinopse || '',
                        datalancamento: formData.datalancamento,
                        urlfoto: formData.urlfoto,
                    };
                } else if (entity === 'resenha') {
                    updateData = {
                        id_filme: formData.idFilme,
                        titulo: formData.titulo,
                        texto: formData.texto,
                        estrelas: formData.estrelas || 0,
                    };
                } else if (entity === 'cena') {
                    updateData = {
                        id_filme: formData.idFilme,
                        titulo: formData.titulo,
                        descricao: formData.descricao,
                        observacao: formData.observacao || '',
                        estrelas: formData.estrelas || 0,
                        urlfoto: formData.urlfoto,
                    };
                }

                const { error } = await supabase
                    .from(tableName)
                    .update(updateData)
                    .eq('id', formData.id)
                    .eq('user_id', userId);

                if (error) {
                    alert("Erro ao editar: " + error.message);
                    return;
                }

                alert(`${getTitle().replace('Editar ', '')} editado(a) com sucesso!`);
            }

            close();
            notifySaved();
            onSave?.();
        } catch (err: any) {
            alert("Erro: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Render form fields based on entity
    const renderFilmeForm = () => (
        <>
            <Pressable onPress={selecionaFoto} disabled={uploading}>
                <View style={styles.imagemView}>
                    <ImageWithPlaceholder
                        uri={imagePath}
                        style={styles.imagem as ImageStyle}
                    />
                    {uploading && <ProgressBar progress={uploadProgress} />}
                    <Text style={styles.imageHint}>Toque para selecionar foto</Text>
                </View>
            </Pressable>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Título *</Text>
                <TextInput
                    placeholder="Digite o título"
                    value={formData.titulo || ''}
                    onChangeText={(text) => updateField('titulo', text)}
                    style={styles.input}
                />
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Gênero *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.genero || ''}
                        onValueChange={(value) => updateField('genero', value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Selecione um gênero..." value="" color="#777" />
                        {GENEROS.map((item) => (
                            <Picker.Item key={item.value} label={item.label} value={item.value} />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Sinopse</Text>
                <TextInput
                    placeholder="Digite a sinopse"
                    value={formData.sinopse || ''}
                    onChangeText={(text) => updateField('sinopse', text)}
                    style={[styles.input, styles.textArea]}
                    multiline
                />
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Data de lançamento *</Text>
                <MaskedDateInput
                    value={formData.datalancamento || ''}
                    onChangeText={(text) => updateField('datalancamento', text)}
                    placeholder="DD/MM/AAAA"
                />
            </View>
        </>
    );

    const renderResenhaForm = () => (
        <>
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Filme *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.idFilme || '0'}
                        onValueChange={(value) => updateField('idFilme', value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Selecione um filme..." value="0" color="#777" />
                        {filmes.map((filme: any) => (
                            <Picker.Item key={filme.id} label={filme.titulo} value={filme.id} />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Título *</Text>
                <TextInput
                    placeholder="Digite o título da resenha"
                    value={formData.titulo || ''}
                    onChangeText={(text) => updateField('titulo', text)}
                    style={styles.input}
                />
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Texto *</Text>
                <TextInput
                    placeholder="Digite sua resenha"
                    value={formData.texto || ''}
                    onChangeText={(text) => updateField('texto', text)}
                    style={[styles.input, styles.textArea]}
                    multiline
                />
            </View>

            <View style={[styles.fieldContainer, { alignItems: 'center' }]}>
                <Text style={styles.label}>Avaliação</Text>
                <StarRating
                    rating={formData.estrelas || 0}
                    onRatingChange={(rating) => updateField('estrelas', rating)}
                    size={36}
                />
            </View>
        </>
    );

    const renderCenaForm = () => (
        <>
            <Pressable onPress={selecionaFoto} disabled={uploading}>
                <View style={styles.imagemView}>
                    <ImageWithPlaceholder
                        uri={imagePath}
                        style={styles.imagem as ImageStyle}
                    />
                    {uploading && <ProgressBar progress={uploadProgress} />}
                    <Text style={styles.imageHint}>Toque para selecionar foto</Text>
                </View>
            </Pressable>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Filme *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.idFilme || '0'}
                        onValueChange={(value) => updateField('idFilme', value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Selecione um filme..." value="0" color="#777" />
                        {filmes.map((filme: any) => (
                            <Picker.Item key={filme.id} label={filme.titulo} value={filme.id} />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Título *</Text>
                <TextInput
                    placeholder="Digite o título"
                    value={formData.titulo || ''}
                    onChangeText={(text) => updateField('titulo', text)}
                    style={styles.input}
                />
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Descrição *</Text>
                <TextInput
                    placeholder="Descreva a cena"
                    value={formData.descricao || ''}
                    onChangeText={(text) => updateField('descricao', text)}
                    style={[styles.input, styles.textArea]}
                    multiline
                />
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Observação</Text>
                <TextInput
                    placeholder="Observações adicionais"
                    value={formData.observacao || ''}
                    onChangeText={(text) => updateField('observacao', text)}
                    style={styles.input}
                />
            </View>

            <View style={[styles.fieldContainer, { alignItems: 'center' }]}>
                <Text style={styles.label}>Avaliação</Text>
                <StarRating
                    rating={formData.estrelas || 0}
                    onRatingChange={(rating) => updateField('estrelas', rating)}
                    size={36}
                />
            </View>
        </>
    );

    return (
        <Modal
            isVisible={isOpen}
            onBackdropPress={close}
            onBackButtonPress={close}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={300}
            animationOutTiming={300}
            backdropOpacity={0.5}
            style={styles.modal}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{getTitle()}</Text>
                    <TouchableOpacity onPress={close} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#8F6277" />
                    </TouchableOpacity>
                </View>

                {/* Form Content */}
                <KeyboardAwareScrollView
                    contentContainerStyle={styles.formContent}
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    keyboardShouldPersistTaps="handled"
                    extraScrollHeight={20}
                    showsVerticalScrollIndicator={false}
                >
                    {entity === 'filme' && renderFilmeForm()}
                    {entity === 'resenha' && renderResenhaForm()}
                    {entity === 'cena' && renderCenaForm()}
                </KeyboardAwareScrollView>

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={close}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.saveButton, (uploading || saving) && styles.disabledButton]}
                        onPress={salvar}
                        disabled={uploading || saving}
                    >
                        <Text style={styles.saveButtonText}>
                            {uploading ? 'Enviando imagem...' : saving ? 'Salvando...' : 'Salvar'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FED2E5',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: height * 0.9,
        minHeight: height * 0.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#DDB0C4',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8F6277',
    },
    closeButton: {
        padding: 4,
    },
    formContent: {
        padding: 20,
        paddingBottom: 10,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8F6277',
        marginBottom: 6,
    },
    input: {
        backgroundColor: 'rgba(173, 126, 148, 0.3)',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#CD9CB2',
        color: '#000',
        fontSize: 15,
    },
    pickerContainer: {
        backgroundColor: 'rgba(173, 126, 148, 0.3)',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#CD9CB2',
        overflow: 'hidden',
    },
    picker: {
        color: '#35252D',
        backgroundColor: 'transparent',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    imagemView: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imagem: {
        width: 150,
        height: 150,
        borderRadius: 12,
    },
    imageHint: {
        marginTop: 8,
        fontSize: 12,
        color: '#AD7E94',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 2,
        borderTopColor: '#DDB0C4',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#FFE1EE',
        borderWidth: 2,
        borderColor: '#8F6277',
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#8F6277',
        fontWeight: '600',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#8F6277',
        borderRadius: 25,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default FormModal;
