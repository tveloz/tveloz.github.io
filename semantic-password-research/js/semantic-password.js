// semantic-password.js
// Updated version with API proxy support

console.log('🚀 Semantic Password Research Platform - Full Study Version');

// Configuration - Update this with your API endpoint
const API_CONFIG = {
    // Option 1: Use your serverless function (replace with your actual URL)
    CLAUDE_API_URL: 'https://your-project.vercel.app/api/claude',
    
    // Option 2: Use mock responses for testing
    USE_MOCK_API: true, // Set to false when using real API
    
    // Option 3: Use a CORS proxy (not recommended for production)
    // CLAUDE_API_URL: 'https://cors-anywhere.herokuapp.com/https://api.anthropic.com/v1/messages'
};

// Global state management
let sessionData = {
    sessionId: 'ses_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    screenResolution: window.screen.width + 'x' + window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    browserLanguage: navigator.language,
    version: '1.0-full-study'
};

// Study state variables
let currentPhase = 'consent';
let conversation = [];
let abstractResult = null;
let secondaryQuestions = [];
let secondaryAnswers = {};
let secondaryResult = null;
let phaseStartTime = Date.now();
let sessionStartTime = Date.now();
let timerInterval = null;

// Mock API responses for testing
const mockResponses = {
    setupInitial: "I'd be happy to help you create a semantic password based on a personal story or memory! This is a fascinating approach to authentication.\n\nTo get started, I need you to share a detailed personal story, memory, or even a fictional character/scenario that only you would know the specific details about. This could be:\n\n- A childhood memory with specific details\n- A family story with particular elements\n- A fictional character you've created with unique traits\n- A special place with specific features\n- An important life event with memorable details\n\nThe key is to include enough specific details that would be hard for someone else to guess, but memorable enough for you to recall consistently. Think about:\n- Who was involved?\n- Where did it happen?\n- What specific objects, colors, sounds, or feelings were present?\n- What was the sequence of events?\n- What emotions or reactions occurred?\n\nPlease share your story with as much detail as you feel comfortable with. The more specific details you include, the more secure and unique your semantic password will be.",
    
    setupResponse: "That's a wonderful and detailed story! I can see several strong elements that will make for a robust semantic password:\n\n**Key Elements I've Identified:**\n- Specific characters and relationships\n- Detailed setting and environment\n- Particular objects and their characteristics\n- Emotional context and reactions\n- Sequence of events\n- Sensory details (sounds, colors, textures)\n\nThese elements create multiple layers of verification that would be very difficult for someone else to replicate without knowing your personal experience.\n\nYour semantic password setup is now complete! You have a rich foundation of interconnected details that can be verified through different types of questions - from high-level story recognition to specific detail verification.\n\nWould you like to test the verification process now?",

    abstractVerification: {
        "abstract_match": true,
        "confidence": 75,
        "core_elements_recognized": ["Main character relationship", "Primary setting", "Key emotional context", "Central conflict/challenge"],
        "missing_core_elements": ["Specific objects mentioned", "Sensory details", "Exact sequence timing"],
        "explanation": "Your summary captures the essential narrative and emotional core of the story, showing clear recognition of the main elements. However, some specific details that were prominent in the original story are not reflected in this summary, which suggests we should verify those particular elements through targeted questions.",
        "requires_detailed_verification": true
    },

    secondaryQuestions: {
        "questions": [
            {
                "id": 1,
                "question": "What specific object was centrally featured in your story?",
                "options": {
                    "A": "Wooden chair",
                    "B": "Metal table", 
                    "C": "Glass window",
                    "D": "Fabric curtain"
                },
                "correct_answers": ["A"],
                "explanation": "The wooden chair was specifically mentioned as a key element",
                "question_type": "object"
            },
            {
                "id": 2,
                "question": "What emotions were primarily experienced in this story?",
                "options": {
                    "A": "Excitement",
                    "B": "Nostalgia",
                    "C": "Anxiety", 
                    "D": "Curiosity"
                },
                "correct_answers": ["B", "D"],
                "explanation": "Both nostalgia and curiosity were key emotional elements",
                "question_type": "emotion"
            },
            {
                "id": 3,
                "question": "What was the setting's primary characteristic?",
                "options": {
                    "A": "Outdoor garden",
                    "B": "Indoor library",
                    "C": "Crowded market",
                    "D": "Empty hallway"
                },
                "correct_answers": ["B"],
                "explanation": "The indoor library setting was specifically described",
                "question_type": "location"
            }
        ]
    }
};

