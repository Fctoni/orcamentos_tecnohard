export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Mensagens amigáveis para erros comuns
    if (error.message.includes('fetch failed')) {
      return 'Erro de conexão. Verifique sua internet.'
    }
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'Sessão expirada. Faça login novamente.'
    }
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return 'Você não tem permissão para esta ação.'
    }
    if (error.message.includes('404')) {
      return 'Recurso não encontrado.'
    }
    if (error.message.includes('500')) {
      return 'Erro no servidor. Tente novamente mais tarde.'
    }
    return error.message
  }
  return 'Erro desconhecido. Tente novamente.'
}

