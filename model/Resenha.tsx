export interface Resenha {
    id: string;
    idFilme: string;
    titulo: string;
    texto: string;
    estrelas: number;
    user_id?: string;
    key?: string;
}