// Translations object (same as before)
const translations = {
    en: {
        title: "Semantic Password Research Platform",
        subtitle: "Help us research a new authentication method based on personal stories",
        consentTitle: "Research Participation Consent",
        consentText: "This research studies semantic password systems. Your participation is voluntary and data will be anonymized for research purposes.",
        consentDetails: "We collect: interaction patterns, response times, success rates, and anonymized story elements. No personal information or actual stories are stored. Data will be used for academic research only.",
        participantLabel: "Participant ID (optional)",
        participantPlaceholder: "Enter your participant ID if provided by researcher",
        languageLabel: "Language",
        modeLabel: "Feedback Mode",
        verboseMode: "Detailed Feedback",
        silentMode: "Minimal Feedback",
        consentAgree: "I agree to participate in this research study",
        startText: "Start Research Session",
        setupTitle: "Setup Your Semantic Password",
        waitingMessage: "Waiting for initial response...",
        sendText: "Send",
        setupCompleteTitle: "Setup Complete!",
        setupCompleteDesc: "Your semantic password has been established. Now test the verification process.",
        testVerificationText: "Test Verification Process",
        abstractTitle: "Story Recognition Test",
        memoryCheckTitle: "Natural Memory Check",
        memoryCheckDesc: "Like asking a friend \"Remember that time when...?\" - provide a brief summary that captures the essence of your story.",
        memoryCheckNote: "Focus on the main events and key elements. Exact wording doesn't matter - just the overall meaning.",
        brieflyDescribe: "Briefly describe the essence of your story...",
        verifyStoryText: "Test Story Recognition",
        secondaryTitle: "Detail Verification",
        detailInstructionsTitle: "Instructions",
        detailInstructionsText: "Answer the following questions about your story. Each question may have multiple correct answers. You must select ALL correct options for each question to pass verification.",
        detailInstructionsNote: "Questions test different aspects: objects, emotions, sequences, relationships, and sensory details.",
        submitAnswersText: "Submit Answers",
        sessionCompleteTitle: "Research Session Complete",
        thankYouMessage: "Thank you for participating in our research! Your anonymized data has been collected for academic research purposes.",
        downloadText: "Download Session Data",
        newSessionText: "Start New Session",
        durationLabel: "Total Time",
        phasesLabel: "Phases Completed",
        outcomeLabel: "Final Outcome",
        accessGranted: "✓ Access Granted",
        accessDenied: "✗ Access Denied",
        processing: "Processing...",
        loading: "Loading...",
        apiError: "API Error - Using Demo Mode",
        demoMode: "Demo Mode Active"
    },
    es: {
        title: "Plataforma de Investigación de Contraseñas Semánticas",
        subtitle: "Ayúdanos a investigar un nuevo método de autenticación basado en historias personales",
        consentTitle: "Consentimiento de Participación en Investigación",
        consentText: "Esta investigación estudia sistemas de contraseñas semánticas. Tu participación es voluntaria y los datos serán anonimizados para fines de investigación.",
        consentDetails: "Recolectamos: patrones de interacción, tiempos de respuesta, tasas de éxito y elementos anonimizados de historias. No se almacena información personal o historias reales. Los datos se usarán solo para investigación académica.",
        participantLabel: "ID de Participante (opcional)",
        participantPlaceholder: "Ingresa tu ID de participante si te fue proporcionado por el investigador",
        languageLabel: "Idioma",
        modeLabel: "Modo de Retroalimentación",
        verboseMode: "Retroalimentación Detallada",
        silentMode: "Retroalimentación Mínima",
        consentAgree: "Acepto participar en este estudio de investigación",
        startText: "Iniciar Sesión de Investigación",
        setupTitle: "Configura tu Contraseña Semántica",
        waitingMessage: "Esperando respuesta inicial...",
        sendText: "Enviar",
        setupCompleteTitle: "¡Configuración Completa!",
        setupCompleteDesc: "Tu contraseña semántica ha sido establecida. Ahora prueba el proceso de verificación.",
        testVerificationText: "Probar Proceso de Verificación",
        abstractTitle: "Prueba de Reconocimiento de Historia",
        memoryCheckTitle: "Verificación Natural de Memoria",
        memoryCheckDesc: "Como preguntarle a un amigo \"¿Recuerdas esa vez cuando...?\" - proporciona un breve resumen que capture la esencia de tu historia.",
        memoryCheckNote: "Enfócate en los eventos principales y elementos clave. La redacción exacta no importa - solo el significado general.",
        brieflyDescribe: "Describe brevemente la esencia de tu historia...",
        verifyStoryText: "Probar Reconocimiento de Historia",
        secondaryTitle: "Verificación de Detalles",
        detailInstructionsTitle: "Instrucciones",
        detailInstructionsText: "Responde las siguientes preguntas sobre tu historia. Cada pregunta puede tener múltiples respuestas correctas. Debes seleccionar TODAS las opciones correctas para cada pregunta para pasar la verificación.",
        detailInstructionsNote: "Las preguntas evalúan diferentes aspectos: objetos, emociones, secuencias, relaciones y detalles sensoriales.",
        submitAnswersText: "Enviar Respuestas",
        sessionCompleteTitle: "Sesión de Investigación Completa",
        thankYouMessage: "¡Gracias por participar en nuestra investigación! Tus datos de interacción anonimizados han sido recolectados para fines de investigación académica.",
        downloadText: "Descargar Datos de Sesión",
        newSessionText: "Iniciar Nueva Sesión",
        durationLabel: "Tiempo Total",
        phasesLabel: "Fases Completadas",
        outcomeLabel: "Resultado Final",
        accessGranted: "✓ Acceso Concedido",
        accessDenied: "✗ Acceso Denegado",
        processing: "Procesando...",
        loading: "Cargando...",
        apiError: "Error de API - Usando Modo Demo",
        demoMode: "Modo Demo Activo"
    }
};

