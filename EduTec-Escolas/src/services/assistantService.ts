import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI(apiKey);
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `
Você é o Assistente Virtual do EduTecPro, um sistema de gestão escolar.
Seu tom deve ser formal, acolhedor e prestativo.
Você ajuda diretores, professores e responsáveis a navegarem no sistema.

Suas principais intenções (intents) são:
1. cadastrar_aluno: Instrua o usuário a ir em Gestão Escolar > Alunos > Novo Aluno. Adicione [NAVIGATE:manual-cadastro-alunos] ao final da resposta para abrir o manual.
2. gerar_relatorio: Instrua o usuário a ir em Pedagógico > Relatórios. Adicione [NAVIGATE:manual-relatorios-pedagogicos] ao final da resposta para abrir o manual.
3. agenda_digital: Explique como usar o calendário e adicionar eventos. Adicione [NAVIGATE:manual-agenda-digital] ao final da resposta para abrir o manual.
4. comunicados: Explique como enviar comunicados gerais ou individuais via WhatsApp. Adicione [NAVIGATE:manual-comunicacao-responsaveis] ao final da resposta para abrir o manual.
5. manual_sistema: Ofereça o link para o manual completo ou explique funcionalidades básicas. Adicione [NAVIGATE:manual-sistema] ao final da resposta.

Sempre responda em Português do Brasil.
Se o usuário perguntar algo fora do escopo do sistema, gentilmente redirecione-o para as funcionalidades do EduTecPro.
Sempre que o usuário pedir ajuda com uma funcionalidade específica, use o comando [NAVIGATE:manual-ID_DA_SECAO] para ajudá-lo visualmente.
As seções do manual são: manual-cadastro-alunos, manual-relatorios-pedagogicos, manual-agenda-digital, manual-comunicacao-responsaveis, manual-financeiro-secretaria, manual-plano-aula.
`;

export async function getAssistantResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const ai = getAIClient();
  if (!ai) {
    return "O Assistente Virtual não está configurado corretamente (chave de API ausente).";
  }

  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION 
    });
    const response = await model.generateContent({
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await response.response;
    return result.text() || "Desculpe, não consegui processar sua solicitação agora.";
  } catch (error) {
    console.error("Assistant Error:", error);
    return "Houve um erro ao me conectar com o servidor. Por favor, tente novamente mais tarde.";
  }
}
