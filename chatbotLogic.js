// Este arquivo centraliza a lógica, estados e textos do chatbot.

export const ChatState = {
  LANGUAGE_SELECT: 'LANGUAGE_SELECT',
  GREETING: 'GREETING',
  AI_ASSISTANT_SELECT_DEPT: 'AI_ASSISTANT_SELECT_DEPT',
  AI_ASSISTANT_CHATTING: 'AI_ASSISTANT_CHATTING',
  SCHEDULING_SERVICE: 'SCHEDULING_SERVICE',
  SCHEDULING_CLIENT_TYPE: 'SCHEDULING_CLIENT_TYPE',
  SCHEDULING_MEETING_TYPE: 'SCHEDULING_MEETING_TYPE',
  SCHEDULING_RESPONSIBLE_NAME: 'SCHEDULING_RESPONSIBLE_NAME',
  SCHEDULING_COMPANY_NAME: 'SCHEDULING_COMPANY_NAME',
  SCHEDULING_CONTACT_INFO: 'SCHEDULING_CONTACT_INFO',
  SCHEDULING_SUMMARY: 'SCHEDULING_SUMMARY',
  SCHEDULING_CONFIRMED: 'SCHEDULING_CONFIRMED',
  ATTENDANT_SELECT: 'ATTENDANT_SELECT',
  ATTENDANT_TRANSFER: 'ATTENDANT_TRANSFER',
  END: 'END',
};


