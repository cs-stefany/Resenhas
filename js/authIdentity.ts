const USERNAME_PATTERN = /^[a-z0-9._-]{3,24}$/;

export const normalizarNomeDeUsuario = (usuario: string) => usuario.trim().toLowerCase();

export const nomeDeUsuarioValido = (usuario: string) => (
    USERNAME_PATTERN.test(normalizarNomeDeUsuario(usuario))
);

export const usuarioParaEmailInterno = (usuario: string) => (
    `${normalizarNomeDeUsuario(usuario)}@users.cinefy.invalid`
);
