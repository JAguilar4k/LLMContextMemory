import { HttpError } from "../../application/errors/HttpError.js";
import { assertPort } from "../../application/ports/assertPort.js";

const MOCK_ENDPOINT = "/api/llm";
const MOCK_LATENCY_MS = 500;
const CONTEXT_WINDOW_SIZE = 4;

export class MockLlmGateway {
  #tokenRepository;
  #timer;

  constructor({ tokenRepository, timer = globalThis }) {
    assertPort("TokenRepositoryPort", tokenRepository, ["getToken"]);
    assertPort("TimerPort", timer, ["setTimeout"]);

    this.#tokenRepository = tokenRepository;
    this.#timer = timer;
    Object.freeze(this);
  }

  async sendMessage({ prompt, conversation }) {
    try {
      const token = this.#tokenRepository.getToken();

      if (!token) {
        throw new HttpError(401, "Token expirado", {
          endpoint: MOCK_ENDPOINT,
          reason: "ACCESS_TOKEN_MISSING_OR_EXPIRED"
        });
      }

      if (typeof prompt !== "string" || prompt.trim() === "") {
        throw new HttpError(400, "Prompt inválido", {
          endpoint: MOCK_ENDPOINT,
          reason: "EMPTY_PROMPT"
        });
      }

      if (!this.#isValidConversation(conversation)) {
        throw new HttpError(422, "Historial de conversación inválido", {
          endpoint: MOCK_ENDPOINT,
          reason: "INVALID_CONVERSATION_HISTORY"
        });
      }

      const response = await this.#simulateFetchRequest({ prompt, conversation, token });
      return response.text;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError(500, "Error inesperado al enviar el mensaje", {
        endpoint: MOCK_ENDPOINT,
        originalError: error
      });
    }
  }

