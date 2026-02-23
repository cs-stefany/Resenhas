import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../js/supabase";
import { Resenha } from "../../model/Resenha";
import style from "../../js/style";
import { ScrollView } from "react-native-gesture-handler";
import { Filme } from "../../model/Filme";
import { Loading, StarRating } from "../../components";

const Listar = () => {
    const [loading, setLoading] = useState(true);
    const [resenhas, setResenhas] = useState<Resenha[]>([]);
    const [filmes, setFilmes] = useState<Filme[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: resenhasData } = await supabase
                .from('resenhas')
                .select('*')
                .eq('user_id', user.id);

            if (resenhasData) {
                setResenhas(resenhasData.map(r => ({ ...r, key: r.id, idFilme: r.id_filme })));
            }

            const { data: filmesData } = await supabase
                .from('filmes')
                .select('*')
                .eq('user_id', user.id);

            if (filmesData) {
                setFilmes(filmesData.map(f => ({ ...f, key: f.id })));
            }

            setLoading(false);

            const resenhasChannel = supabase
                .channel('resenhas_listar')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'resenhas',
                        filter: `user_id=eq.${user.id}`,
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
                .channel('filmes_resenhas_listar')
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
                supabase.removeChannel(resenhasChannel);
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
            {resenhas.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
                    <Text style={{ fontSize: 18, color: '#8F6277', textAlign: 'center' }}>
                        Nenhuma resenha cadastrada ainda.
                    </Text>
                    <Text style={{ fontSize: 14, color: '#CD9CB2', textAlign: 'center', marginTop: 10 }}>
                        Adicione sua primeira resenha no menu "Adicionar resenhas"
                    </Text>
                </View>
            ) : (
                resenhas.map((item, i) => (
                    <View key={i} style={style.item}>
                        <Text style={style.titulo}>Filme: {filmes.find((f) => f.id === item.idFilme)?.titulo || "N/A"}</Text>
                        <Text style={style.titulo}>Título: {item.titulo}</Text>
                        <Text style={style.titulo}>Texto: {item.texto}</Text>
                        <View style={{ marginTop: 10 }}>
                            <StarRating
                                rating={item.estrelas || 0}
                                size={24}
                                disabled={true}
                            />
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
};
export default Listar;