// Timer functions
function startTimer(elementId) {
    phaseStartTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - phaseStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = timeString;
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Research data collection function
function logEvent(eventType, data = {}) {
    const eventData = {
        ...sessionData,
        eventType,
        timestamp: new Date().toISOString(),
        timeFromStart: Date.now() - sessionStartTime,
        timeFromPhaseStart: Date.now() - phaseStartTime,
        currentPhase,
        usingMockAPI: API_CONFIG.USE_MOCK_API,
        ...data
    };

    try {
        const existingData = JSON.parse(localStorage.getItem('semanticPasswordResearch') || '[]');
        existingData.push(eventData);
        localStorage.setItem('semanticPasswordResearch', JSON.stringify(existingData));
    } catch (error) {
        console.warn('Failed to save to localStorage:', error);
    }

    console.log('📊 Research Event:', eventData);
    return eventData;
}

// Mock Claude API for testing
async function mockClaudeCall(messages) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const lastMessage = messages[messages.length - 1];
    const messageContent = lastMessage.content.toLowerCase();
    
    // Determine response type based on message content
    if (messages.length === 1) {
        return mockResponses.setupInitial;
    } else if (messageContent.includes('story') || messageContent.includes('memory') || messageContent.includes('character')) {
        return mockResponses.setupResponse;
    } else {
        return "Thank you for that additional detail! That adds more depth to your semantic password. The more specific information you provide, the more secure and memorable your authentication will be. Is there anything else you'd like to add to make your story even more detailed?";
    }
}

// Updated Claude API integration with fallback
async function callClaude(messages) {
    const startTime = Date.now();
    logEvent('api_call_started', { 
        messageCount: messages.length,
        usingMock: API_CONFIG.USE_MOCK_API 
    });
    
    try {
        let response, data;
        
        if (API_CONFIG.USE_MOCK_API) {
            // Use mock API for testing
            const mockResponse = await mockClaudeCall(messages);
            data = { content: [{ text: mockResponse }] };
            logEvent('mock_api_used');
        } else {
            // Use real API through proxy
            response = await fetch(API_CONFIG.CLAUDE_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: messages,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            data = await response.json();
        }
        
        const responseTime = Date.now() - startTime;
        
        logEvent('api_call_completed', { 
            responseTime,
            responseLength: data.content[0].text.length,
            usingMock: API_CONFIG.USE_MOCK_API
        });
        
        return data.content[0].text;
        
    } catch (error) {
        logEvent('api_call_error', { 
            error: error.message,
            responseTime: Date.now() - startTime
        });
        
        console.error("Error calling Claude API:", error);
        
        // Fallback to mock API if real API fails
        if (!API_CONFIG.USE_MOCK_API) {
            console.log("Falling back to mock API...");
            API_CONFIG.USE_MOCK_API = true;
            return mockClaudeCall(messages);
        }
        
        throw error;
    }
}

// Show API status in UI
function showAPIStatus() {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-300 text-blue-800 px-3 py-2 rounded-lg text-sm z-50';
    statusDiv.innerHTML = `
        <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full ${API_CONFIG.USE_MOCK_API ? 'animate-pulse' : ''}"></div>
            <span>${API_CONFIG.USE_MOCK_API ? translations[sessionData.language || 'en'].demoMode : 'Live API'}</span>
        </div>
    `;
    document.body.appendChild(statusDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (statusDiv.parentNode) {
            statusDiv.parentNode.removeChild(statusDiv);
        }
    }, 5000);
}

// Language update function (same as before)
function updateLanguage(lang) {
    const t = translations[lang];
    
    const updates = [
        ['main-title', 'title'],
        ['main-subtitle', 'subtitle'],
        ['consent-title', 'consentTitle'],
        ['consent-text', 'consentText'],
        ['consent-details', 'consentDetails'],
        ['participant-label', 'participantLabel'],
        ['language-label', 'languageLabel'],
        ['mode-label', 'modeLabel'], 
        ['consent-agree', 'consentAgree'],
        ['start-text', 'startText'],
        ['setup-title', 'setupTitle'],
        ['waiting-message', 'waitingMessage'],
        ['send-text', 'sendText'],
        ['setup-complete-title', 'setupCompleteTitle'],
        ['setup-complete-desc', 'setupCompleteDesc'],
        ['test-verification-text', 'testVerificationText'],
        ['abstract-title', 'abstractTitle'],
        ['memory-check-title', 'memoryCheckTitle'],
        ['memory-check-desc', 'memoryCheckDesc'],
        ['memory-check-note', 'memoryCheckNote'],
        ['verify-story-text', 'verifyStoryText'],
        ['secondary-title', 'secondaryTitle'],
        ['detail-instructions-title', 'detailInstructionsTitle'],
        ['detail-instructions-text', 'detailInstructionsText'],
        ['detail-instructions-note', 'detailInstructionsNote'],
        ['submit-answers-text', 'submitAnswersText'],
        ['final-title', 'sessionCompleteTitle'],
        ['thank-you-message', 'thankYouMessage'],
        ['download-final-text', 'downloadText'],
        ['new-session-final-text', 'newSessionText'],
        ['duration-label', 'durationLabel'],
        ['phases-label', 'phasesLabel'],
        ['outcome-label', 'outcomeLabel'],
        ['loading-title', 'loading'],
        ['loading-desc', 'loading']
    ];

    updates.forEach(([elementId, textKey]) => {
        const element = document.getElementById(elementId);
        if (element && t[textKey]) {
            element.textContent = t[textKey];
        }
    });

    const participantInput = document.getElementById('participant-id');
    if (participantInput && t['participantPlaceholder']) {
        participantInput.placeholder = t['participantPlaceholder'];
    }

    const abstractTextarea = document.getElementById('abstract-summary');
    if (abstractTextarea && t['brieflyDescribe']) {
        abstractTextarea.placeholder = t['brieflyDescribe'];
    }

    const modeSelect = document.getElementById('mode-select');
    if (modeSelect && t['verboseMode'] && t['silentMode']) {
        modeSelect.options[0].textContent = t['verboseMode'];
        modeSelect.options[1].textContent = t['silentMode'];
    }
}

