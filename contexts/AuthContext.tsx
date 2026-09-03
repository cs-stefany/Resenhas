import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../js/supabase';

interface AuthContextType {
    session: Session | null;
    initializing: boolean;
    recoveringPassword: boolean;
    finishPasswordRecovery: () => void;
    cancelPasswordRecovery: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getUrlParams = (url: string) => {
    const fragment = url.includes('#') ? url.split('#')[1] : '';
    const query = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
    return new URLSearchParams(fragment || query);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [initializing, setInitializing] = useState(true);
    const [recoveringPassword, setRecoveringPassword] = useState(false);

    const handleAuthUrl = useCallback(async (url?: string | null) => {
        if (!url) return;

        const params = getUrlParams(url);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const code = params.get('code');
        const type = params.get('type');
        const isRecoveryUrl = type === 'recovery' || url.includes('redefinir-senha');

        if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            if (!error) {
                setSession(data.session);
                setRecoveringPassword(isRecoveryUrl);
            }
        } else if (code) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error) {
                setSession(data.session);
                setRecoveringPassword(isRecoveryUrl);
            }
        }
    }, []);

    useEffect(() => {
        let active = true;

        const initialize = async () => {
            const initialUrl = await Linking.getInitialURL();
            await handleAuthUrl(initialUrl);
            const { data } = await supabase.auth.getSession();
            if (active) {
                setSession(data.session);
                setInitializing(false);
            }
        };

        initialize();
        const linkSubscription = Linking.addEventListener('url', ({ url }) => {
            handleAuthUrl(url);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
            setSession(nextSession);
            if (event === 'PASSWORD_RECOVERY') {
                setRecoveringPassword(true);
            }
        });

        return () => {
            active = false;
            linkSubscription.remove();
            subscription.unsubscribe();
        };
    }, [handleAuthUrl]);

    const finishPasswordRecovery = useCallback(() => {
        setRecoveringPassword(false);
    }, []);

    const cancelPasswordRecovery = useCallback(async () => {
        setRecoveringPassword(false);
        await supabase.auth.signOut();
    }, []);

    const value = useMemo(() => ({
        session,
        initializing,
        recoveringPassword,
        finishPasswordRecovery,
        cancelPasswordRecovery,
    }), [session, initializing, recoveringPassword, finishPasswordRecovery, cancelPasswordRecovery]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
