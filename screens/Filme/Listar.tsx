import { View, Text, ImageStyle } from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../js/supabase";
import { Filme } from "../../model/Filme";
import style from "../../js/style";
import { ScrollView } from "react-native-gesture-handler";
import { Loading, ImageWithPlaceholder } from "../../components";

const Listar = () => {
    const [loading, setLoading] = useState(true);
    const [filmes, setFilmes] = useState<Filme[]>([]);

    useEffect(() => {
        const fetchFilmes = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('filmes')
                .select('*')
                .eq('user_id', user.id);

            if (!error && data) {
                setFilmes(data.map(f => ({ ...f, key: f.id })));
            }
            setLoading(false);
        };

        fetchFilmes();

        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const channel = supabase
                .channel('filmes_listar')
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
                supabase.removeChannel(channel);
            };
        };

        setupSubscription();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <ScrollView endFillColor="#FED2E5" contentContainerStyle={style.scrollContainer}>
            {filmes.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
                    <Text style={{ fontSize: 18, color: '#8F6277', textAlign: 'center' }}>
                        Nenhum filme cadastrado ainda.
                    </Text>
                    <Text style={{ fontSize: 14, color: '#CD9CB2', textAlign: 'center', marginTop: 10 }}>
                        Adicione seu primeiro filme no menu "Adicionar filmes"
                    </Text>
                </View>
            ) : (
                filmes.map((item, i) => (
                    <View key={i} style={style.item}>
                        <Text style={style.titulo}>Título: {item.titulo}</Text>
                        <Text style={style.titulo}>Gênero: {item.genero}</Text>
                        <Text style={style.titulo}>Sinopse: {item.sinopse}</Text>
                        <Text style={style.titulo}>Data de lançamento: {item.datalancamento}</Text>
                        <ImageWithPlaceholder uri={item.urlfoto || ''} style={style.imagem as ImageStyle} />
                    </View>
                ))
            )}
        </ScrollView>
    );
};
export default Listar;
