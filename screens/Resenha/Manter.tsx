import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "../../js/supabase";
import { useAlert } from "../../contexts/AlertContext";
import React, { useEffect, useState } from "react";
import Picker from "react-native-picker-select";
import { Resenha } from "../../model/Resenha";
import { Filme } from "../../model/Filme";
import style from "../../js/style";
import { Loading } from "../../components";

const Manter = () => {
    const [formResenha, setFormResenha] = useState<Partial<Resenha>>({ idFilme: "0" });
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [resenhas, setResenhas] = useState<Resenha[]>([]);
    const [filmes, setFilmes] = useState<Filme[]>([]);

    const { alert, confirmDelete } = useAlert();

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
        const { data: resenhasData } = await supabase
            .from('resenhas')
            .select('*')
            .eq('user_id', uid);

        if (resenhasData) {
            setResenhas(resenhasData.map(r => ({ ...r, key: r.id, idFilme: r.id_filme })));
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
        const resenhasChannel = supabase
            .channel('resenhas_manter')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'resenhas',
                    filter: `user_id=eq.${uid}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setResenhas(prev => [...prev, { ...payload.new as any, key: payload.new.id, idFilme: payload.new.id_filme }]);
                    } else if (payload.eventType === 'UPDATE') {
                        setResenhas(prev => prev.map(r =>
                            r.id === payload.new.id ? { ...payload.new as any, key: payload.new.id, idFilme: payload.new.id_filme } : r
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setResenhas(prev => prev.filter(r => r.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        const filmesChannel = supabase
            .channel('filmes_resenhas_manter')
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
            supabase.removeChannel(resenhasChannel);
            supabase.removeChannel(filmesChannel);
        };
    };

    const Verificar = () => {
        if (!formResenha.idFilme || formResenha.idFilme === "0") {
            alert("Selecione um filme para criar a resenha.");
            return false;
        }

        if (!formResenha.titulo || formResenha.titulo.length === 0) {
            alert("O título é obrigatório.");
            return false;
        }

        if (!formResenha.texto || formResenha.texto.length === 0) {
            alert("O texto da resenha é obrigatório.");
            return false;
        }

        return true;
    };

    const Salvar = async () => {
        if (!Verificar() || !userId) return;

        if (!formResenha.id) {
            const { error } = await supabase
                .from('resenhas')
                .insert({
                    user_id: userId,
                    id_filme: formResenha.idFilme,
                    titulo: formResenha.titulo,
                    texto: formResenha.texto,
                    estrelas: formResenha.estrelas || 0,
                });

            if (error) {
                alert("Erro ao salvar: " + error.message);
                return;
            }

            alert("Resenha adicionada com sucesso!");
            Limpar();
        } else {
            const { error } = await supabase
                .from('resenhas')
                .update({
                    id_filme: formResenha.idFilme,
                    titulo: formResenha.titulo,
                    texto: formResenha.texto,
                    estrelas: formResenha.estrelas || 0,
                })
                .eq('id', formResenha.id);

            if (error) {
                alert("Erro ao editar: " + error.message);
                return;
            }

            alert("Resenha editada com sucesso!");
            Limpar();
        }
    };

    const Limpar = () => {
        setFormResenha({ idFilme: "0" });
    };

    if (loading) {
        return <Loading />;
    }

    const excluir = async (item: Resenha) => {
        confirmDelete(item.titulo || "esta resenha", async () => {
            const { error } = await supabase
                .from('resenhas')
                .delete()
                .eq('id', item.id);

            if (error) {
                alert("Erro ao excluir: " + error.message);
                return;
            }

            alert("Resenha excluída com sucesso!");
            Limpar();
        });
    };

    const editar = (item: Resenha) => {
        setFormResenha({
            id: item.id,
            idFilme: item.idFilme,
            titulo: item.titulo,
            texto: item.texto,
            estrelas: item.estrelas,
        });
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
                    <Text style={[style.textNews, { marginTop: 10 }]}>Cadastre um filme primeiro para criar resenhas.</Text>
                </View>
            ) : (
                <>
                    <View style={[style.inputContainer, { marginTop: 50 }]}>
                        <Picker
                            placeholder={{
                                label: "Selecione um filme...",
                                value: "0",
                            }}
                            style={{ viewContainer: [style.input, { padding: 0 }], placeholder: { color: "#444" } }}
                            onValueChange={(valor) => {
                                setFormResenha({
                                    ...formResenha,
                                    idFilme: valor,
                                });
                            }}
                            value={formResenha.idFilme}
                            items={filmes.map((filme) => ({
                                label: filme.titulo,
                                value: filme.id,
                            }))}
                        />
                        <View style={style.distancia}>
                            <TextInput
                                placeholder="Título da resenha *"
                                value={formResenha.titulo || ''}
                                onChangeText={(texto) =>
                                    setFormResenha({
                                        ...formResenha,
                                        titulo: texto,
                                    })
                                }
                                style={style.input}
                            />
                        </View>
                        <View style={style.distancia}>
                            <TextInput
                                placeholder="Texto da resenha *"
                                value={formResenha.texto || ''}
                                onChangeText={(texto) =>
                                    setFormResenha({
                                        ...formResenha,
                                        texto: texto,
                                    })
                                }
                                style={style.input}
                                multiline
                            />
                        </View>
                        <View style={style.distancia}>
                            <TextInput
                                placeholder="Estrelas (0-5)"
                                keyboardType="numeric"
                                value={(formResenha.estrelas || 0).toString()}
                                onChangeText={(texto) => {
                                    const num = parseInt(texto) || 0;
                                    setFormResenha({
                                        ...formResenha,
                                        estrelas: Math.min(5, Math.max(0, num)),
                                    });
                                }}
                                style={style.input}
                            />
                        </View>
                    </View>
                    <View style={style.buttonContainer}>
                        <TouchableOpacity style={style.buttonOutline} onPress={Limpar}>
                            <Text style={style.buttonOutlineText}>Limpar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={style.buttonSave} onPress={Salvar}>
                            <Text style={style.buttonText}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {resenhas.length > 0 && (
                <View>
                    <Text style={style.textNews}>Clique para editar ou</Text>
                    <Text style={[style.textNews, { marginBottom: 40 }]}>pressione para excluir</Text>
                </View>
            )}

            {resenhas.map((item, i) => (
                <TouchableOpacity
                    key={i}
                    style={style.item}
                    onPress={() => editar(item)}
                    onLongPress={() => excluir(item)}
                >
                    <Text style={style.titulo}>Filme: {filmes.find((f) => f.id === item.idFilme)?.titulo || "N/A"}</Text>
                    <Text style={style.titulo}>Título: {item.titulo}</Text>
                    <Text style={style.titulo}>Texto: {item.texto}</Text>
                    <Text style={style.titulo}>Estrelas: {"⭐".repeat(item.estrelas || 0)}</Text>
                </TouchableOpacity>
            ))}
        </KeyboardAwareScrollView>
    );
};

export default Manter;
