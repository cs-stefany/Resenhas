import { View, Text, TextInput, TouchableOpacity, Pressable, ImageStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "../../js/supabase";
import { uploadImage } from "../../js/uploadImage";
import { useAlert } from "../../contexts/AlertContext";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Picker from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";
import { Filme } from "../../model/Filme";
import style from "../../js/style";
import {
    Loading,
    MaskedDateInput,
    ImageWithPlaceholder,
    ProgressBar,
} from "../../components";

const GENEROS = [
    { label: "Ação", value: "Ação" },
    { label: "Aventura", value: "Aventura" },
    { label: "Animação", value: "Animação" },
    { label: "Comédia", value: "Comédia" },
    { label: "Crime", value: "Crime" },
    { label: "Documentário", value: "Documentário" },
    { label: "Drama", value: "Drama" },
    { label: "Fantasia", value: "Fantasia" },
    { label: "Ficção Científica", value: "Ficção Científica" },
    { label: "Guerra", value: "Guerra" },
    { label: "História", value: "História" },
    { label: "Horror", value: "Horror" },
    { label: "Mistério", value: "Mistério" },
    { label: "Musical", value: "Musical" },
    { label: "Romance", value: "Romance" },
    { label: "Suspense", value: "Suspense" },
    { label: "Terror", value: "Terror" },
    { label: "Western", value: "Western" },
];

const Manter = () => {
    const [formFilme, setFormFilme] = useState<Partial<Filme>>({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [filmes, setFilmes] = useState<Filme[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [imagePath, setImagePath] = useState("https://cdn-icons-png.flaticon.com/512/723/723082.png");

    const { alert, showAlert, confirmDelete } = useAlert();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                fetchFilmes(user.id);
                setupSubscription(user.id);
            }
        };
        init();
    }, []);

    const fetchFilmes = async (uid: string) => {
        const { data, error } = await supabase
            .from('filmes')
            .select('*')
            .eq('user_id', uid);

        if (!error && data) {
            setFilmes(data.map(f => ({ ...f, key: f.id })));
        }
        setLoading(false);
    };

    const setupSubscription = (uid: string) => {
        const channel = supabase
            .channel('filmes_manter')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'filmes',
                    filter: `user_id=eq.${uid}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setFilmes(prev => [...prev, { ...payload.new as Filme, key: payload.new.id }]);
                    } else if (payload.eventType === 'UPDATE') {
                        setFilmes(prev => prev.map(f =>
                            f.id === payload.new.id ? { ...payload.new as Filme, key: payload.new.id } : f
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setFilmes(prev => prev.filter(f => f.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const Verificar = () => {
        if (!formFilme.titulo || formFilme.titulo.length === 0) {
            alert("O título é obrigatório para salvar o filme.");
            return false;
        }

        if (!formFilme.genero || formFilme.genero.length === 0) {
            alert("O gênero é obrigatório para salvar o filme.");
            return false;
        }

        if (!formFilme.datalancamento || formFilme.datalancamento.length === 0) {
            alert("A data de lançamento é obrigatória para salvar o filme.");
            return false;
        }

        if (!formFilme.urlfoto || formFilme.urlfoto.length === 0) {
            alert("É necessário uma foto do filme para salvar.");
            return false;
        }

        return true;
    };

    const Salvar = async () => {
        if (!Verificar() || !userId) return;

        if (!formFilme.id) {
            const { error } = await supabase
                .from('filmes')
                .insert({
                    user_id: userId,
                    titulo: formFilme.titulo,
                    genero: formFilme.genero,
                    sinopse: formFilme.sinopse || '',
                    datalancamento: formFilme.datalancamento,
                    urlfoto: formFilme.urlfoto,
                });

            if (error) {
                alert("Erro ao salvar: " + error.message);
                return;
            }

            alert("Filme adicionado com sucesso!");
            Limpar();
        } else {
            const { error } = await supabase
                .from('filmes')
                .update({
                    titulo: formFilme.titulo,
                    genero: formFilme.genero,
                    sinopse: formFilme.sinopse || '',
                    datalancamento: formFilme.datalancamento,
                    urlfoto: formFilme.urlfoto,
                })
                .eq('id', formFilme.id);

            if (error) {
                alert("Erro ao editar: " + error.message);
                return;
            }

            alert("Filme editado com sucesso!");
            Limpar();
        }
    };

    const Limpar = () => {
        setFormFilme({});
        setImagePath("https://cdn-icons-png.flaticon.com/512/723/723082.png");
    };

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
        if (permissao.granted === false) {
            alert("Você precisa permitir o acesso à câmera para tirar fotos.");
            return;
        }
        const foto = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
        });
        if (!foto.canceled && foto.assets && foto.assets.length > 0) {
            enviaFoto(foto.assets[0]);
        }
    };

    const abrirGaleria = async () => {
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissao.granted === false) {
            alert("Você precisa permitir o acesso à galeria para selecionar fotos.");
            return;
        }
        const foto = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });
        if (!foto.canceled && foto.assets && foto.assets.length > 0) {
            enviaFoto(foto.assets[0]);
        }
    };

    const enviaFoto = async (asset: ImagePicker.ImagePickerAsset) => {
        if (!userId || !asset.uri) {
            alert("Erro: não foi possível processar a imagem.");
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
            setFormFilme({ ...formFilme, urlfoto: url });
        }

        setUploading(false);
        setUploadProgress(0);
    };

    if (loading) {
        return <Loading />;
    }

    const excluir = async (item: Filme) => {
        confirmDelete(item.titulo || "este filme", async () => {
            const { error } = await supabase
                .from('filmes')
                .delete()
                .eq('id', item.id);

            if (error) {
                alert("Erro ao excluir: " + error.message);
                return;
            }

            alert("Filme excluído com sucesso!");
            Limpar();
        });
    };

    const editar = (item: Filme) => {
        setFormFilme({
            id: item.id,
            titulo: item.titulo,
            genero: item.genero,
            sinopse: item.sinopse,
            datalancamento: item.datalancamento,
            urlfoto: item.urlfoto,
        });
        setImagePath(item.urlfoto || "https://cdn-icons-png.flaticon.com/512/723/723082.png");
    };

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1, backgroundColor: "#FED2E5" }}
            contentContainerStyle={style.scrollContainer}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={20}
            showsVerticalScrollIndicator={false}
        >
            <View style={style.inputContainer}>
                <Pressable onPress={() => selecionaFoto()} disabled={uploading}>
                    <View style={style.imagemView}>
                        <ImageWithPlaceholder
                            uri={imagePath}
                            style={style.imagem as ImageStyle}
                        />
                        {uploading && (
                            <ProgressBar progress={uploadProgress} />
                        )}
                    </View>
                </Pressable>
                <View style={style.distancia}>
                    <TextInput
                        placeholder="Título *"
                        value={formFilme.titulo || ''}
                        onChangeText={(texto) =>
                            setFormFilme({
                                ...formFilme,
                                titulo: texto,
                            })
                        }
                        style={style.input}
                    />
                </View>
                <View style={style.distancia}>
                    <Picker
                        placeholder={{
                            label: "Selecione um gênero...",
                            value: "",
                        }}
                        style={{
                            viewContainer: [style.input, { padding: 0 }],
                            placeholder: { color: "#444" }
                        }}
                        onValueChange={(valor) => {
                            setFormFilme({
                                ...formFilme,
                                genero: valor,
                            });
                        }}
                        value={formFilme.genero || ''}
                        items={GENEROS}
                    />
                </View>
                <View style={style.distancia}>
                    <TextInput
                        placeholder="Sinopse"
                        value={formFilme.sinopse || ''}
                        onChangeText={(texto) =>
                            setFormFilme({
                                ...formFilme,
                                sinopse: texto,
                            })
                        }
                        style={style.input}
                        multiline
                    />
                </View>
                <View style={style.distancia}>
                    <MaskedDateInput
                        value={formFilme.datalancamento || ''}
                        onChangeText={(texto) =>
                            setFormFilme({
                                ...formFilme,
                                datalancamento: texto,
                            })
                        }
                        placeholder="Data de lançamento *"
                    />
                </View>
            </View>
            <View style={style.buttonContainer}>
                <TouchableOpacity style={style.buttonOutline} onPress={Limpar}>
                    <Text style={style.buttonOutlineText}>Limpar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.buttonSave} onPress={Salvar} disabled={uploading}>
                    <Text style={style.buttonText}>{uploading ? 'Enviando...' : 'Salvar'}</Text>
                </TouchableOpacity>
            </View>

            {filmes.length > 0 && (
                <View>
                    <Text style={[style.textNews, { marginBottom: 20 }]}>Filmes cadastrados</Text>
                </View>
            )}

            {filmes.map((item) => (
                <View key={item.id} style={style.item}>
                    <View style={style.itemContent}>
                        <Text style={style.titulo}>Título: {item.titulo}</Text>
                        <Text style={style.titulo}>Gênero: {item.genero}</Text>
                        <Text style={style.titulo}>Sinopse: {item.sinopse}</Text>
                        <Text style={style.titulo}>Lançamento: {item.datalancamento}</Text>
                    </View>
                    <ImageWithPlaceholder
                        uri={item.urlfoto || ''}
                        style={style.imagem as ImageStyle}
                    />
                    <View style={style.itemActions}>
                        <TouchableOpacity
                            style={[style.actionButton, style.editButton]}
                            onPress={() => editar(item)}
                        >
                            <Ionicons name="pencil" size={18} color="#FFFFFF" />
                            <Text style={style.actionButtonText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[style.actionButton, style.deleteButton]}
                            onPress={() => excluir(item)}
                        >
                            <Ionicons name="trash" size={18} color="#FFFFFF" />
                            <Text style={style.actionButtonText}>Excluir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </KeyboardAwareScrollView>
    );
};

export default Manter;
