import { View, Text, ImageStyle } from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../js/supabase";
import { Cena } from "../../model/Cena";
import style from "../../js/style";
import { ScrollView } from "react-native-gesture-handler";
import { Filme } from "../../model/Filme";
import { Loading, ImageWithPlaceholder, StarRating } from "../../components";

const Listar = () => {
    const [loading, setLoading] = useState(true);
    const [cenas, setCenas] = useState<Cena[]>([]);
    const [filmes, setFilmes] = useState<Filme[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch cenas
            const { data: cenasData } = await supabase
                .from('cenas')
                .select('*')
                .eq('user_id', user.id);

            if (cenasData) {
                setCenas(cenasData.map(c => ({ ...c, key: c.id, idFilme: c.id_filme })));
            }

            // Fetch filmes
            const { data: filmesData } = await supabase
                .from('filmes')
                .select('*')
                .eq('user_id', user.id);

            if (filmesData) {
                setFilmes(filmesData.map(f => ({ ...f, key: f.id })));
            }

            setLoading(false);

            // Setup realtime subscriptions
            const cenasChannel = supabase
                .channel('cenas_listar')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'cenas',
                        filter: `user_id=eq.${user.id}`,
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
                .channel('filmes_cenas_listar')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'filmes',
                        filter: `user_id=eq.${user.id}`,
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

        fetchData();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <ScrollView endFillColor="#FED2E5" contentContainerStyle={style.scrollContainer}>
            {cenas.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={style.textNews}>Nenhuma cena cadastrada.</Text>
                    <Text style={[style.textNews, { marginTop: 10 }]}>Vá em "Adicionar Cenas" para cadastrar.</Text>
                </View>
            ) : (
                cenas.map((item, i) => (
                    <View key={i} style={style.item}>
                        <Text style={style.titulo}>Filme: {filmes.find((f) => f.id === item.idFilme)?.titulo || ""}</Text>
                        <Text style={style.titulo}>Titulo: {item.titulo}</Text>
                        <Text style={style.titulo}>Descrição: {item.descricao}</Text>
                        <Text style={style.titulo}>Observação: {item.observacao}</Text>
                        <View style={{ marginVertical: 10 }}>
                            <StarRating
                                rating={item.estrelas || 0}
                                size={24}
                                disabled={true}
                            />
                        </View>
                        <ImageWithPlaceholder uri={item.urlfoto || ''} style={style.imagem as ImageStyle} />
                    </View>
                ))
            )}
        </ScrollView>
    );
};
export default Listar;
