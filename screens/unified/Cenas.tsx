import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageStyle, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../js/supabase';
import { useFormModal } from '../../contexts/FormModalContext';
import { useAlert } from '../../contexts/AlertContext';
import { Cena } from '../../model/Cena';
import { Filme } from '../../model/Filme';
import { Loading, StarRating, ImageWithPlaceholder } from '../../components';
import style from '../../js/style';

const Cenas = () => {
    const [loading, setLoading] = useState(true);
    const [cenas, setCenas] = useState<Cena[]>([]);
    const [filmes, setFilmes] = useState<Filme[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [estrelasFilter, setEstrelasFilter] = useState<number | null>(null);

    const { openCreate, openEdit } = useFormModal();
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
            .channel('cenas_unified')
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
            .channel('filmes_cenas_unified')
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

    const filteredCenas = useMemo(() => {
        return cenas.filter(cena => {
            const matchesSearch = cena.titulo?.toLowerCase().includes(search.toLowerCase());
            const matchesStars = estrelasFilter === null || cena.estrelas === estrelasFilter;
            return matchesSearch && matchesStars;
        });
    }, [cenas, search, estrelasFilter]);

    const excluir = async (item: Cena) => {
        confirmDelete(item.titulo || "esta cena", async () => {
            const { error } = await supabase
                .from('cenas')
                .delete()
                .eq('id', item.id);

            if (error) {
                alert("Erro ao excluir: " + error.message);
            } else {
                alert("Cena excluida com sucesso!");
            }
        });
    };

    const getFilmeName = (idFilme: string) => {
        const filme = filmes.find(f => f.id === idFilme);
        return filme?.titulo || 'N/A';
    };

    if (loading) {
        return <Loading />;
    }

    const handleAddPress = () => {
        if (filmes.length === 0) {
            alert("Cadastre um filme primeiro para adicionar cenas.");
            return;
        }
        openCreate('cena', filmes);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FED2E5' }}>
            {/* Barra de filtros customizada para Cenas */}
            <View style={styles.filterBar}>
                {/* Linha 1: Filtro de estrelas */}
                <View style={styles.starFilterRow}>
                    <Text style={styles.filterLabel}>Filtrar por estrelas:</Text>
                    <View style={styles.starFilter}>
                        <TouchableOpacity
                            style={[styles.starButton, estrelasFilter === null && styles.starButtonActive]}
                            onPress={() => setEstrelasFilter(null)}
                        >
                            <Text style={[styles.starButtonText, estrelasFilter === null && styles.starButtonTextActive]}>
                                Todos
                            </Text>
                        </TouchableOpacity>
                        {[1, 2, 3, 4, 5].map(star => (
                            <TouchableOpacity
                                key={star}
                                style={[styles.starButton, estrelasFilter === star && styles.starButtonActive]}
                                onPress={() => setEstrelasFilter(estrelasFilter === star ? null : star)}
                            >
                                <Ionicons
                                    name="star"
                                    size={14}
                                    color={estrelasFilter === star ? '#FFFFFF' : '#FFD700'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Linha 2: Pesquisa + Add */}
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={18} color="#8F6277" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Pesquisar cena..."
                            placeholderTextColor="#AD7E94"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
                        <Ionicons name="add" size={26} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {filteredCenas.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="videocam-outline" size={64} color="#CD9CB2" />
                        <Text style={styles.emptyTitle}>
                            {cenas.length === 0 ? 'Nenhuma cena cadastrada' : 'Nenhuma cena encontrada'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {cenas.length === 0
                                ? filmes.length === 0
                                    ? 'Cadastre um filme primeiro'
                                    : 'Toque no + para adicionar sua primeira cena'
                                : 'Tente ajustar os filtros de busca'}
                        </Text>
                    </View>
                ) : (
                    filteredCenas.map((item) => (
                        <View key={item.id} style={style.item}>
                            <View style={style.itemContent}>
                                <Text style={style.titulo}>Filme: {getFilmeName(item.idFilme)}</Text>
                                <Text style={style.titulo}>Titulo: {item.titulo}</Text>
                                <Text style={style.titulo}>Descricao: {item.descricao}</Text>
                                <Text style={style.titulo}>Observacao: {item.observacao}</Text>
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
                                    onPress={() => openEdit('cena', item, filmes)}
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
    filterBar: {
        backgroundColor: '#FFE1EE',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#DDB0C4',
    },
    starFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    filterLabel: {
        fontSize: 12,
        color: '#8F6277',
        fontWeight: '600',
        marginRight: 8,
    },
    starFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    starButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(173, 126, 148, 0.3)',
        minWidth: 36,
    },
    starButtonActive: {
        backgroundColor: '#8F6277',
    },
    starButtonText: {
        fontSize: 12,
        color: '#8F6277',
        fontWeight: '500',
    },
    starButtonTextActive: {
        color: '#FFFFFF',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(173, 126, 148, 0.3)',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 40,
        borderWidth: 1,
        borderColor: '#CD9CB2',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#8F6277',
        paddingVertical: 0,
    },
    addButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#8F6277',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8F6277',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
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

export default Cenas;