// Phase transition functions
function showScreen(screenId) {
    const screens = ['consent-screen', 'setup-screen', 'abstract-screen', 'secondary-screen', 'final-screen', 'loading-screen'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('fade-in');
    }
}

function resetToConsent() {
    logEvent('session_abandoned', { phase: currentPhase });
    location.reload();
}

// Setup phase functions
async function startSetup() {
    currentPhase = 'setup';
    showScreen('setup-screen');
    startTimer('elapsed-time');
    showAPIStatus();
    logEvent('setup_phase_started');

    try {
        const lang = sessionData.language || 'en';
        const initialPrompt = lang === 'es' 
            ? "Quiero configurar una contraseña semántica. Por favor ayúdame a crear una basada en una historia personal, memoria, o personaje ficticio que solo yo conocería los detalles. Guíame para compartir los detalles importantes."
            : "I want to set up a semantic password. Please help me create one based on a personal story, memory, or fictional character that only I would know the details about. Guide me through sharing the important details.";
        
        const response = await callClaude([
            { role: "user", content: initialPrompt }
        ]);

        conversation = [
            { role: "user", content: initialPrompt },
            { role: "assistant", content: response }
        ];
        
        updateConversationDisplay();
        enableUserInput();
        
        logEvent('setup_conversation_started', { 
            promptLength: initialPrompt.length,
            responseLength: response.length
        });
    } catch (error) {
        logEvent('setup_error', { error: error.message });
        alert("Failed to start setup. Please try again or check your internet connection.");
    }
}

function updateConversationDisplay() {
    const conversationArea = document.getElementById('conversation-area');
    const emptyMessage = document.getElementById('conversation-empty');
    
    if (emptyMessage) emptyMessage.remove();
    
    conversationArea.innerHTML = '';
    
    conversation.forEach((message, index) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `p-4 rounded-lg ${
            message.role === 'user'
                ? 'bg-blue-50 border-l-4 border-blue-400'
                : 'bg-gray-50 border-l-4 border-gray-400'
        }`;
        
        messageDiv.innerHTML = `
            <div class="font-semibold text-sm mb-2 text-gray-600">
                ${message.role === 'user' ? (sessionData.language === 'es' ? 'Tú' : 'You') : (sessionData.language === 'es' ? 'Asistente' : 'Assistant')}
            </div>
            <div class="text-gray-800">${message.content}</div>
        `;
        
        conversationArea.appendChild(messageDiv);
    });
    
    conversationArea.scrollTop = conversationArea.scrollHeight;
}

function enableUserInput() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    userInput.disabled = false;
    userInput.addEventListener('input', () => {
        if (userInput.value.trim()) {
            sendButton.disabled = false;
            sendButton.className = sendButton.className.replace('bg-gray-400', 'bg-green-600 hover:bg-green-700');
        } else {
            sendButton.disabled = true;
            sendButton.className = sendButton.className.replace('bg-green-600 hover:bg-green-700', 'bg-gray-400');
        }
    });
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    const messageData = {
        messageLength: message.length,
        messageNumber: conversation.filter(m => m.role === 'user').length + 1
    };
    
    logEvent('setup_message_sent', messageData);
    
    userInput.disabled = true;
    document.getElementById('send-button').disabled = true;
    
    try {
        conversation.push({ role: "user", content: message });
        userInput.value = '';
        updateConversationDisplay();
        
        const response = await callClaude(conversation);
        
        conversation.push({ role: "assistant", content: response });
        updateConversationDisplay();
        
        const userMessageCount = conversation.filter(msg => msg.role === 'user').length;
        if (userMessageCount >= 2) {
            showSetupComplete();
            logEvent('setup_completed', { 
                totalMessages: conversation.length,
                userMessages: userMessageCount
            });
        }
        
        userInput.disabled = false;
        
    } catch (error) {
        logEvent('setup_error', { error: error.message });
        alert("Failed to send message. Please try again.");
        userInput.disabled = false;
    }
}

function showSetupComplete() {
    document.getElementById('setup-complete').classList.remove('hidden');
}

// Abstract verification functions
function startAbstractVerification() {
    currentPhase = 'abstract';
    showScreen('abstract-screen');
    startTimer('abstract-elapsed-time');
    logEvent('abstract_phase_started');
    
    const abstractSummary = document.getElementById('abstract-summary');
    const verifyButton = document.getElementById('verify-abstract-button');
    
    abstractSummary.addEventListener('input', () => {
        if (abstractSummary.value.trim()) {
            verifyButton.disabled = false;
            verifyButton.className = verifyButton.className.replace('bg-gray-400', 'bg-blue-600 hover:bg-blue-700');
        } else {
            verifyButton.disabled = true;
            verifyButton.className = verifyButton.className.replace('bg-blue-600 hover:bg-blue-700', 'bg-gray-400');
        }
    });
}

