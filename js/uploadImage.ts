import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';
import { Platform } from 'react-native';

/**
 * Faz upload de uma imagem para o Supabase Storage
 * Suporta tanto Android quanto iOS com diferentes métodos
 */
export const uploadImage = async (
    uri: string,
    userId: string
): Promise<{ url: string | null; error: string | null }> => {
    console.log('=== INÍCIO DO UPLOAD ===');
    console.log('URI:', uri);
    console.log('Platform:', Platform.OS);
    console.log('UserId:', userId);

    try {
        // Limpa a extensão do arquivo (remove query params se houver)
        const uriParts = uri.split('.');
        let fileExt = uriParts[uriParts.length - 1].split('?')[0].toLowerCase();

        // Valida extensão
        if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
            fileExt = 'jpg';
        }

        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

        console.log('FileName:', fileName);
        console.log('ContentType:', contentType);

        let uploadData: ArrayBuffer;

        // Método principal: Usar FileSystem com base64
        console.log('Tentando ler arquivo com FileSystem...');
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            console.log('Base64 obtido, tamanho:', base64.length);
            uploadData = decode(base64);
            console.log('ArrayBuffer criado, tamanho:', uploadData.byteLength);
        } catch (fsError: any) {
            console.log('FileSystem falhou:', fsError.message);

            // Fallback: tentar com fetch
            console.log('Tentando com fetch...');
            try {
                const response = await fetch(uri);
                console.log('Fetch response status:', response.status);
                const blob = await response.blob();
                console.log('Blob obtido, tamanho:', blob.size);
                uploadData = await blobToArrayBuffer(blob);
                console.log('ArrayBuffer criado do blob, tamanho:', uploadData.byteLength);
            } catch (fetchError: any) {
                console.log('Fetch também falhou:', fetchError.message);
                return { url: null, error: `Não foi possível ler a imagem: ${fetchError.message}` };
            }
        }

        // Verifica se temos dados para upload
        if (!uploadData || uploadData.byteLength === 0) {
            console.log('ERRO: uploadData vazio');
            return { url: null, error: 'Imagem vazia ou inválida' };
        }

        // Faz upload para o Supabase
        console.log('Iniciando upload para Supabase...');
        console.log('Bucket: imagens');

        const { data, error: uploadError } = await supabase.storage
            .from('imagens')
            .upload(fileName, uploadData, {
                contentType,
                upsert: true,
            });

        console.log('Resposta do Supabase - data:', data);
        console.log('Resposta do Supabase - error:', uploadError);

        if (uploadError) {
            console.log('ERRO no upload Supabase:', uploadError.message);
            return { url: null, error: uploadError.message };
        }

        // Obtém URL pública
        const { data: urlData } = supabase.storage
            .from('imagens')
            .getPublicUrl(fileName);

        console.log('URL pública:', urlData.publicUrl);
        console.log('=== UPLOAD CONCLUÍDO COM SUCESSO ===');

        return { url: urlData.publicUrl, error: null };

    } catch (err: any) {
        console.log('=== ERRO GERAL NO UPLOAD ===');
        console.log('Mensagem:', err.message);
        console.log('Stack:', err.stack);
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
