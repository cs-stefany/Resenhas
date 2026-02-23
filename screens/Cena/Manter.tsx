import { View, Text, TextInput, TouchableOpacity, Pressable, ImageStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "../../js/supabase";
import { uploadImage } from "../../js/uploadImage";
import { useAlert } from "../../contexts/AlertContext";
import React, { useEffect, useState } from "react";
import Picker from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";
import { Filme } from "../../model/Filme";
import style from "../../js/style";
import * as ImagePicker from "expo-image-picker";
import { Cena } from "../../model/Cena";
import {
    Loading,
    StarRating,
    ImageWithPlaceholder,
    ProgressBar,
} from "../../components";

const Manter = () => {
    const [formCena, setFormCena] = useState<Partial<Cena>>({ idFilme: "0", estrelas: 0 });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);
    const [cenas, setCenas] = useState<Cena[]>([]);
    const [filmes, setFilmes] = useState<Filme[]>([]);
    const [imagePath, setImagePath] = useState("https://cdn-icons-png.flaticon.com/512/723/723082.png");

    const { alert, showAlert, confirmDelete } = useAlert();

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                fetchData(user.id);
                setupSubscriptions(user.id);
            }
        };
        init();
    }, []);

    const fetchData = async (uid: string) => {
        const { data: cenasData } = await supabase
            .from('cenas')
            .select('*')
            .eq('user_id', uid);

        if (cenasData) {
            setCenas(cenasData.map(c => ({ ...c, key: c.id, idFilme: c.id_filme })));
        }

        const { data: filmesData } = await supabase
            .from('filmes')
            .select('*')
            .eq('user_id', uid);

        if (filmesData) {
            setFilmes(filmesData.map(f => ({ ...f, key: f.id })));
        }

        setLoading(false);
    };

    const setupSubscriptions = (uid: string) => {
        const cenasChannel = supabase
            .channel('cenas_manter')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'cenas',
                    filter: `user_id=eq.${uid}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setCenas(prev => [...prev, { ...payload.new as any, key: payload.new.id, idFilme: payload.new.id_filme }]);
                    } else if (payload.eventType === 'UPDATE') {
                        setCenas(prev => prev.map(c =>
                            c.id === payload.new.id ? { ...payload.new as any, key: payload.new.id, idFilme: payload.new.id_filme } : c
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setCenas(prev => prev.filter(c => c.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        const filmesChannel = supabase
            .channel('filmes_cenas_manter')
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
            supabase.removeChannel(cenasChannel);
            supabase.removeChannel(filmesChannel);
        };
    };

    const Verificar = () => {
        if (!formCena.idFilme || formCena.idFilme === "0") {
            alert("O filme é obrigatório para salvar a cena.");
            return false;
        }

        if (!formCena.titulo || formCena.titulo.length === 0) {
            alert("O título é obrigatório para salvar a cena.");
            return false;
        }

        if (!formCena.descricao || formCena.descricao.length === 0) {
            alert("A descrição é obrigatória para salvar a cena.");
            return false;
        }

        if (!formCena.urlfoto || formCena.urlfoto.length === 0) {
            alert("É necessário uma foto da cena para salvar.");
            return false;
        }

        return true;
    };

    const Salvar = async () => {
        if (!Verificar() || !userId) return;

        if (!formCena.id) {
            const { error } = await supabase
                .from('cenas')
                .insert({
                    user_id: userId,
                    id_filme: formCena.idFilme,
                    titulo: formCena.titulo,
                    descricao: formCena.descricao,
                    observacao: formCena.observacao || '',
                    estrelas: formCena.estrelas || 0,
                    urlfoto: formCena.urlfoto,
                });

            if (error) {
                alert("Erro ao salvar: " + error.message);
                return;
            }

            alert("Cena adicionada com sucesso!");
            Limpar();
        } else {
            const { error } = await supabase
                .from('cenas')
                .update({
                    id_filme: formCena.idFilme,
                    titulo: formCena.titulo,
                    descricao: formCena.descricao,
                    observacao: formCena.observacao || '',
                    estrelas: formCena.estrelas || 0,
                    urlfoto: formCena.urlfoto,
                })
                .eq('id', formCena.id);

            if (error) {
                alert("Erro ao editar: " + error.message);
                return;
            }

            alert("Cena editada com sucesso!");
            Limpar();
        }
    };

    const Limpar = () => {
        setFormCena({ idFilme: "0", estrelas: 0 });
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
            setFormCena({ ...formCena, urlfoto: url });
        }

        setUploading(false);
        setUploadProgress(0);
    };

    if (loading) {
        return <Loading />;
    }

    const excluir = async (item: Cena) => {
        confirmDelete(item.titulo || "esta cena", async () => {
            const { error } = await supabase
                .from('cenas')
                .delete()
                .eq('id', item.id);

            if (error) {
                alert("Erro ao excluir: " + error.message);
                return;
            }

            alert("Cena excluída com sucesso!");
            Limpar();
        });
    };

    const editar = (item: Cena) => {
        setFormCena({
            id: item.id,
            idFilme: item.idFilme,
            titulo: item.titulo,
            descricao: item.descricao,
            observacao: item.observacao,
            estrelas: item.estrelas,
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
            {filmes.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center', marginTop: 50 }}>
                    <Text style={style.textNews}>Nenhum filme cadastrado.</Text>
                    <Text style={[style.textNews, { marginTop: 10 }]}>Cadastre um filme primeiro para adicionar cenas.</Text>
                </View>
            ) : (
                <>
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

                        <Picker
                            placeholder={{
                                label: "Selecione um filme...",
                                value: "0",
                            }}
                            style={{ viewContainer: [style.input, { padding: 0 }], placeholder: { color: "#444" } }}
                            onValueChange={(valor) => {
                                setFormCena({
                                    ...formCena,
                                    idFilme: valor,
                                });
                            }}
                            value={formCena.idFilme}
                            items={filmes.map((filme) => ({
                                label: filme.titulo,
                                value: filme.id,
                            }))}
                        />
                        <View style={style.distancia}>
                            <TextInput
                                placeholder="Título *"
                                value={formCena.titulo || ''}
                                onChangeText={(texto) =>
                                    setFormCena({
                                        ...formCena,
                                        titulo: texto,
                                    })
                                }
                                style={style.input}
                            />
                        </View>
                        <View style={style.distancia}>
                            <TextInput
                                placeholder="Descrição *"
                                value={formCena.descricao || ''}
                                onChangeText={(texto) =>
                                    setFormCena({
                                        ...formCena,
                                        descricao: texto,
                                    })
                                }
                                style={[style.input, { minHeight: 80, textAlignVertical: 'top' }]}
                                multiline
                            />
                        </View>
                        <View style={style.distancia}>
                            <TextInput
                                placeholder="Observação"
                                value={formCena.observacao || ''}
                                onChangeText={(texto) =>
                                    setFormCena({
                                        ...formCena,
                                        observacao: texto,
                                    })
                                }
                                style={style.input}
                            />
                        </View>
                        <View style={[style.distancia, { alignItems: 'center' }]}>
                            <Text style={{ color: '#8F6277', marginBottom: 10, fontWeight: '600' }}>
                                Avaliação:
                            </Text>
                            <StarRating
                                rating={formCena.estrelas || 0}
                                onRatingChange={(rating) =>
                                    setFormCena({
                                        ...formCena,
                                        estrelas: rating,
                                    })
                                }
                                size={36}
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
                </>
            )}

            {cenas.length > 0 && (
                <View>
                    <Text style={[style.textNews, { marginBottom: 20 }]}>Cenas cadastradas</Text>
                </View>
            )}

            {cenas.map((item) => (
                <View key={item.id} style={style.item}>
                    <View style={style.itemContent}>
                        <Text style={style.titulo}>Filme: {filmes.find((f) => f.id === item.idFilme)?.titulo || "N/A"}</Text>
                        <Text style={style.titulo}>Título: {item.titulo}</Text>
                        <Text style={style.titulo}>Descrição: {item.descricao}</Text>
                        <Text style={style.titulo}>Observação: {item.observacao}</Text>
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <StarRating
                            rating={item.estrelas || 0}
                            size={24}
                            disabled={true}
                        />
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
