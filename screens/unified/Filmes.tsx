import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageStyle, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { supabase } from '../../js/supabase';
import { useFormModal } from '../../contexts/FormModalContext';
import { useAlert } from '../../contexts/AlertContext';
import { useAuth } from '../../contexts/AuthContext';
import { Filme } from '../../model/Filme';
import { Loading, ImageWithPlaceholder } from '../../components';
import SearchFilterBar from '../../components/SearchFilterBar';
import style from '../../js/style';

const GENEROS = [
    { label: "Todos", value: "" },
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

const Filmes = () => {
    const [loading, setLoading] = useState(true);
    const [filmes, setFilmes] = useState<Filme[]>([]);
    const [search, setSearch] = useState('');
    const [generoFilter, setGeneroFilter] = useState('');

    const { openCreate, openEdit, revision } = useFormModal();
    const { alert, confirmDelete } = useAlert();
    const { session } = useAuth();

    useEffect(() => {
        const uid = session?.user.id;
        if (!uid) {
            setLoading(false);
            return;
        }

        fetchFilmes(uid);
        return setupSubscription(uid);
    }, [session?.user.id, revision]);

    const fetchFilmes = async (uid: string) => {
        const { data, error } = await supabase
            .from('filmes')
            .select('*')
            .eq('user_id', uid);

        if (error) {
            alert('Não foi possível carregar seus filmes. Verifique sua conexão.');
        } else if (data) {
            setFilmes(data.map(f => ({ ...f, key: f.id })));
        }
        setLoading(false);
    };

    const setupSubscription = (uid: string) => {
        const channel = supabase
            .channel('filmes_unified')
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
                        const next = { ...payload.new as Filme, key: payload.new.id };
                        setFilmes(prev => prev.some((item) => item.id === next.id)
                            ? prev.map((item) => item.id === next.id ? next : item)
                            : [...prev, next]);
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

    const filteredFilmes = useMemo(() => {
        return filmes.filter(filme => {
            const matchesSearch = filme.titulo?.toLowerCase().includes(search.toLowerCase());
            const matchesGenre = !generoFilter || filme.genero === generoFilter;
            return matchesSearch && matchesGenre;
        });
    }, [filmes, search, generoFilter]);

    const excluir = async (item: Filme) => {
        confirmDelete(item.titulo || "este filme", async () => {
            const { error } = await supabase
                .from('filmes')
                .delete()
                .eq('id', item.id)
                .eq('user_id', session?.user.id);

            if (error) {
                alert("Erro ao excluir: " + error.message);
            } else {
                alert("Filme excluído com sucesso!");
            }
        });
    };

    if (loading) {
        return <Loading />;
    }

    const FilterDropdown = (
        <View style={styles.filterDropdown}>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={generoFilter}
                    onValueChange={(value) => setGeneroFilter(value)}
                    style={styles.picker}
                    dropdownIconColor="#8F6277"
                >
                    {GENEROS.map((item) => (
                        <Picker.Item key={item.value || 'todos'} label={item.label} value={item.value} />
                    ))}
                </Picker>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#FED2E5' }}>
            <SearchFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                filterComponent={FilterDropdown}
                onAddPress={() => openCreate('filme')}
                placeholder="Pesquisar filme..."
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {filteredFilmes.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="film-outline" size={64} color="#CD9CB2" />
                        <Text style={styles.emptyTitle}>
                            {filmes.length === 0 ? 'Nenhum filme cadastrado' : 'Nenhum filme encontrado'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {filmes.length === 0
                                ? 'Toque no + para adicionar seu primeiro filme'
                                : 'Tente ajustar os filtros de busca'}
                        </Text>
                    </View>
                ) : (
                    filteredFilmes.map((item) => (
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
                                    onPress={() => openEdit('filme', item)}
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
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: 20,
        paddingBottom: 40,
    },
    filterDropdown: {
        minWidth: 100,
    },
    pickerContainer: {
        backgroundColor: 'rgba(173, 126, 148, 0.3)',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 36,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#CD9CB2',
    },
    picker: {
        fontSize: 12,
        color: '#8F6277',
        height: 38,
        width: 124,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#8F6277',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#AD7E94',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default Filmes;
