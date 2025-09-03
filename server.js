// Importações necessárias
import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import fetch from 'node-fetch';
import {
  ChatState,
  conversationFlow,
  translations,
  departmentSystemInstructions,
  getFollowUpPrompt
} from './chatbotLogic.js';

// --- CONFIGURAÇÃO INICIAL ---

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const { WHATSAPP_TOKEN, VERIFY_TOKEN, PHONE_NUMBER_ID, API_KEY } = process.env;

if (!API_KEY) throw new Error("API_KEY environment variable not set.");
if (!WHATSAPP_TOKEN) throw new Error("WHATSAPP_TOKEN environment variable not set.");
if (!VERIFY_TOKEN) throw new Error("VERIFY_TOKEN environment variable not set.");
if (!PHONE_NUMBER_ID) throw new Error("PHONE_NUMBER_ID environment variable not set.");

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- GERENCIAMENTO DE SESSÃO DO USUÁRIO ---
const userSessions = new Map();

function getSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      currentState: ChatState.LANGUAGE_SELECT,
      conversationContext: { history: {} },
      aiHistory: [],
    });
  }
  return userSessions.get(userId);
}

function updateSession(userId, newSessionData) {
  const session = getSession(userId);
  userSessions.set(userId, { ...session, ...newSessionData });
}

// --- COMUNICAÇÃO COM A API DO WHATSAPP ---

async function sendWhatsAppMessage(to, messageData) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: to,
  };

  if (messageData.options && messageData.options.length > 0) {
    const buttons = messageData.options.slice(0, 3).map((opt, index) => ({
      type: 'reply',
      reply: {
        id: `${opt.nextState}::${index}`.substring(0, 256), // ID único com índice
        title: opt.text.substring(0, 20), // Limite de 20 caracteres para o título do botão
      },
    }));

    payload.type = 'interactive';
    payload.interactive = {
      type: 'button',
      body: { text: messageData.text },
      action: { buttons },
    };
  } else {
    payload.type = 'text';
    payload.text = { body: messageData.text };
  }

  console.log(`Enviando para ${to}:`, JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
    }
    console.log('Mensagem enviada com sucesso.');
  } catch (error) {
    console.error('Falha ao enviar mensagem do WhatsApp:', error.message);
  }
}

// --- LÓGICA DO CHATBOT ---

function getFlowResponse(state, context) {
  const flowStep = conversationFlow.get(state);
  const lang = context.language || 'pt';

  if (!flowStep) return getFlowResponse(ChatState.GREETING, context);

  let responseText;
  if (flowStep.textKey) {
    const template = translations[lang][flowStep.textKey];
    responseText = typeof template === 'function' ? template(context) : template;
  } else {
    responseText = flowStep.text || '';
  }

  const responseOptions = flowStep.options?.map(opt => ({
    ...opt,
    text: (opt.textKey ? translations[lang][opt.textKey] : opt.text) || 'Option',
  }));

  return { text: responseText, options: responseOptions, requiresTextInput: flowStep.requiresTextInput, nextState: flowStep.nextState };
}