  #simulateFetchRequest(payload) {
    return new Promise(resolve => {
      this.#timer.setTimeout(() => {
        resolve({
          ok: true,
          status: 200,
          endpoint: MOCK_ENDPOINT,
          method: "POST",
          body: payload,
          text: this.#generateContextualResponse(payload.prompt, payload.conversation)
        });
      }, MOCK_LATENCY_MS);
    });
  }

  #generateContextualResponse(prompt, conversation) {
    const normalizedPrompt = this.#normalizeText(prompt);
    const userMessages = conversation
      .filter(message => message.role === "user")
      .map(message => message.content);
    const previousUserMessages = userMessages.slice(0, -1);
    const recentContext = previousUserMessages.slice(-CONTEXT_WINDOW_SIZE).join(" ");
    const normalizedRecentContext = this.#normalizeText(recentContext);
    const messageCount = conversation.length;

    if (this.#isGreeting(normalizedPrompt)) {
      return "Hola. Ya estoy siguiendo el hilo de esta conversacion. Puedes contarme que necesitas y respondere usando el contexto disponible.";
    }

    if (this.#asksForSummary(normalizedPrompt)) {
      return this.#buildSummaryResponse(userMessages, messageCount);
    }

    if (this.#asksWhatDoIHave(normalizedPrompt)) {
      return this.#buildInferenceResponse(normalizedRecentContext || normalizedPrompt);
    }

    if (this.#mentionsSleepOrTiredness(normalizedPrompt)) {
      return "Suena a cansancio o sueño acumulado. Si puedes, toma una pausa, hidrátate y descansa un poco. Si esto se repite mucho o viene con otros sintomas fuertes, lo responsable seria consultarlo con un profesional.";
    }

    if (this.#asksForAdvice(normalizedPrompt)) {
      return this.#buildAdviceResponse(prompt, previousUserMessages);
    }

    if (this.#mentionsCode(normalizedPrompt)) {
      return "Para trabajarlo como codigo, separaria el problema en piezas pequeñas: entrada, validacion, estado, salida y manejo de errores. Si me compartes el fragmento concreto, puedo ayudarte a depurarlo paso a paso.";
    }

    if (this.#isQuestion(normalizedPrompt)) {
      return this.#buildQuestionResponse(prompt, previousUserMessages, messageCount);
    }

    return this.#buildDefaultResponse(prompt, previousUserMessages, messageCount);
  }

  #buildSummaryResponse(userMessages, messageCount) {
    if (!userMessages.length) {
      return "Todavia no tengo suficiente conversacion para resumir.";
    }

    const lastTopics = userMessages.slice(-3).map(message => `"${message}"`).join(", ");
    return `Hasta ahora llevamos ${messageCount} mensajes. Lo mas reciente que mencionaste fue: ${lastTopics}. Puedo usar ese contexto para seguir respondiendo sin empezar desde cero.`;
  }

  #buildInferenceResponse(normalizedContext) {
    if (this.#mentionsSleepOrTiredness(normalizedContext)) {
      return "Por lo que dijiste antes, parece que tienes sueño o cansancio. No puedo diagnosticarte, pero lo mas probable es que tu cuerpo este pidiendo descanso. Si puedes, duerme una siesta corta o descansa temprano.";
    }

    if (normalizedContext.includes("hambre")) {
      return "Por el contexto, parece que tienes hambre. Podrias comer algo ligero y tomar agua para ver si te sientes mejor.";
    }

    if (normalizedContext.includes("estres") || normalizedContext.includes("ansiedad")) {
      return "Por el contexto, podria ser estres o ansiedad. Respira un momento, baja el ritmo y, si se vuelve frecuente o intenso, busca apoyo profesional.";
    }

    return "Con el contexto actual no puedo inferirlo con seguridad. Dime que sientes, desde cuando y que estabas haciendo antes, y te ayudo a ordenarlo.";
  }

  #buildAdviceResponse(prompt, previousUserMessages) {
    const context = previousUserMessages.length
      ? `Tomo en cuenta lo anterior: ${previousUserMessages.slice(-2).join(" / ")}. `
      : "";

    return `${context}Mi sugerencia es empezar por lo mas simple: define el objetivo, separa el problema en pasos y prueba una cosa a la vez. Sobre "${prompt}", dime que resultado quieres y lo afinamos.`;
  }

  #buildQuestionResponse(prompt, previousUserMessages, messageCount) {
    const contextNote = previousUserMessages.length
      ? `Tambien considero lo que dijiste antes: "${previousUserMessages.at(-1)}". `
      : "";

    return `${contextNote}Sobre tu pregunta "${prompt}", necesito responder con el contexto disponible de ${messageCount} mensajes. Mi mejor lectura es que buscas una respuesta directa y relacionada, no una frase generica.`;
  }

  #buildDefaultResponse(prompt, previousUserMessages, messageCount) {
    const contextNote = previousUserMessages.length
      ? `Vengo siguiendo el contexto; antes mencionaste "${previousUserMessages.at(-1)}". `
      : "";

    return `${contextNote}Entiendo: "${prompt}". Con ${messageCount} mensajes en la conversacion, puedo mantener el hilo y responder en funcion de lo que ya has escrito.`;
  }

  #normalizeText(value) {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  #isGreeting(normalizedPrompt) {
    return /^(hola|buenas|hey|saludos)\b/.test(normalizedPrompt);
  }

  #isQuestion(normalizedPrompt) {
    return normalizedPrompt.includes("?") ||
      /^(que|como|cuando|donde|porque|por que|cual|cuanto|quien)\b/.test(normalizedPrompt);
  }

  #asksForSummary(normalizedPrompt) {
    return normalizedPrompt.includes("resumen") ||
      normalizedPrompt.includes("resume") ||
      normalizedPrompt.includes("que hemos hablado");
  }

  #asksWhatDoIHave(normalizedPrompt) {
    return normalizedPrompt.includes("que tengo") ||
      normalizedPrompt.includes("que me pasa") ||
      normalizedPrompt.includes("que podria tener");
  }

  #asksForAdvice(normalizedPrompt) {
    return normalizedPrompt.includes("aconseja") ||
      normalizedPrompt.includes("recomienda") ||
      normalizedPrompt.includes("que hago") ||
      normalizedPrompt.includes("que deberia");
  }

  #mentionsSleepOrTiredness(normalizedText) {
    return /sue.?o/.test(normalizedText) ||
      normalizedText.includes("sueno") ||
      normalizedText.includes("dormir") ||
      normalizedText.includes("dormida") ||
      normalizedText.includes("dormido") ||
      normalizedText.includes("cansado") ||
      normalizedText.includes("cansada") ||
      normalizedText.includes("agotado") ||
      normalizedText.includes("agotada");
  }

  #mentionsCode(normalizedPrompt) {
    return normalizedPrompt.includes("codigo") ||
      normalizedPrompt.includes("javascript") ||
      normalizedPrompt.includes("html") ||
      normalizedPrompt.includes("css") ||
      normalizedPrompt.includes("bug") ||
      normalizedPrompt.includes("error");
  }

  #isValidConversation(conversation) {
    return Array.isArray(conversation) && conversation.length > 0 && conversation.every(message =>
      message &&
      typeof message === "object" &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string"
    );
  }
}