async function verifyAbstractSummary() {
    const summaryText = document.getElementById('abstract-summary').value.trim();
    if (!summaryText) return;

    const summaryData = {
        summaryLength: summaryText.length,
        wordCount: summaryText.split(' ').length
    };
    
    logEvent('abstract_verification_started', summaryData);
    
    const verifyButton = document.getElementById('verify-abstract-button');
    verifyButton.disabled = true;
    verifyButton.innerHTML = `
        <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner"></div>
        <span>${translations[sessionData.language || 'en'].processing}</span>
    `;
    
    try {
        if (API_CONFIG.USE_MOCK_API) {
            // Use mock response for abstract verification
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
            abstractResult = mockResponses.abstractVerification;
        } else {
            // Use real API
            const languageInstruction = sessionData.language === 'es' 
                ? "Responde en español. " 
                : "Respond in English. ";

            const abstractPrompt = `
${languageInstruction}You are verifying if a brief abstract summary captures the core semantic meaning of a detailed story.

Original detailed story from setup:
${JSON.stringify(conversation, null, 2)}

Brief abstract summary provided for verification:
"${summaryText}"

Your task is to determine if this summary captures the CORE SEMANTIC ELEMENTS of the original story, similar to how humans verify shared memories with phrases like "Remember that time when..."

Focus on:
1. Core narrative elements (main action, key characters, setting)
2. Abstract semantic meaning (not specific details)
3. Essential plot points and relationships
4. Overall story structure and emotional context

IGNORE:
- Specific word choices (syntactic differences are OK)  
- Minor details that don't affect core meaning
- Exact sequences if overall meaning is preserved

The summary should demonstrate clear recognition of the story's essence, even if told differently.

Respond with ONLY a valid JSON object:
{
  "abstract_match": <boolean>,
  "confidence": <number 0-100>,
  "core_elements_recognized": [<list of core elements that were captured>],
  "missing_core_elements": [<list of essential elements missing>],
  "explanation": "<why this does or doesn't capture the story essence>",
  "requires_detailed_verification": <boolean>
}

Set requires_detailed_verification to true if confidence < 85 or if important core elements are missing.

DO NOT output anything other than valid JSON.
`;

            const response = await callClaude([
                { role: "user", content: abstractPrompt }
            ]);

            let cleanResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            abstractResult = JSON.parse(cleanResponse);
        }

        const verificationData = {
            confidence: abstractResult.confidence,
            abstract_match: abstractResult.abstract_match,
            requires_detailed: abstractResult.requires_detailed_verification,
            elements_recognized: abstractResult.core_elements_recognized?.length || 0,
            elements_missing: abstractResult.missing_core_elements?.length || 0,
            ...summaryData
        };

        logEvent('abstract_verification_completed', verificationData);
        showAbstractResults();

        if (abstractResult.requires_detailed_verification && abstractResult.abstract_match) {
            await generateSecondaryQuestions();
        } else {
            setTimeout(() => showFinalResults(), 2000);
        }
        
    } catch (error) {
        logEvent('abstract_verification_error', { error: error.message });
        console.error("Abstract verification error:", error);
        alert("Abstract verification failed. Please try again.");
        
        verifyButton.disabled = false;
        verifyButton.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"></path>
            </svg>
            <span>${translations[sessionData.language || 'en'].verifyStoryText}</span>
        `;
    }
}

function showAbstractResults() {
    const resultsDiv = document.getElementById('abstract-results');
    const t = translations[sessionData.language || 'en'];
    const testMode = sessionData.mode || 'verbose';
    
    if (testMode === 'verbose') {
        resultsDiv.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Recognition Analysis</h3>
                
                <div class="grid md:grid-cols-2 gap-6 mb-6">
                    <div class="bg-white p-4 rounded-lg">
                        <div class="flex items-center space-x-3 mb-3">
                            <div class="w-6 h-6 ${abstractResult.confidence >= 80 ? 'text-green-600' : abstractResult.confidence >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                                ${abstractResult.confidence >= 80 ? '✓' : abstractResult.confidence >= 60 ? '⚠' : '✗'}
                            </div>
                            <h4 class="font-semibold text-gray-800">Recognition Confidence</h4>
                        </div>
                        <div class="text-3xl font-bold ${abstractResult.confidence >= 80 ? 'text-green-600' : abstractResult.confidence >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                            ${abstractResult.confidence}%
                        </div>
                    </div>

                    <div class="bg-white p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-3">Story Recognition</h4>
                        <div class="text-lg font-semibold ${abstractResult.abstract_match ? 'text-green-600' : 'text-red-600'}">
                            ${abstractResult.abstract_match ? '✓ Story Recognized' : '✗ Story Not Recognized'}
                        </div>
                    </div>
                </div>

                <div class="space-y-4 mb-6">
                    <div class="bg-white p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-3">Core Elements Recognized</h4>
                        <div class="flex flex-wrap gap-2">
                            ${abstractResult.core_elements_recognized?.map(element => 
                                `<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">${element}</span>`
                            ).join('') || ''}
                        </div>
                    </div>

                    ${abstractResult.missing_core_elements && abstractResult.missing_core_elements.length > 0 ? `
                        <div class="bg-white p-4 rounded-lg">
                            <h4 class="font-semibold text-gray-800 mb-3">Missing Core Elements</h4>
                            <div class="flex flex-wrap gap-2">
                                ${abstractResult.missing_core_elements.map(element => 
                                    `<span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">${element}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="bg-white p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-3">Analysis</h4>
                        <p class="text-gray-700">${abstractResult.explanation}</p>
                    </div>
                </div>

                ${abstractResult.requires_detailed_verification && abstractResult.abstract_match ? `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div class="flex items-center space-x-2 mb-2">
                            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="font-semibold text-yellow-800">Additional Questions Required</span>
                        </div>
                        <p class="text-yellow-700 mb-3">Your summary shows recognition but some key details need clarification. Proceeding to detailed element verification.</p>
                    </div>
                ` : `
                    <div class="p-4 rounded-lg ${abstractResult.abstract_match && abstractResult.confidence >= 85 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
                        <div class="flex items-center space-x-2 mb-2">
                            ${abstractResult.abstract_match && abstractResult.confidence >= 85 ? 
                                '<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' :
                                '<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
                            }
                            <span class="font-semibold ${abstractResult.abstract_match && abstractResult.confidence >= 85 ? 'text-green-800' : 'text-red-800'}">
                                ${abstractResult.abstract_match && abstractResult.confidence >= 85 ? t.accessGranted : t.accessDenied}
                            </span>
                        </div>
                        <p class="${abstractResult.abstract_match && abstractResult.confidence >= 85 ? 'text-green-700' : 'text-red-700'}">
                            ${abstractResult.abstract_match && abstractResult.confidence >= 85 
                                ? 'Your story summary perfectly captures the essence of your semantic password.'
                                : 'The story summary does not adequately match your original semantic password.'
                            }
                        </p>
                    </div>
                `}
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <div class="text-lg font-semibold text-gray-800">
                    ${abstractResult.abstract_match ? t.accessGranted : t.accessDenied}
                </div>
            </div>
        `;
    }
    
    resultsDiv.classList.remove('hidden');
}

// Secondary verification functions
async function generateSecondaryQuestions() {
    logEvent('secondary_questions_generation_started');
    
    try {
        if (API_CONFIG.USE_MOCK_API) {
            // Use mock questions
            await new Promise(resolve => setTimeout(resolve, 1500));
            secondaryQuestions = mockResponses.secondaryQuestions.questions;
        } else {
            // Use real API to generate questions
            const missingElements = abstractResult.missing_core_elements || [];
            const languageInstruction = sessionData.language === 'es' 
                ? "Create questions in Spanish. Question text, options, and explanations should be in Spanish. " 
                : "Create questions in English. ";

            const questionPrompt = `
${languageInstruction}Based on the original semantic password setup and the verification results, create multiple choice questions to verify the missing or unclear elements.

Original password setup conversation:
${JSON.stringify(conversation, null, 2)}

Primary verification results:
- Missing elements: ${JSON.stringify(missingElements)}

Create 3-5 multiple choice questions that test the specific elements that were missing or unclear. Follow these guidelines:

QUESTION DESIGN:
1. Focus on specific, verifiable details from the original story
2. Have 4 options (A, B, C, D) 
3. Have 1-2 correct answers per question
4. Include plausible but incorrect alternatives
5. Test different aspects: objects, emotions, sequences, relationships, sensory details

Respond with ONLY a valid JSON object:
{
  "questions": [
    {
      "id": 1,
      "question": "<question text>",
      "options": {
        "A": "<option text>",
        "B": "<option text>", 
        "C": "<option text>",
        "D": "<option text>"
      },
      "correct_answers": ["A"],
      "explanation": "<why these are correct>",
      "question_type": "<object/color/emotion/sequence/relationship/location/time/reaction>"
    }
  ]
}

DO NOT output anything other than valid JSON.
`;

            const response = await callClaude([
                { role: "user", content: questionPrompt }
            ]);

            let cleanResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const questions = JSON.parse(cleanResponse);
            secondaryQuestions = questions.questions;
        }
        
        const questionData = {
            questionCount: secondaryQuestions.length,
            questionTypes: secondaryQuestions.map(q => q.question_type),
            totalCombinations: secondaryQuestions.reduce((acc, q) => acc * Math.pow(2, q.correct_answers.length), 1)
        };
        
        logEvent('secondary_questions_generated', questionData);
        setTimeout(() => startSecondaryVerification(), 1000);
        
    } catch (error) {
        logEvent('secondary_questions_error', { error: error.message });
        console.error("Question generation error:", error);
        setTimeout(() => showFinalResults(), 1000);
    }
}

function startSecondaryVerification() {
    currentPhase = 'secondary';
    showScreen('secondary-screen');
    startTimer('secondary-elapsed-time');
    logEvent('secondary_phase_started');
    
    displaySecondaryQuestions();
}

function displaySecondaryQuestions() {
    const questionsArea = document.getElementById('questions-area');
    const submitButton = document.getElementById('submit-secondary-button');
    
    questionsArea.innerHTML = '';
    
    secondaryQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'bg-gray-50 rounded-lg p-6';
        questionDiv.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-800">
                    Question ${index + 1}: ${question.question}
                </h3>
                ${sessionData.mode === 'verbose' && question.question_type ? `
                    <span class="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                        ${question.question_type}
                    </span>
                ` : ''}
            </div>
            
            <div class="space-y-3">
                ${Object.entries(question.options).map(([optionKey, optionText]) => `
                    <label class="flex items-start space-x-3 cursor-pointer">
                        <input type="checkbox" 
                               data-question-id="${question.id}" 
                               data-option="${optionKey}"
                               class="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 question-checkbox"
                               onchange="handleSecondaryAnswer(${question.id}, '${optionKey}', this.checked)">
                        <span class="text-gray-700">
                            <strong>${optionKey}:</strong> ${optionText}
                        </span>
                    </label>
                `).join('')}
            </div>
        `;
        questionsArea.appendChild(questionDiv);
    });
    
    // Enable submit button when answers are selected
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('question-checkbox')) {
            const hasAnswers = document.querySelectorAll('.question-checkbox:checked').length > 0;
            if (hasAnswers) {
                submitButton.disabled = false;
                submitButton.className = submitButton.className.replace('bg-gray-400', 'bg-orange-600 hover:bg-orange-700');
            }
        }
    });
}

