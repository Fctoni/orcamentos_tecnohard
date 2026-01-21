# Projeto: Atualização do SGQ para Processos Digitalizados

## Situação Atual

A Tecnohard é certificada ISO 9001 e mantém seu Sistema de Gestão da Qualidade (SGQ) documentado em arquivos Word e Excel. Recentemente, a empresa vem desenvolvendo softwares internos que substituem diversos procedimentos e formulários antes manuais.

## Problema

Com a adoção desses softwares, os processos reais da empresa mudaram, mas a documentação do SGQ permanece desatualizada. Isso cria uma divergência entre o que está documentado e o que é efetivamente praticado — situação que pode gerar não-conformidades em auditorias.

## Objetivo

1. Atualizar a documentação do SGQ para refletir a nova realidade dos processos digitalizados
2. Registrar o histórico de alterações conforme exigido pela norma
3. Manter a documentação dos softwares versionada no GitHub, atualizada automaticamente a cada modificação

## Proposta de Solução

Criar um agente de IA especializado que:

- **Interprete** a norma ISO 9001 de forma modular (por assunto/cláusula)
- **Analise** as funcionalidades de cada software a partir de sua documentação técnica
- **Mapeie** quais requisitos da norma cada software atende
- **Gere** textos descritivos padronizados explicando como o software cumpre cada requisito
- **Identifique** lacunas e sugira atualizações na documentação existente

## Fluxo de Trabalho

| Componente      | Descrição                                              |
|-----------------|--------------------------------------------------------|
| **Entrada**     | Norma ISO 9001 (em blocos) + Documentação dos softwares |
| **Processamento** | IA compara funcionalidades vs. requisitos da norma   |
| **Saída**       | Textos de conformidade + Sugestões de atualização      |
| **Manutenção**  | Versionamento automático via GitHub                    |