const flowSteps = [
  [
    ChatState.LANGUAGE_SELECT,
    {
      text: "Please select your language / Por favor, selecione seu idioma",
      options: [
        { text: "Português", nextState: ChatState.GREETING, payload: { language: 'pt' } },
        { text: "English", nextState: ChatState.GREETING, payload: { language: 'en' } },
      ],
    },
  ],
  [
    ChatState.GREETING,
    {
      textKey: "greeting",
      options: [
        { textKey: "optionAiAssistant", nextState: ChatState.AI_ASSISTANT_SELECT_DEPT },
        { textKey: "optionScheduling", nextState: ChatState.SCHEDULING_SERVICE },
        { textKey: "optionAttendant", nextState: ChatState.ATTENDANT_SELECT },
        { textKey: "optionChangeLanguage", nextState: ChatState.LANGUAGE_SELECT },
      ],
    },
  ],
  // AI Assistant Flow
  [
    ChatState.AI_ASSISTANT_SELECT_DEPT,
    {
      textKey: "aiDeptSelect",
      options: [
        { textKey: "deptRH", nextState: ChatState.AI_ASSISTANT_CHATTING, payload: { department: "RH", departmentEn: "HR" } },
        { textKey: "deptAccounting", nextState: ChatState.AI_ASSISTANT_CHATTING, payload: { department: "Contábil", departmentEn: "Accounting" } },
        { textKey: "deptTax", nextState: ChatState.AI_ASSISTANT_CHATTING, payload: { department: "Fiscal", departmentEn: "Tax" } },
        { textKey: "deptCorporate", nextState: ChatState.AI_ASSISTANT_CHATTING, payload: { department: "Societário", departmentEn: "Corporate" } },
        { textKey: "backToStart", nextState: ChatState.GREETING },
      ],
    },
  ],
  [
    ChatState.AI_ASSISTANT_CHATTING,
    {
      textKey: 'aiDeptPrompt',
      requiresTextInput: true,
    },
  ],
  // Scheduling Flow
  [
    ChatState.SCHEDULING_SERVICE,
    {
      textKey: "schedulingService",
      options: [
        { textKey: "serviceOpening", nextState: ChatState.SCHEDULING_CLIENT_TYPE, payload: { service: "Abertura de Empresa", serviceEn: "Company Formation" } },
        { textKey: "serviceTaxReturn", nextState: ChatState.SCHEDULING_CLIENT_TYPE, payload: { service: "Declaração de IR", serviceEn: "Income Tax Return" } },
        { textKey: "serviceConsulting", nextState: ChatState.SCHEDULING_CLIENT_TYPE, payload: { service: "Consultoria Financeira", serviceEn: "Financial Consulting" } },
        { textKey: "serviceOther", nextState: ChatState.SCHEDULING_CLIENT_TYPE, payload: { service: "Outros Assuntos", serviceEn: "Other Matters" } },
      ],
    },
  ],
  [
    ChatState.SCHEDULING_CLIENT_TYPE,
    {
        textKey: "schedulingClientType",
        options: [
            { textKey: "clientTypeYes", nextState: ChatState.SCHEDULING_MEETING_TYPE, payload: { clientType: "Cliente Existente", clientTypeEn: "Existing Client" } },
            { textKey: "clientTypeNo", nextState: ChatState.SCHEDULING_MEETING_TYPE, payload: { clientType: "Novo Cliente", clientTypeEn: "New Client" } },
        ]
    }
  ],
  [
    ChatState.SCHEDULING_MEETING_TYPE,
    {
        textKey: "schedulingMeetingType",
        options: [
            { textKey: "meetingTypeOnline", nextState: ChatState.SCHEDULING_RESPONSIBLE_NAME, payload: { meetingType: "Online" } },
            { textKey: "meetingTypeOnSite", nextState: ChatState.SCHEDULING_RESPONSIBLE_NAME, payload: { meetingType: "Presencial", meetingTypeEn: "In Person" } },
        ]
    }
  ],
  [
    ChatState.SCHEDULING_RESPONSIBLE_NAME,
    {
        textKey: "schedulingResponsibleName",
        requiresTextInput: true,
        nextState: ChatState.SCHEDULING_COMPANY_NAME
    }
  ],
  [
    ChatState.SCHEDULING_COMPANY_NAME,
    {
        textKey: "schedulingCompanyName",
        requiresTextInput: true,
        nextState: ChatState.SCHEDULING_CONTACT_INFO
    }
  ],
  [
    ChatState.SCHEDULING_CONTACT_INFO,
    {
        textKey: "schedulingContactInfo",
        requiresTextInput: true,
        nextState: ChatState.SCHEDULING_SUMMARY
    }
  ],
  [
    ChatState.SCHEDULING_SUMMARY,
    {
      textKey: "schedulingSummary",
      options: [
        { textKey: "confirmYes", nextState: ChatState.SCHEDULING_CONFIRMED },
        { textKey: "confirmNo", nextState: ChatState.SCHEDULING_SERVICE },
      ],
    },
  ],
  [
    ChatState.SCHEDULING_CONFIRMED,
    {
      textKey: "schedulingConfirmed",
      nextState: ChatState.GREETING,
    },
  ],
  // Attendant Flow
  [
    ChatState.ATTENDANT_SELECT,
    {
      textKey: "attendantSelect",
      options: [
          { textKey: "deptRH", nextState: ChatState.ATTENDANT_TRANSFER, payload: { department: "RH", departmentEn: "HR" } },
          { textKey: "deptAccounting", nextState: ChatState.ATTENDANT_TRANSFER, payload: { department: "Contábil", departmentEn: "Accounting" } },
          { textKey: "deptTax", nextState: ChatState.ATTENDANT_TRANSFER, payload: { department: "Fiscal", departmentEn: "Tax" } },
          { textKey: "backToStart", nextState: ChatState.GREETING },
      ]
    }
  ],
  [
    ChatState.ATTENDANT_TRANSFER,
    {
      textKey: 'attendantTransfer',
    },
  ],
];

export const conversationFlow = new Map(flowSteps);

