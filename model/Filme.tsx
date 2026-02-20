export class Filme {
    public id: string;
    public titulo: string;
    public genero: string;
    public sinopse: string;
    public datalancamento: string;
    public urlfoto: string;

    constructor(obj?: Partial<Filme>) {
        if (obj) {
            Object.assign(this, obj);
        }
    }

    toString() {
        const objeto = `{
            "id":               "${this.id}",
            "titulo":           "${this.titulo}",
            "sinopse":          "${this.sinopse}",
            "datalancamento":   "${this.datalancamento}",
            "urlfoto":          "${this.urlfoto}"
        }`;

        return objeto;
    }

    toFirestore() {
        return { ...this };
    }
}
