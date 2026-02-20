export class Cena {
    public id: string;
    public idFilme: string;
    public titulo: string;
    public descricao: string;
    public observacao: string;
    public estrelas: number;
    public urlfoto: string;

    constructor(obj?: Partial<Cena>) {
        if (obj) {
            Object.assign(this, obj);
        }
    }

    toString() {
        return `{
            "id":               "${this.id}",
            "idFilme":          "${this.idFilme}",
            "titulo":           "${this.titulo}",
            "descricao":        "${this.descricao}",
            "observacao":       "${this.observacao}" 
            "estrelas":         "${this.estrelas}",
            "urlFoto":          "${this.urlfoto}",
        }`;
    }

    toFirestore() {
        return { ...this };
    }
}
