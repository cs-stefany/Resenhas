import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert from '../components/CustomAlert';

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
    title?: string;
    message: string;
    buttons?: AlertButton[];
}

interface AlertContextType {
    showAlert: (config: AlertConfig) => void;
    alert: (message: string) => void;
    confirm: (title: string, message: string, onConfirm: () => void) => void;
    confirmDelete: (itemName: string, onConfirm: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<AlertConfig>({ message: '' });

    const showAlert = useCallback((newConfig: AlertConfig) => {
        setConfig(newConfig);
        setVisible(true);
    }, []);

    // Função simples de alert (substitui o alert() nativo)
    const alert = useCallback((message: string) => {
        showAlert({
            title: 'Aviso',
            message,
            buttons: [{ text: 'OK', style: 'default' }],
        });
    }, [showAlert]);

    // Função de confirmação
    const confirm = useCallback((title: string, message: string, onConfirm: () => void) => {
        showAlert({
            title,
            message,
            buttons: [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', style: 'default', onPress: onConfirm },
            ],
        });
    }, [showAlert]);

    // Função específica para confirmar exclusão
    const confirmDelete = useCallback((itemName: string, onConfirm: () => void) => {
        showAlert({
            title: 'Excluir',
            message: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
            buttons: [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', style: 'destructive', onPress: onConfirm },
            ],
        });
    }, [showAlert]);

    const handleClose = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, alert, confirm, confirmDelete }}>
            {children}
            <CustomAlert
                visible={visible}
                title={config.title}
                message={config.message}
                buttons={config.buttons}
                onClose={handleClose}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = (): AlertContextType => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert deve ser usado dentro de um AlertProvider');
    }
    return context;
};