async function processUserTurn(userId, userInput) {
    const session = getSession(userId);
    let { currentState, conversationContext, aiHistory } = session;
    let nextState = currentState;

    // 1. Determina o próximo estado e atualiza o contexto
    if (userInput.type === 'button') {
        nextState = userInput.nextState;
        const options = conversationFlow.get(currentState)?.options;
        if (options && userInput.index !== undefined && options[userInput.index]) {
            const selectedOption = options[userInput.index];
            if (selectedOption.nextState === nextState && selectedOption.payload) {
                conversationContext = { ...conversationContext, ...selectedOption.payload };
            }
        }
    } else if (userInput.type === 'text') {
        if (currentState === ChatState.AI_ASSISTANT_CHATTING) {
            nextState = ChatState.AI_ASSISTANT_CHATTING;
        } else {
            const currentFlowStep = conversationFlow.get(currentState);
            if (currentFlowStep?.requiresTextInput && currentFlowStep.nextState) {
                conversationContext.history[currentState] = userInput.text;
                conversationContext.userInput = userInput.text;
                nextState = currentFlowStep.nextState;
            }
        }
    }
    
    // Reinicia o contexto se o usuário voltar ao início
    if (nextState === ChatState.GREETING && !conversationContext.language) {
       conversationContext = { history: {}, language: conversationContext.language };
       aiHistory = [];
    } else if (nextState === ChatState.LANGUAGE_SELECT) {
        conversationContext = { history: {} };
        aiHistory = [];
    }
    
    currentState = nextState;
    updateSession(userId, { currentState, conversationContext, aiHistory });

    // 2. Executa a lógica para o estado atual
    if (currentState === ChatState.AI_ASSISTANT_CHATTING) {
        const lang = conversationContext.language || 'pt';
        
        if (userInput.type !== 'text') { // Primeira entrada no chat
            const deptKey = lang === 'en' ? conversationContext.departmentEn : conversationContext.department;
            conversationContext.systemInstruction = departmentSystemInstructions[lang][deptKey];
            aiHistory = [];
            const botResponse = getFlowResponse(currentState, conversationContext);
            await sendWhatsAppMessage(userId, botResponse);
        } else { // Conversa em andamento com a IA
            await sendWhatsAppMessage(userId, { text: "🧠 Processando, um momento..." });

            try {
                const modelResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [...aiHistory, { role: 'user', parts: [{ text: userInput.text }] }],
                    config: { systemInstruction: conversationContext.systemInstruction }
                });
                const geminiText = modelResponse.text;
                aiHistory.push({ role: 'user', parts: [{ text: userInput.text }] });
                aiHistory.push({ role: 'model', parts: [{ text: geminiText }] });

                await sendWhatsAppMessage(userId, { text: geminiText });

                // Gera perguntas de acompanhamento
                const followUpPrompt = getFollowUpPrompt(lang, userInput.text, geminiText);
                const followUpRes = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: followUpPrompt,
                    config: { responseMimeType: 'application/json', responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
                });

                let options = [{ text: translations[lang].backToStart, nextState: ChatState.GREETING }];
                try {
                    const questions = JSON.parse(followUpRes.text.trim());
                    if (Array.isArray(questions) && questions.length > 0) {
                        const followUpOptions = questions.slice(0, 2).map(q => ({
                            text: q,
                            // ID customizado para carregar a pergunta como input do usuário
                            nextState: `AI_PROMPT--${q.substring(0, 200)}` 
                        }));
                        options = [...followUpOptions, ...options];
                    }
                } catch (e) { console.error("Falha ao parsear JSON de acompanhamento:", e); }
                
                await sendWhatsAppMessage(userId, { text: "Posso ajudar com algo mais?", options });

            } catch (error) {
                console.error("Erro na API Gemini:", error);
                await sendWhatsAppMessage(userId, { text: translations[lang].error, options: [{ text: translations[lang].backToStart, nextState: ChatState.GREETING }]});
            }
        }
    } else { // 3. Lógica para o fluxo padrão baseado em estados
        aiHistory = []; // Reseta o histórico da IA fora do fluxo
        let currentFlowState = currentState;
        while (currentFlowState) {
            const flowResponse = getFlowResponse(currentFlowState, conversationContext);
            await sendWhatsAppMessage(userId, flowResponse);

            const nextStep = conversationFlow.get(currentFlowState);
            // Avança automaticamente se o próximo passo não exigir input nem oferecer opções
            if (nextStep?.nextState && !nextStep.requiresTextInput && (!nextStep.options || nextStep.options.length === 0)) {
                await new Promise(res => setTimeout(res, 1000));
                currentFlowState = nextStep.nextState;
                updateSession(userId, { currentState: currentFlowState });
            } else {
                currentFlowState = null; // Para o loop
            }
        }
    }
    updateSession(userId, { aiHistory });
}

// --- ENDPOINTS DO WEBHOOK ---

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;
  console.log('Webhook recebido:', JSON.stringify(body, null, 2));

  if (body.object === 'whatsapp_business_account') {
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.value.messages) {
          for (const message of change.value.messages) {
            if (message.from) { 
                const from = message.from;
                let userInput = null;

                if (message.type === 'text') {
                    userInput = { type: 'text', text: message.text.body };
                } else if (message.type === 'interactive' && message.interactive.type === 'button_reply') {
                    const buttonId = message.interactive.button_reply.id;
                    // Lógica para tratar perguntas dinâmicas da IA como input de texto
                    if (buttonId.startsWith('AI_PROMPT--')) {
                        userInput = { type: 'text', text: buttonId.substring('AI_PROMPT--'.length) };
                    } else {
                        const [nextStateFromId, indexStr] = buttonId.split('::');
                        const index = parseInt(indexStr, 10);
                        userInput = { type: 'button', nextState: nextStateFromId, index };
                    }
                }

                if (userInput) {
                    await processUserTurn(from, userInput);
                }
            }
          }
        }
      }
    }
  }
  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('WhatsApp Chatbot Server está online!'));

app.listen(port, () => console.log(`Servidor escutando na porta ${port}`));