export const translations = {
  pt: {
    greeting: "Olá! Bem-vindo(a) ao Atendimento Virtual JZF. Sou seu assistente virtual. Como posso te ajudar hoje?\n\nNosso horário de atendimento é de segunda a sexta, das 08h00min às 17h50min.",
    backToStart: "↩️ Voltar ao Início",
    optionAiAssistant: "🧠 Tirar Dúvidas",
    optionScheduling: "📅 Agendar Reunião",
    optionAttendant: "💬 Falar com Atendente",
    optionChangeLanguage: "🌐 Mudar Idioma",
    aiDeptSelect: "Com certeza! Para que eu possa te ajudar melhor, sobre qual área você tem dúvidas?",
    aiDeptPrompt: (context) => `Pode perguntar. Estou à disposição para ajudar com suas dúvidas sobre ${context.department}.`,
    deptRH: "RH",
    deptAccounting: "Contábil",
    deptTax: "Fiscal",
    deptCorporate: "Societário",
    schedulingService: "Entendido. Para qual serviço você gostaria de solicitar um agendamento?",
    serviceOpening: "Abertura de Empresa",
    serviceTaxReturn: "Declaração de IR",
    serviceConsulting: "Consultoria",
    serviceOther: "Outros Assuntos",
    schedulingClientType: "Você já é nosso cliente?",
    clientTypeYes: "Sim, sou cliente",
    clientTypeNo: "Não, sou novo",
    schedulingMeetingType: "A reunião será online ou presencial?",
    meetingTypeOnline: "Online",
    meetingTypeOnSite: "Presencial",
    schedulingResponsibleName: "Qual o nome completo do responsável pela reunião?",
    schedulingCompanyName: (context) => `Obrigado, ${context.userInput}. Agora, por favor, informe o nome da empresa.`,
    schedulingContactInfo: (context) => `Perfeito. E qual o melhor e-mail ou telefone para contato?`,
    schedulingSummary: (context) => {
      const { history, service, clientType, meetingType } = context;
      const responsibleName = history[ChatState.SCHEDULING_RESPONSIBLE_NAME];
      const companyName = history[ChatState.SCHEDULING_COMPANY_NAME];
      const contactInfo = history[ChatState.SCHEDULING_CONTACT_INFO];
      return `Por favor, confirme as informações:\n\n- Serviço: *${service}*\n- Cliente: *${clientType}*\n- Modalidade: *${meetingType}*\n- Responsável: *${responsibleName}*\n- Empresa: *${companyName}*\n- Contato: *${contactInfo}*\n\nAs informações estão corretas?`;
    },
    confirmYes: "Sim, confirmar",
    confirmNo: "Não, recomeçar",
    schedulingConfirmed: (context) => `Obrigado! Sua solicitação de agendamento foi recebida. Nossa equipe entrará em contato através de *${context.history[ChatState.SCHEDULING_CONTACT_INFO]}* para confirmar data e horário.\n\nSe precisar de mais alguma coisa, é só chamar!`,
    attendantSelect: "Entendido. Para qual setor você gostaria de ser direcionado?",
    attendantTransfer: (context) => `Ok. Estou direcionando sua conversa para o *Setor ${context.department}*. Por favor, aguarde e um de nossos especialistas irá responder em breve.\n\n_Horário de atendimento: Seg-Sex, 08h-17h50._`,
    error: "Desculpe, ocorreu um erro de comunicação com nosso assistente. Por favor, tente novamente."
  },
  en: {
    greeting: "Hello! Welcome to JZF Virtual Assistance. How can I help you today?\n\nOur business hours are Mon-Fri, 8:00 AM to 5:50 PM.",
    backToStart: "↩️ Back to Start",
    optionAiAssistant: "🧠 Ask a Question",
    optionScheduling: "📅 Schedule Meeting",
    optionAttendant: "💬 Talk to an Agent",
    optionChangeLanguage: "🌐 Change Language",
    aiDeptSelect: "Certainly! Which area are your questions about?",
    aiDeptPrompt: (context) => `You can ask. I'm here to help with your questions about ${context.departmentEn}.`,
    deptRH: "HR",
    deptAccounting: "Accounting",
    deptTax: "Tax",
    deptCorporate: "Corporate",
    schedulingService: "Understood. For which service would you like to request an appointment?",
    serviceOpening: "Company Formation",
    serviceTaxReturn: "Income Tax Return",
    serviceConsulting: "Consulting",
    serviceOther: "Other Matters",
    schedulingClientType: "Are you already our client?",
    clientTypeYes: "Yes, I am",
    clientTypeNo: "No, I'm new",
    schedulingMeetingType: "Will the meeting be online or in person?",
    meetingTypeOnline: "Online",
    meetingTypeOnSite: "In Person",
    schedulingResponsibleName: "What is the full name of the person responsible for the meeting?",
    schedulingCompanyName: (context) => `Thank you, ${context.userInput}. Now, please provide the company name.`,
    schedulingContactInfo: (context) => `Perfect. And what is the best email or phone for contact?`,
    schedulingSummary: (context) => {
        const { history, serviceEn, clientTypeEn, meetingTypeEn, meetingType } = context;
        const responsibleName = history[ChatState.SCHEDULING_RESPONSIBLE_NAME];
        const companyName = history[ChatState.SCHEDULING_COMPANY_NAME];
        const contactInfo = history[ChatState.SCHEDULING_CONTACT_INFO];
      return `Please confirm the information:\n\n- Service: *${serviceEn}*\n- Client: *${clientTypeEn}*\n- Modality: *${meetingTypeEn || meetingType}*\n- Responsible: *${responsibleName}*\n- Company: *${companyName}*\n- Contact: *${contactInfo}*\n\nIs the information correct?`;
    },
    confirmYes: "Yes, confirm",
    confirmNo: "No, restart",
    schedulingConfirmed: (context) => `Thank you! Your scheduling request has been received. Our team will contact you via *${context.history[ChatState.SCHEDULING_CONTACT_INFO]}* to confirm the date and time.\n\nIf you need anything else, just ask!`,
    attendantSelect: "Understood. To which department would you like to be directed?",
    attendantTransfer: (context) => `Ok. I am directing your conversation to the *${context.departmentEn} Department*. Please wait, and one of our specialists will respond shortly.\n\n_Support hours: Mon-Fri, 8 AM - 5:50 PM._`,
    error: "Sorry, a communication error with our assistant occurred. Please try again."
  }
};