function handleSecondaryAnswer(questionId, option, checked) {
    if (!secondaryAnswers[questionId]) {
        secondaryAnswers[questionId] = {};
    }
    secondaryAnswers[questionId][option] = checked;
    
    const totalAnswersForQuestion = Object.keys(secondaryAnswers[questionId])
        .filter(key => secondaryAnswers[questionId][key]).length;

    logEvent('secondary_answer_changed', {
        questionId,
        option,
        checked,
        totalAnswersForQuestion
    });
}

async function submitSecondaryVerification() {
    const submissionStartTime = Date.now();
    logEvent('secondary_verification_started');
    
    const submitButton = document.getElementById('submit-secondary-button');
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner"></div>
        <span>${translations[sessionData.language || 'en'].processing}</span>
    `;
    
    try {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let totalQuestions = secondaryQuestions.length;
        let correctQuestions = 0;
        let results = [];
        let answerPattern = {};

        secondaryQuestions.forEach(question => {
            const userAnswers = Object.keys(secondaryAnswers[question.id] || {})
                .filter(option => secondaryAnswers[question.id][option]);
            
            const correctAnswers = question.correct_answers;
            
            const isCorrect = userAnswers.length === correctAnswers.length &&
                userAnswers.every(answer => correctAnswers.includes(answer)) &&
                correctAnswers.every(answer => userAnswers.includes(answer));

            if (isCorrect) correctQuestions++;
            
            answerPattern[question.id] = {
                userAnswers,
                correctAnswers,
                isCorrect,
                questionType: question.question_type,
                partialCredit: userAnswers.filter(ans => correctAnswers.includes(ans)).length / correctAnswers.length
            };

            results.push({
                questionId: question.id,
                question: question.question,
                userAnswers,
                correctAnswers,
                isCorrect
            });
        });

        const secondaryScore = (correctQuestions / totalQuestions) * 100;
        const overallSuccess = secondaryScore === 100;

        secondaryResult = {
            score: secondaryScore,
            correct: correctQuestions,
            total: totalQuestions,
            success: overallSuccess,
            results
        };

        const finalAccess = abstractResult?.abstract_match && 
                          abstractResult?.confidence >= 60 && 
                          overallSuccess;

        const verificationData = {
            score: secondaryScore,
            correct: correctQuestions,
            total: totalQuestions,
            success: overallSuccess,
            finalAccess,
            answerPattern,
            submissionTime: Date.now() - submissionStartTime
        };

        logEvent('secondary_verification_completed', verificationData);

        const sessionDuration = Date.now() - sessionStartTime;
        logEvent('session_completed', {
            finalAccess,
            abstractConfidence: abstractResult?.confidence,
            secondaryScore,
            totalDuration: sessionDuration,
            sessionOutcome: finalAccess ? 'success' : 'failure'
        });

        showSecondaryResults();
        setTimeout(() => showFinalResults(), 3000);

    } catch (error) {
        logEvent('secondary_verification_error', { error: error.message });
        console.error("Secondary verification error:", error);
        alert("Verification failed. Please try again.");
        
        submitButton.disabled = false;
        submitButton.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>${translations[sessionData.language || 'en'].submitAnswersText}</span>
        `;
    }
}

