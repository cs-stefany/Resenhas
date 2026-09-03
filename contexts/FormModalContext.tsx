import React, { createContext, useContext, useState, useCallback } from 'react';

export type EntityType = 'filme' | 'resenha' | 'cena';
export type ModalMode = 'create' | 'edit';

interface FormModalState {
    isOpen: boolean;
    mode: ModalMode;
    entity: EntityType;
    editingItem: any | null;
    filmes: any[]; // Para resenhas e cenas que precisam selecionar filme
}

interface FormModalContextType {
    state: FormModalState;
    revision: number;
    openCreate: (entity: EntityType, filmes?: any[]) => void;
    openEdit: (entity: EntityType, item: any, filmes?: any[]) => void;
    close: () => void;
    notifySaved: () => void;
    setFilmes: (filmes: any[]) => void;
}

const initialState: FormModalState = {
    isOpen: false,
    mode: 'create',
    entity: 'filme',
    editingItem: null,
    filmes: [],
};

const FormModalContext = createContext<FormModalContextType | undefined>(undefined);

export const FormModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<FormModalState>(initialState);
    const [revision, setRevision] = useState(0);

    const openCreate = useCallback((entity: EntityType, filmes: any[] = []) => {
        setState({
            isOpen: true,
            mode: 'create',
            entity,
            editingItem: null,
            filmes,
        });
    }, []);

    const openEdit = useCallback((entity: EntityType, item: any, filmes: any[] = []) => {
        setState({
            isOpen: true,
            mode: 'edit',
            entity,
            editingItem: item,
            filmes,
        });
    }, []);

    const close = useCallback(() => {
        setState(prev => ({
            ...prev,
            isOpen: false,
            editingItem: null,
        }));
    }, []);

    const setFilmes = useCallback((filmes: any[]) => {
        setState(prev => ({
            ...prev,
            filmes,
        }));
    }, []);

    const notifySaved = useCallback(() => {
        setRevision((current) => current + 1);
    }, []);

    return (
        <FormModalContext.Provider value={{ state, revision, openCreate, openEdit, close, notifySaved, setFilmes }}>
            {children}
        </FormModalContext.Provider>
    );
};

export const useFormModal = (): FormModalContextType => {
    const context = useContext(FormModalContext);
    if (!context) {
        throw new Error('useFormModal deve ser usado dentro de um FormModalProvider');
    }
    return context;
};
