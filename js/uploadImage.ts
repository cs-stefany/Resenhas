import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';
import { Platform } from 'react-native';

interface UploadResult {
    url: string | null;
    error: string | null;
}

interface UploadOptions {
    onProgress?: (progress: number) => void;
}

/**
 * Faz upload de uma imagem para o Supabase Storage
 * Suporta tanto Android quanto iOS com diferentes métodos
 */
export const uploadImage = async (
    uri: string,
    userId: string,
    options?: UploadOptions
): Promise<UploadResult> => {
    const { onProgress } = options || {};

    try {
        // Inicia progresso
        onProgress?.(5);

        // Limpa a extensão do arquivo (remove query params se houver)
        const uriParts = uri.split('.');
        let fileExt = uriParts[uriParts.length - 1].split('?')[0].toLowerCase();

        // Valida extensão
        if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
            fileExt = 'jpg';
        }

        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

        onProgress?.(15);

        let uploadData: ArrayBuffer;

        // Lê o arquivo como base64
        try {
            onProgress?.(25);
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            onProgress?.(50);
            uploadData = decode(base64);
            onProgress?.(60);
        } catch (fsError: any) {
            // Fallback: tentar com fetch
            try {
                onProgress?.(30);
                const response = await fetch(uri);
                onProgress?.(45);
                const blob = await response.blob();
                onProgress?.(55);
                uploadData = await blobToArrayBuffer(blob);
                onProgress?.(65);
            } catch (fetchError: any) {
                return { url: null, error: `Não foi possível ler a imagem: ${fetchError.message}` };
            }
        }

        // Verifica se temos dados para upload
        if (!uploadData || uploadData.byteLength === 0) {
            return { url: null, error: 'Imagem vazia ou inválida' };
        }

        onProgress?.(70);

        // Faz upload para o Supabase
        const { data, error: uploadError } = await supabase.storage
            .from('imagens')
            .upload(fileName, uploadData, {
                contentType,
                upsert: true,
            });

        onProgress?.(90);

        if (uploadError) {
            return { url: null, error: uploadError.message };
        }

        // Obtém URL pública
        const { data: urlData } = supabase.storage
            .from('imagens')
            .getPublicUrl(fileName);

        onProgress?.(100);

        return { url: urlData.publicUrl, error: null };

    } catch (err: any) {
        return { url: null, error: err.message || 'Erro desconhecido ao fazer upload' };
    }
};

/**
 * Converte Blob para ArrayBuffer
 */
const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(reader.result);
            } else {
                reject(new Error('Falha ao converter blob'));
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
};
