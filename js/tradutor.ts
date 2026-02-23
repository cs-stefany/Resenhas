// Traduz mensagens de erro do Supabase para português
export const traduzirErro = (mensagem: string): string => {
    const traducoes: { [key: string]: string } = {
        // Erros de autenticação
        "Invalid login credentials": "Email ou senha incorretos.",
        "Email not confirmed": "Email não confirmado. Verifique sua caixa de entrada.",
        "Invalid email or password": "Email ou senha inválidos.",
        "User not found": "Usuário não encontrado.",
        "Email address is invalid": "Formato de email inválido.",
        "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
        "User already registered": "Este email já está cadastrado.",
        "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos.",
        "For security purposes, you can only request this once every 60 seconds": "Por segurança, aguarde 60 segundos para tentar novamente.",

        // Rate limits
        "email rate limit exceeded": "Limite de emails atingido. Aguarde alguns minutos e tente novamente.",
        "rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos.",
        "over_email_send_rate_limit": "Limite de emails atingido. Aguarde alguns minutos.",

        // Erros de rede
        "Network request failed": "Erro de conexão. Verifique sua internet.",
        "Failed to fetch": "Falha na conexão. Verifique sua internet.",

        // Erros de signup
        "Signup requires a valid password": "A senha é obrigatória para o cadastro.",
        "Unable to validate email address: invalid format": "Formato de email inválido.",
        "A user with this email address has already been registered": "Este email já está cadastrado.",

        // Erros gerais
        "Request timeout": "Tempo esgotado. Tente novamente.",
        "Server error": "Erro no servidor. Tente novamente mais tarde.",
    };

    const mensagemLower = mensagem.toLowerCase();

    // Busca tradução exata
    if (traducoes[mensagem]) {
        return traducoes[mensagem];
    }

    // Busca tradução exata case-insensitive
    for (const [ingles, portugues] of Object.entries(traducoes)) {
        if (ingles.toLowerCase() === mensagemLower) {
            return portugues;
        }
    }

    // Busca parcial (caso a mensagem contenha parte do texto)
    for (const [ingles, portugues] of Object.entries(traducoes)) {
        if (mensagemLower.includes(ingles.toLowerCase())) {
            return portugues;
        }
    }

    // Se não encontrar tradução, retorna a mensagem original
    return mensagem;
};
