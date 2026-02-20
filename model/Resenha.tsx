export class Resenha {
    public id: string;
    public idFilme: string;
    public titulo: string;
    public texto: string;
    public estrelas: number;

    constructor(obj?: Partial<Resenha>) {
        if (obj) {
            Object.assign(this, obj);
        }
    }

    toString() {
        return `{
            "id":               "${this.id}",
            "idFilme":          "${this.idFilme}",
            "titulo":           "${this.titulo}",
            "texto":            "${this.texto}",
            "estrelas":         "${this.estrelas}",
        }`;
    }

    toFirestore() {
        return { ...this };
    }
}