export const departmentSystemInstructions = {
  pt: {
    'RH': "Você é um assistente de contabilidade especialista em Recursos Humanos e Departamento Pessoal no Brasil. Responda em Português do Brasil. Seja direto, amigável e use uma linguagem conversacional.",
    'Contábil': "Você é um assistente de contabilidade especialista em normas contábeis brasileiras (CPCs). Responda em Português do Brasil. Seja direto, amigável e use uma linguagem conversacional.",
    'Fiscal': "Você é um assistente de contabilidade especialista em legislação fiscal e tributária brasileira. Responda em Português do Brasil. Seja direto, amigável e use uma linguagem conversacional.",
    'Societário': "Você é um assistente de contabilidade especialista em direito societário e processos de empresas no Brasil. Responda em Português do Brasil. Seja direto, amigável e use uma linguagem conversacional.",
  },
  en: {
    'HR': "You are an accounting assistant specializing in Human Resources in Brazil. Respond in English. Be direct, friendly, and use a conversational tone.",
    'Accounting': "You are an accounting assistant specializing in Brazilian accounting standards (CPCs). Respond in English. Be direct, friendly, and use a conversational tone.",
    'Tax': "You are an accounting assistant specializing in Brazilian tax legislation. Respond in English. Be direct, friendly, and use a conversational tone.",
    'Corporate': "You are an accounting assistant specializing in corporate law and business processes in Brazil. Respond in English. Be direct, friendly, and use a conversational tone.",
  }
};

export const getFollowUpPrompt = (lang, userQuestion, botAnswer) => {
    const promptBase = `Baseado nesta troca de mensagens, sugira exatamente 2 perguntas de acompanhamento curtas e relevantes que um cliente de contabilidade faria.\n\nUsuário: "${userQuestion}"\nBot: "${botAnswer}"\n\nRetorne apenas um array JSON de strings, como: ["Primeira pergunta?", "Segunda pergunta?"]`;
    if (lang === 'en') {
        return `Based on this exchange, suggest exactly 2 short, relevant follow-up questions an accounting client might ask.\n\nUser: "${userQuestion}"\nBot: "${botAnswer}"\n\nReturn only a JSON array of strings, like: ["First question?", "Second question?"]`;
    }
    return promptBase;
};