function showSecondaryResults() {
    const resultsDiv = document.getElementById('secondary-results');
    const t = translations[sessionData.language || 'en'];
    const testMode = sessionData.mode || 'verbose';
    
    if (testMode === 'verbose') {
        resultsDiv.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-4">Detail Verification Results</h3>
                
                <div class="grid md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-3">Score</h4>
                        <div class="text-3xl font-bold ${secondaryResult.score >= 80 ? 'text-green-600' : secondaryResult.score >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                            ${secondaryResult.score.toFixed(0)}%
                        </div>
                    </div>

                    <div class="bg-white p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-3">Correct Answers</h4>
                        <div class="text-2xl font-bold text-gray-800">
                            ${secondaryResult.correct} / ${secondaryResult.total}
                        </div>
                    </div>

                    <div class="bg-white p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-3">Status</h4>
                        <div class="text-lg font-semibold ${secondaryResult.success ? 'text-green-600' : 'text-red-600'}">
                            ${secondaryResult.success ? '✓ Passed' : '✗ Failed'}
                        </div>
                    </div>

                    <div class="bg-white p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-3">Security Strength</h4>
                        <div class="text-lg font-bold text-indigo-600">
                            ${secondaryQuestions.reduce((acc, q) => acc * Math.pow(2, q.correct_answers.length), 1)} combinations
                        </div>
                        <div class="text-xs text-gray-500">Combinatorial space</div>
                    </div>
                </div>

                <div class="space-y-4 mb-6">
                    ${secondaryResult.results.map((result, index) => {
                        const question = secondaryQuestions.find(q => q.id === result.questionId);
                        return `
                            <div class="p-4 rounded-lg ${result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
                                <div class="flex items-start space-x-3 mb-2">
                                    <div class="w-5 h-5 mt-1 ${result.isCorrect ? 'text-green-600' : 'text-red-600'}">
                                        ${result.isCorrect ? '✓' : '✗'}
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between mb-1">
                                            <h5 class="font-semibold ${result.isCorrect ? 'text-green-800' : 'text-red-800'}">
                                                Question ${index + 1}: ${result.isCorrect ? 'Correct' : 'Incorrect'}
                                            </h5>
                                            ${question?.question_type ? `
                                                <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                                    ${question.question_type}
                                                </span>
                                            ` : ''}
                                        </div>
                                        <p class="text-gray-700 text-sm mb-2">${result.question}</p>
                                        <div class="text-sm">
                                            <span class="text-gray-600">Your answers: </span>
                                            <span class="${result.isCorrect ? 'text-green-700' : 'text-red-700'}">
                                                ${result.userAnswers.length > 0 ? result.userAnswers.join(', ') : 'None selected'}
                                            </span>
                                        </div>
                                        <div class="text-sm">
                                            <span class="text-gray-600">Correct answers: </span>
                                            <span class="text-green-700">${result.correctAnswers.join(', ')}</span>
                                        </div>
                                        ${question?.explanation ? `
                                            <div class="text-sm mt-1">
                                                <span class="text-gray-600">Explanation: </span>
                                                <span class="text-gray-700">${question.explanation}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } else {
        const finalAccess = abstractResult?.abstract_match && abstractResult?.confidence >= 60 && secondaryResult.success;
        resultsDiv.innerHTML = `
            <div class="text-center py-8">
                <div class="text-lg font-semibold text-gray-800">
                    ${finalAccess ? t.accessGranted : t.accessDenied}
                </div>
            </div>
        `;
    }
    
    resultsDiv.classList.remove('hidden');
}

function showFinalResults() {
    currentPhase = 'complete';
    showScreen('final-screen');
    stopTimer();
    
    const sessionDuration = Date.now() - sessionStartTime;
    const finalAccess = abstractResult?.abstract_match && 
                      (abstractResult?.confidence >= 85 || 
                       (abstractResult?.confidence >= 60 && secondaryResult?.success));
    
    const finalIcon = document.getElementById('final-icon');
    const finalSessionId = document.getElementById('final-session-id');
    const finalDuration = document.getElementById('final-duration');
    const phasesCompleted = document.getElementById('phases-completed');
    const finalOutcomeIcon = document.getElementById('final-outcome-icon');
    
    if (finalAccess) {
        finalIcon.className = 'w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4';
        finalOutcomeIcon.textContent = '✓';
        finalOutcomeIcon.className = 'text-2xl font-bold text-green-600';
    } else {
        finalIcon.className = 'w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4';
        finalOutcomeIcon.textContent = '✗';
        finalOutcomeIcon.className = 'text-2xl font-bold text-red-600';
    }
    
    finalSessionId.textContent = sessionData.sessionId;
    finalDuration.textContent = Math.round(sessionDuration / 60000) + 'm';
    
    let phases = 1; // Always have consent
    if (conversation.length > 0) phases++;
    if (abstractResult) phases++;
    if (secondaryResult) phases++;
    phasesCompleted.textContent = phases;
    
    logEvent('final_results_displayed', {
        finalAccess,
        sessionDuration,
        phasesCompleted: phases
    });
}

// Utility functions
function downloadSessionData() {
    const data = JSON.parse(localStorage.getItem('semanticPasswordResearch') || '[]');
    const sessionEvents = data.filter(event => event.sessionId === sessionData.sessionId);
    
    const exportData = {
        sessionInfo: sessionData,
        totalEvents: sessionEvents.length,
        exportTimestamp: new Date().toISOString(),
        apiMode: API_CONFIG.USE_MOCK_API ? 'mock' : 'live',
        events: sessionEvents
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `semantic_password_research_${sessionData.sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logEvent('data_downloaded');
}

function startResearch() {
    const participantId = document.getElementById('participant-id').value.trim() || 
                         'anonymous_' + Math.random().toString(36).substr(2, 6);
    const language = document.getElementById('language-select').value;
    const mode = document.getElementById('mode-select').value;
    
    sessionData.participantId = participantId;
    sessionData.language = language;
    sessionData.mode = mode;
    sessionData.consentGiven = true;
    sessionData.consentTimestamp = new Date().toISOString();
    
    logEvent('consent_given', { participantId, language, mode });
    
    document.getElementById('loading-screen').classList.remove('hidden');
    
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        startSetup();
    }, 2000);
}

// Initialize event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Enable/disable start button based on consent
    document.getElementById('consent-checkbox').addEventListener('change', function() {
        const startButton = document.getElementById('start-button');
        if (this.checked) {
            startButton.disabled = false;
            startButton.className = startButton.className
                .replace('bg-gray-400', 'bg-indigo-600 hover:bg-indigo-700')
                .replace('cursor-not-allowed', 'cursor-pointer');
        } else {
            startButton.disabled = true;
            startButton.className = startButton.className
                .replace('bg-indigo-600 hover:bg-indigo-700', 'bg-gray-400')
                .replace('cursor-pointer', 'cursor-not-allowed');
        }
    });

    // Language switching
    document.getElementById('language-select').addEventListener('change', function() {
        const lang = this.value;
        updateLanguage(lang);
        logEvent('language_changed', { newLanguage: lang });
    });

    // Mode switching
    document.getElementById('mode-select').addEventListener('change', function() {
        logEvent('mode_changed', { newMode: this.value });
    });

    // Initialize with current language
    updateLanguage(document.getElementById('language-select').value);
    
    console.log('✅ Platform loaded successfully!');
    console.log('📋 Session ID:', sessionData.sessionId);
    console.log('🔧 API Mode:', API_CONFIG.USE_MOCK_API ? 'Mock/Demo' : 'Live');
    logEvent('page_loaded');
});

// Log page unload
window.addEventListener('beforeunload', () => {
    logEvent('page_unloaded');
});

console.log('🎯 Semantic Password Research Platform initialized');
console.log('🔬 Session tracking active');
console.log('📡 API Configuration:', API_CONFIG.USE_MOCK_API ? 'Using Mock API for testing' : 'Using Live API');