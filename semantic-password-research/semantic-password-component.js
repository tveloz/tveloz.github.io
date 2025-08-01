// semantic-password-component.js
// Complete Research-Ready Semantic Password Platform

const { useState, useEffect } = React;
const { 
    Lock, Unlock, MessageCircle, Check, X, AlertCircle, 
    Loader, HelpCircle, Settings, Eye, EyeOff, BarChart, 
    Download, User, Globe, Clock, Shield 
} = lucide;

const SemanticPasswordResearchPlatform = () => {
    // Core state
    const [mode, setMode] = useState('consent');
    const [language, setLanguage] = useState('en');
    const [testMode, setTestMode] = useState('silent');
    const [participantId, setParticipantId] = useState('');
    const [consentGiven, setConsentGiven] = useState(false);
    
    // Conversation state
    const [setupConversation, setSetupConversation] = useState([]);
    const [abstractSummary, setAbstractSummary] = useState('');
    const [abstractResult, setAbstractResult] = useState(null);
    const [secondaryQuestions, setSecondaryQuestions] = useState([]);
    const [secondaryAnswers, setSecondaryAnswers] = useState({});
    const [secondaryResult, setSecondaryResult] = useState(null);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [setupComplete, setSetupComplete] = useState(false);
    
    // Research tracking
    const [sessionData, setSessionData] = useState({});
    const [startTime, setStartTime] = useState(null);
    const [phaseStartTime, setPhaseStartTime] = useState(null);

    // Generate unique session ID
    useEffect(() => {
        if (!sessionData.sessionId) {
            const sessionId = 'ses_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            setSessionData(prev => ({
                ...prev,
                sessionId,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                browserLanguage: navigator.language,
                studyVersion: '1.0'
            }));
        }
    }, []);

    const translations = {
        en: {
            // Consent and Research
            title: "Semantic Password Research Platform",
            subtitle: "Help us research a new authentication method based on personal stories",
            consentTitle: "Research Participation Consent",
            consentText: "This research studies semantic password systems. Your participation is voluntary and data will be anonymized for research purposes.",
            consentDetails: "We collect: interaction patterns, response times, success rates, and anonymized story elements. No personal information or actual stories are stored. Data will be used for academic research only.",
            participantId: "Participant ID (optional)",
            participantPlaceholder: "Enter your participant ID if provided by researcher",
            agreeParticipate: "I agree to participate in this research study",
            startResearch: "Start Research Session",
            
            // Main Interface
            howItWorks: "How It Works",
            enhancedSecurity: "Research Focus Areas",
            setup: "Setup Phase",
            abstractCheck: "Recognition Phase", 
            detailCheck: "Verification Phase",
            access: "Authentication",
            shareStory: "Share a detailed personal story, memory, or fictional character",
            briefSummary: "Provide a brief \"Remember when...\" style summary",
            answerQuestions: "Answer specific questions about story elements",
            accessGranted: "Access granted based on story recognition + precise details",
            
            // Research Areas
            naturalFlow: "🧠 Natural human memory verification patterns",
            usabilityStudy: "📊 Usability and user experience measurement",
            securityAnalysis: "🔒 Security effectiveness vs traditional passwords",
            cognitiveLoad: "⏱️ Cognitive load and memorability assessment",
            adaptiveQuestioning: "🎯 Adaptive questioning based on confidence levels",
            crossLinguistic: "🌍 Cross-linguistic authentication effectiveness",
            
            startTesting: "Begin Research Session",
            setupSemanticPassword: "Setup Your Semantic Password",
            abstractStoryVerification: "Story Recognition Test",
            
            // Instructions
            naturalMemoryCheck: "Natural Memory Recognition",
            naturalMemoryDesc: "Like asking a friend \"Remember that time when...?\" - provide a brief summary that captures the essence of your story.",
            focusMainPlot: "Focus on the main events and key elements. Exact wording doesn't matter - just the overall meaning.",
            brieflyDescribe: "Briefly describe the essence of your story...",
            verifyStoryEssence: "Test Story Recognition",
            
            // Results (Verbose Mode)
            abstractVerificationResults: "Recognition Analysis",
            recognitionConfidence: "Recognition Confidence",
            storyRecognition: "Story Recognition",
            storyRecognized: "✓ Story Recognized",
            storyNotRecognized: "✗ Story Not Recognized", 
            coreElementsRecognized: "Core Elements Recognized",
            missingCoreElements: "Missing Core Elements",
            explanation: "Analysis",
            
            // Secondary Verification
            detailedVerificationRequired: "Additional Questions Required",
            summaryShowsRecognition: "Your summary shows recognition but needs clarification on specific details.",
            continueToDetailedQuestions: "Continue to Detail Questions",
            elementVerification: "Detail Verification",
            instructions: "Instructions",
            elementInstructions: "Answer the following questions about your story. Each question may have multiple correct answers. You must select ALL correct options for each question to pass verification.",
            questionTypes: "Questions test different aspects: objects, emotions, sequences, relationships, and sensory details.",
            submitVerification: "Submit Answers",
            
            // Results
            elementVerificationResults: "Detail Verification Results",
            score: "Score",
            correctAnswers: "Correct Answers", 
            status: "Status",
            passed: "✓ Passed",
            failed: "✗ Failed",
            securityStrength: "Security Strength",
            combinations: "combinations",
            combinatorialSpace: "Combinatorial space",
            correct: "Correct",
            incorrect: "Incorrect",
            question: "Question",
            yourAnswers: "Your answers",
            correctAnswersLabel: "Correct answers",
            noneSelected: "None selected",
            finalResult: "Final Authentication Result",
            
            // Actions
            retryQuestions: "Retry Questions",
            backToMainVerification: "Back to Recognition",
            tryDifferentSummary: "Try Different Summary",
            newTest: "New Research Session",
            
            // Setup Phase
            setupComplete: "✓ Setup Complete!",
            passwordEstablished: "Your semantic password is established. Now test the verification process.",
            testVerification: "Test Verification Process",
            you: "You",
            assistant: "Research Assistant",
            typeResponse: "Type your response...",
            send: "Send",
            processing: "Processing...",
            verifying: "Verifying...",
            
            // Settings
            settings: "Research Settings",
            language: "Language",
            mode: "Feedback Mode",
            verbose: "Detailed Feedback",
            silent: "Minimal Feedback",
            verboseDesc: "Shows confidence scores and detailed analysis",
            silentDesc: "Minimal feedback for realistic user experience testing",
            
            // Silent Mode Messages
            accessGrantedMsg: "✓ Access Granted",
            accessDeniedMsg: "✗ Access Denied",
            continue: "Continue",
            processing: "Processing",
            
            // Session Complete
            sessionComplete: "Research Session Complete",
            thankYou: "Thank you for participating in our research!",
            dataCollected: "Your anonymized interaction data has been collected for academic research purposes.",
            downloadData: "Download Your Session Data",
            newSession: "Start New Research Session",
            sessionSummary: "Session Summary",
            totalTime: "Total Time",
            phases: "Phases Completed",
            finalOutcome: "Final Authentication Outcome"
        },
        es: {
            // Consent and Research  
            title: "Plataforma de Investigación de Contraseñas Semánticas",
            subtitle: "Ayúdanos a investigar un nuevo método de autenticación basado en historias personales",
            consentTitle: "Consentimiento de Participación en Investigación",
            consentText: "Esta investigación estudia sistemas de contraseñas semánticas. Tu participación es voluntaria y los datos serán anonimizados para fines de investigación.",
            consentDetails: "Recolectamos: patrones de interacción, tiempos de respuesta, tasas de éxito y elementos anonimizados de historias. No se almacena información personal o historias reales. Los datos se usarán solo para investigación académica.",
            participantId: "ID de Participante (opcional)",
            participantPlaceholder: "Ingresa tu ID de participante si te fue proporcionado por el investigador",
            agreeParticipate: "Acepto participar en este estudio de investigación",
            startResearch: "Iniciar Sesión de Investigación",
            
            // Main Interface
            howItWorks: "Cómo Funciona",
            enhancedSecurity: "Áreas de Investigación",
            setup: "Fase de Configuración",
            abstractCheck: "Fase de Reconocimiento",
            detailCheck: "Fase de Verificación", 
            access: "Autenticación",
            shareStory: "Comparte una historia personal detallada, memoria o personaje ficticio",
            briefSummary: "Proporciona un breve resumen estilo \"¿Recuerdas cuando...?\"",
            answerQuestions: "Responde preguntas específicas sobre elementos de la historia",
            accessGranted: "Acceso otorgado basado en reconocimiento de historia + detalles precisos",
            
            // Research Areas
            naturalFlow: "🧠 Patrones naturales de verificación de memoria humana",
            usabilityStudy: "📊 Medición de usabilidad y experiencia de usuario",
            securityAnalysis: "🔒 Efectividad de seguridad vs contraseñas tradicionales",
            cognitiveLoad: "⏱️ Evaluación de carga cognitiva y memorabilidad",
            adaptiveQuestioning: "🎯 Preguntas adaptativas basadas en niveles de confianza",
            crossLinguistic: "🌍 Efectividad de autenticación inter-lingüística",
            
            startTesting: "Comenzar Sesión de Investigación",
            setupSemanticPassword: "Configura tu Contraseña Semántica",
            abstractStoryVerification: "Prueba de Reconocimiento de Historia",
            
            // Instructions
            naturalMemoryCheck: "Reconocimiento Natural de Memoria",
            naturalMemoryDesc: "Como preguntarle a un amigo \"¿Recuerdas esa vez cuando...?\" - proporciona un breve resumen que capture la esencia de tu historia.",
            focusMainPlot: "Enfócate en los eventos principales y elementos clave. La redacción exacta no importa - solo el significado general.",
            brieflyDescribe: "Describe brevemente la esencia de tu historia...",
            verifyStoryEssence: "Probar Reconocimiento de Historia",
            
            // Results (Verbose Mode)
            abstractVerificationResults: "Análisis de Reconocimiento",
            recognitionConfidence: "Confianza de Reconocimiento",
            storyRecognition: "Reconocimiento de Historia",
            storyRecognized: "✓ Historia Reconocida",
            storyNotRecognized: "✗ Historia No Reconocida",
            coreElementsRecognized: "Elementos Centrales Reconocidos",
            missingCoreElements: "Elementos Centrales Faltantes",
            explanation: "Análisis",
            
            // Secondary Verification
            detailedVerificationRequired: "Preguntas Adicionales Requeridas",
            summaryShowsRecognition: "Tu resumen muestra reconocimiento pero necesita aclaración en detalles específicos.",
            continueToDetailedQuestions: "Continuar a Preguntas Detalladas",
            elementVerification: "Verificación de Detalles",
            instructions: "Instrucciones",
            elementInstructions: "Responde las siguientes preguntas sobre tu historia. Cada pregunta puede tener múltiples respuestas correctas. Debes seleccionar TODAS las opciones correctas para cada pregunta para pasar la verificación.",
            questionTypes: "Las preguntas evalúan diferentes aspectos: objetos, emociones, secuencias, relaciones y detalles sensoriales.",
            submitVerification: "Enviar Respuestas",
            
            // Results
            elementVerificationResults: "Resultados de Verificación de Detalles",
            score: "Puntuación",
            correctAnswers: "Respuestas Correctas",
            status: "Estado", 
            passed: "✓ Aprobado",
            failed: "✗ Fallido",
            securityStrength: "Fortaleza de Seguridad",
            combinations: "combinaciones",
            combinatorialSpace: "Espacio combinatorio",
            correct: "Correcto",
            incorrect: "Incorrecto",
            question: "Pregunta",
            yourAnswers: "Tus respuestas",
            correctAnswersLabel: "Respuestas correctas",
            noneSelected: "Ninguna seleccionada",
            finalResult: "Resultado Final de Autenticación",
            
            // Actions
            retryQuestions: "Reintentar Preguntas",
            backToMainVerification: "Volver a Reconocimiento",
            tryDifferentSummary: "Probar Resumen Diferente",
            newTest: "Nueva Sesión de Investigación",
            
            // Setup Phase
            setupComplete: "✓ ¡Configuración Completa!",
            passwordEstablished: "Tu contraseña semántica está establecida. Ahora prueba el proceso de verificación.",
            testVerification: "Probar Proceso de Verificación",
            you: "Tú",
            assistant: "Asistente de Investigación",
            typeResponse: "Escribe tu respuesta...",
            send: "Enviar",
            processing: "Procesando...",
            verifying: "Verificando...",
            
            // Settings
            settings: "Configuración de Investigación",
            language: "Idioma",
            mode: "Modo de Retroalimentación",
            verbose: "Retroalimentación Detallada",
            silent: "Retroalimentación Mínima",
            verboseDesc: "Muestra puntuaciones de confianza y análisis detallado",
            silentDesc: "Retroalimentación mínima para pruebas de experiencia de usuario realistas",
            
            // Silent Mode Messages
            accessGrantedMsg: "✓ Acceso Concedido",
            accessDeniedMsg: "✗ Acceso Denegado",
            continue: "Continuar",
            processing: "Procesando",
            
            // Session Complete
            sessionComplete: "Sesión de Investigación Completa",
            thankYou: "¡Gracias por participar en nuestra investigación!",
            dataCollected: "Tus datos de interacción anonimizados han sido recolectados para fines de investigación académica.",
            downloadData: "Descargar Datos de tu Sesión",
            newSession: "Iniciar Nueva Sesión de Investigación",
            sessionSummary: "Resumen de Sesión",
            totalTime: "Tiempo Total",
            phases: "Fases Completadas",
            finalOutcome: "Resultado Final de Autenticación"
        }
    };

    const t = (key) => translations[language][key] || key;

    // Research data collection functions
    const logEvent = (eventType, data = {}) => {
        const currentTime = Date.now();
        const eventData = {
            ...sessionData,
            eventType,
            timestamp: new Date().toISOString(),
            timeFromStart: startTime ? currentTime - startTime : 0,
            timeFromPhaseStart: phaseStartTime ? currentTime - phaseStartTime : 0,
            currentMode: mode,
            testMode,
            language,
            ...data
        };

        // Store in localStorage for research collection
        const storageKey = 'semanticPasswordResearch';
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existingData.push(eventData);
        localStorage.setItem(storageKey, JSON.stringify(existingData));

        // Console log for development
        console.log('Research Event:', eventData);
        
        return eventData;
    };

    const downloadResearchData = () => {
        const data = JSON.parse(localStorage.getItem('semanticPasswordResearch') || '[]');
        const sessionEvents = data.filter(event => event.sessionId === sessionData.sessionId);
        
        const exportData = {
            sessionInfo: sessionData,
            totalEvents: sessionEvents.length,
            exportTimestamp: new Date().toISOString(),
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
    };

    // API call with error tracking
    const callClaude = async (messages) => {
        const startTime = Date.now();
        logEvent('api_call_started', { messageCount: messages.length });
        
        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1500,
                    messages: messages
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const responseTime = Date.now() - startTime;
            
            logEvent('api_call_completed', { 
                responseTime,
                responseLength: data.content[0].text.length
            });
            
            return data.content[0].text;
        } catch (error) {
            logEvent('api_call_error', { 
                error: error.message,
                responseTime: Date.now() - startTime
            });
            console.error("Error calling Claude:", error);
            throw error;
        }
    };

    // Phase management
    const startPhase = (phaseName) => {
        setPhaseStartTime(Date.now());
        logEvent('phase_started', { phase: phaseName });
    };

    const endPhase = (phaseName, additionalData = {}) => {
        const phaseTime = phaseStartTime ? Date.now() - phaseStartTime : 0;
        logEvent('phase_completed', { 
            phase: phaseName, 
            phaseTime,
            ...additionalData 
        });
    };

    // Event handlers with logging
    const startConsent = () => {
        if (!consentGiven) return;
        
        const finalParticipantId = participantId.trim() || 'anonymous_' + Math.random().toString(36).substr(2, 6);
        setParticipantId(finalParticipantId);
        
        setSessionData(prev => ({
            ...prev,
            participantId: finalParticipantId,
            consentGiven: true,
            consentTimestamp: new Date().toISOString()
        }));
        
        setStartTime(Date.now());
        logEvent('consent_given', { participantId: finalParticipantId });
        setMode('home');
    };

    const startSetup = async () => {
        startPhase('setup');
        setMode('setup');
        setIsLoading(true);
        
        try {
            const initialPrompt = language === 'es' 
                ? "Quiero configurar una contraseña semántica. Por favor ayúdame a crear una basada en una historia personal, memoria, o personaje ficticio que solo yo conocería los detalles. Guíame para compartir los detalles importantes."
                : "I want to set up a semantic password. Please help me create one based on a personal story, memory, or fictional character that only I would know the details about. Guide me through sharing the important details.";
            
            const response = await callClaude([
                { role: "user", content: initialPrompt }
            ]);

            const newConversation = [
                { role: "user", content: initialPrompt },
                { role: "assistant", content: response }
            ];
            
            setSetupConversation(newConversation);
            logEvent('setup_conversation_started', { 
                promptLength: initialPrompt.length,
                responseLength: response.length
            });
        } catch (error) {
            logEvent('setup_error', { error: error.message });
            alert("Failed to start setup. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const continueSetup = async () => {
        if (!currentMessage.trim()) return;

        const messageData = {
            messageLength: currentMessage.length,
            messageNumber: setupConversation.filter(m => m.role === 'user').length + 1
        };
        
        logEvent('setup_message_sent', messageData);
        setIsLoading(true);
        
        try {
            const newMessage = { role: "user", content: currentMessage };
            const updatedConversation = [...setupConversation, newMessage];
            
            const response = await callClaude(updatedConversation);
            
            const finalConversation = [
                ...updatedConversation,
                { role: "assistant", content: response }
            ];
            
            setSetupConversation(finalConversation);
            setCurrentMessage('');
            
            const userMessageCount = updatedConversation.filter(msg => msg.role === 'user').length;
            if (userMessageCount >= 2) {
                setSetupComplete(true);
                endPhase('setup', { 
                    totalMessages: finalConversation.length,
                    userMessages: userMessageCount,
                    setupQuality: 'sufficient' // Could be enhanced with content analysis
                });
            }
        } catch (error) {
            logEvent('setup_error', { error: error.message });
            alert("Failed to continue conversation. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const startAbstractVerification = () => {
        startPhase('abstract_verification');
        setMode('abstract');
    };

    const verifyAbstractSummary = async () => {
        if (!abstractSummary.trim()) return;

        const summaryData = {
            summaryLength: abstractSummary.length,
            wordCount: abstractSummary.split(' ').length
        };
        
        logEvent('abstract_verification_started', summaryData);
        setIsLoading(true);
        
        try {
            const languageInstruction = language === 'es' 
                ? "Responde en español. " 
                : "Respond in English. ";

            const abstractPrompt = `
${languageInstruction}You are verifying if a brief abstract summary captures the core semantic meaning of a detailed story.

Original detailed story from setup:
${JSON.stringify(setupConversation, null, 2)}

Brief abstract summary provided for verification:
"${abstractSummary}"

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
            const result = JSON.parse(cleanResponse);
            setAbstractResult(result);

            const verificationData = {
                confidence: result.confidence,
                abstract_match: result.abstract_match,
                requires_detailed: result.requires_detailed_verification,
                elements_recognized: result.core_elements_recognized?.length || 0,
                elements_missing: result.missing_core_elements?.length || 0,
                ...summaryData
            };

            logEvent('abstract_verification_completed', verificationData);
            endPhase('abstract_verification', verificationData);

            if (result.requires_detailed_verification && result.abstract_match) {
                await generateSecondaryQuestions(result);
            }
            
        } catch (error) {
            logEvent('abstract_verification_error', { error: error.message });
            console.error("Abstract verification error:", error);
            alert("Abstract verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const generateSecondaryQuestions = async (primaryResult) => {
        startPhase('secondary_questions_generation');
        setIsLoading(true);
        
        try {
            const missingElements = primaryResult.missing_core_elements || [];
            const discrepancies = primaryResult.discrepancies || [];
            
            const languageInstruction = language === 'es' 
                ? "Create questions in Spanish. Question text, options, and explanations should be in Spanish. " 
                : "Create questions in English. ";

            const questionPrompt = `
${languageInstruction}Based on the original semantic password setup and the verification results, create multiple choice questions to verify the missing or unclear elements.

Original password setup conversation:
${JSON.stringify(setupConversation, null, 2)}

Primary verification results:
- Missing elements: ${JSON.stringify(missingElements)}
- Discrepancies: ${JSON.stringify(discrepancies)}

Create 5-7 multiple choice questions that test the specific elements that were missing or unclear. Follow these CRITICAL guidelines:

ABSTRACTION LEVEL CONSISTENCY (Rosch's Natural Categories):
- Keep ALL options at the same abstraction level (basic level categories)
- If one option is "golden retriever" (basic level), others should be "labrador", "poodle", "beagle" 
- NEVER mix "golden retriever" with "large dog" (superordinate) or "therapy animal" (functional description)
- If one option is "treehouse" (basic level), others should be "cabin", "shed", "gazebo"
- NEVER mix "treehouse" with "elevated outdoor structure" (descriptive/superordinate level)

QUESTION DESIGN:
1. Focus on specific, verifiable details from the original story
2. Have 4 options (A, B, C, D) all at the same categorical abstraction level
3. Have 2-3 correct answers per question (increases combinatorial security)
4. Include plausible but incorrect alternatives at the same abstraction level
5. Test multiple types of details: objects, places, actions, emotions, sequences, relationships
6. Include sensory details (colors, sounds, textures) when mentioned
7. Test temporal relationships and sequences
8. Include emotional context and personal reactions

Respond with ONLY a valid JSON object:
{
  "questions": [
    {
      "id": 1,
      "question": "<question text>",
      "options": {
        "A": "<option text - basic level category>",
        "B": "<option text - basic level category>", 
        "C": "<option text - basic level category>",
        "D": "<option text - basic level category>"
      },
      "correct_answers": ["A", "C"],
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
            
            setSecondaryQuestions(questions.questions);
            
            const questionData = {
                questionCount: questions.questions.length,
                questionTypes: questions.questions.map(q => q.question_type),
                totalCombinations: questions.questions.reduce((acc, q) => acc * Math.pow(2, q.correct_answers.length), 1)
            };
            
            logEvent('secondary_questions_generated', questionData);
            endPhase('secondary_questions_generation', questionData);
            startPhase('secondary_verification');
            setMode('secondary');
            
        } catch (error) {
            logEvent('secondary_questions_error', { error: error.message });
            console.error("Question generation error:", error);
            alert("Failed to generate verification questions. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSecondaryAnswer = (questionId, option, checked) => {
        setSecondaryAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [option]: checked
            }
        }));

        const totalAnswersForQuestion = Object.keys({
            ...secondaryAnswers[questionId],
            [option]: checked
        }).filter(key => 
            (secondaryAnswers[questionId] && secondaryAnswers[questionId][key]) || 
            (key === option && checked)
        ).length;

        logEvent('secondary_answer_changed', {
            questionId,
            option,
            checked,
            totalAnswersForQuestion
        });
    };

    const submitSecondaryVerification = async () => {
        const submissionStartTime = Date.now();
        logEvent('secondary_verification_started');
        setIsLoading(true);
        
        try {
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

            const finalResult = {
                score: secondaryScore,
                correct: correctQuestions,
                total: totalQuestions,
                success: overallSuccess,
                results
            };

            setSecondaryResult(finalResult);

            // Calculate final verification status
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
            endPhase('secondary_verification', verificationData);

            // Log session completion
            const sessionDuration = Date.now() - startTime;
            logEvent('session_completed', {
                finalAccess,
                abstractConfidence: abstractResult?.confidence,
                secondaryScore,
                totalDuration: sessionDuration,
                sessionOutcome: finalAccess ? 'success' : 'failure'
            });

        } catch (error) {
            logEvent('secondary_verification_error', { error: error.message });
            console.error("Secondary verification error:", error);
            alert("Verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetSystem = () => {
        logEvent('session_reset');
        setMode('home');
        setSetupConversation([]);
        setAbstractSummary('');
        setAbstractResult(null);
        setSecondaryQuestions([]);
        setSecondaryAnswers({});
        setSecondaryResult(null);
        setCurrentMessage('');
        setSetupComplete(false);
        setStartTime(null);
        setPhaseStartTime(null);
    };

    const completeSession = () => {
        logEvent('session_completed_by_user');
        setMode('complete');
    };

    // Utility functions
    const getConfidenceColor = (confidence) => {
        if (confidence >= 80) return 'text-green-600';
        if (confidence >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConfidenceIcon = (confidence) => {
        if (confidence >= 80) return React.createElement(Check, { className: "w-6 h-6 text-green-600" });
        if (confidence >= 60) return React.createElement(AlertCircle, { className: "w-6 h-6 text-yellow-600" });
        return React.createElement(X, { className: "w-6 h-6 text-red-600" });
    };

    const getFinalVerificationStatus = () => {
        if (!abstractResult) return null;
        
        if (!abstractResult.abstract_match || abstractResult.confidence < 60) {
            return false;
        }
        
        if (!abstractResult.requires_detailed_verification && abstractResult.confidence >= 85) {
            return true;
        }
        
        if (abstractResult.requires_detailed_verification && !secondaryResult) {
            return null;
        }
        
        if (secondaryResult) {
            return abstractResult.abstract_match && abstractResult.confidence >= 60 && secondaryResult.success;
        }
        
        return false;
    };

    const getSilentMessage = (success) => {
        if (success === null) return null;
        return success ? t('accessGrantedMsg') : t('accessDeniedMsg');
    };

    const formatTime = (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Render functions for each mode
    const renderConsentScreen = () => (
        React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6" },
            React.createElement('div', { className: "max-w-4xl mx-auto" },
                React.createElement('div', { className: "text-center mb-8" },
                    React.createElement('div', { className: "flex justify-center mb-4" },
                        React.createElement(BarChart, { className: "w-16 h-16 text-indigo-600" })
                    ),
                    React.createElement('h1', { className: "text-4xl font-bold text-gray-800 mb-4" }, t('title')),
                    React.createElement('p', { className: "text-lg text-gray-600 max-w-2xl mx-auto" }, t('subtitle'))
                ),
                
                React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-8 mb-6" },
                    React.createElement('h2', { className: "text-2xl font-semibold text-gray-800 mb-4" }, t('consentTitle')),
                    React.createElement('p', { className: "text-gray-700 mb-4" }, t('consentText')),
                    React.createElement('p', { className: "text-gray-600 text-sm mb-6" }, t('consentDetails')),
                    
                    React.createElement('div', { className: "mb-6" },
                        React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, t('participantId')),
                        React.createElement('input', {
                            type: "text",
                            value: participantId,
                            onChange: (e) => setParticipantId(e.target.value),
                            placeholder: t('participantPlaceholder'),
                            className: "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        })
                    ),
                    
                    React.createElement('div', { className: "mb-6 grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement('div', null,
                            React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, t('language')),
                            React.createElement('select', {
                                value: language,
                                onChange: (e) => setLanguage(e.target.value),
                                className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            },
                                React.createElement('option', { value: "en" }, "English"),
                                React.createElement('option', { value: "es" }, "Español")
                            )
                        ),
                        React.createElement('div', null,
                            React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, t('mode')),
                            React.createElement('select', {
                                value: testMode,
                                onChange: (e) => setTestMode(e.target.value),
                                className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                            },
                                React.createElement('option', { value: "verbose" }, t('verbose')),
                                React.createElement('option', { value: "silent" }, t('silent'))
                            )
                        )
                    ),
                    
                    React.createElement('div', { className: "flex items-center space-x-3 mb-6" },
                        React.createElement('input', {
                            type: "checkbox",
                            id: "consent",
                            checked: consentGiven,
                            onChange: (e) => setConsentGiven(e.target.checked),
                            className: "w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        }),
                        React.createElement('label', { htmlFor: "consent", className: "text-gray-700" }, t('agreeParticipate'))
                    ),
                    
                    React.createElement('div', { className: "flex justify-center" },
                        React.createElement('button', {
                            onClick: startConsent,
                            disabled: !consentGiven,
                            className: "bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
                        },
                            React.createElement(User, { className: "w-5 h-5" }),
                            React.createElement('span', null, t('startResearch'))
                        )
                    )
                )
            )
        )
    );

    // Main render
    if (mode === 'consent') {
        return renderConsentScreen();
    }

    if (mode === 'complete') {
        const sessionDuration = startTime ? Date.now() - startTime : 0;
        const completedPhases = [];
        if (setupComplete) completedPhases.push(t('setup'));
        if (abstractResult) completedPhases.push(t('abstractCheck'));
        if (secondaryResult) completedPhases.push(t('detailCheck'));
        
        return React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6" },
            React.createElement('div', { className: "max-w-4xl mx-auto" },
                React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-8 text-center" },
                    React.createElement(Check, { className: "w-16 h-16 text-green-600 mx-auto mb-4" }),
                    React.createElement('h1', { className: "text-3xl font-bold text-gray-800 mb-4" }, t('sessionComplete')),
                    React.createElement('p', { className: "text-lg text-gray-600 mb-6" }, t('thankYou')),
                    React.createElement('p', { className: "text-gray-600 mb-8" }, t('dataCollected')),
                    
                    React.createElement('div', { className: "bg-gray-50 rounded-lg p-6 mb-8" },
                        React.createElement('h3', { className: "text-lg font-semibold text-gray-800 mb-4" }, t('sessionSummary')),
                        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-center" },
                            React.createElement('div', null,
                                React.createElement('div', { className: "text-2xl font-bold text-blue-600" }, formatTime(sessionDuration)),
                                React.createElement('div', { className: "text-sm text-gray-600" }, t('totalTime'))
                            ),
                            React.createElement('div', null,
                                React.createElement('div', { className: "text-2xl font-bold text-green-600" }, completedPhases.length),
                                React.createElement('div', { className: "text-sm text-gray-600" }, t('phases'))
                            ),
                            React.createElement('div', null,
                                React.createElement('div', { className: `text-2xl font-bold ${getFinalVerificationStatus() ? 'text-green-600' : 'text-red-600'}` },
                                    getFinalVerificationStatus() ? '✓' : '✗'
                                ),
                                React.createElement('div', { className: "text-sm text-gray-600" }, t('finalOutcome'))
                            )
                        )
                    ),
                    
                    React.createElement('div', { className: "flex justify-center space-x-4" },
                        React.createElement('button', {
                            onClick: downloadResearchData,
                            className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
                        },
                            React.createElement(Download, { className: "w-5 h-5" }),
                            React.createElement('span', null, t('downloadData'))
                        ),
                        React.createElement('button', {
                            onClick: () => {
                                setMode('consent');
                                resetSystem();
                            },
                            className: "bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
                        },
                            React.createElement(User, { className: "w-5 h-5" }),
                            React.createElement('span', null, t('newSession'))
                        )
                    )
                )
            )
        );
    }

    // Home screen
    if (mode === 'home') {
        return React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" },
            React.createElement('div', { className: "max-w-4xl mx-auto" },
                // Research Settings Bar
                React.createElement('div', { className: "mb-6 bg-white rounded-lg shadow-sm p-4" },
                    React.createElement('div', { className: "flex items-center justify-between" },
                        React.createElement('div', { className: "flex items-center space-x-4" },
                            React.createElement(Settings, { className: "w-5 h-5 text-gray-600" }),
                            React.createElement('span', { className: "font-medium text-gray-700" }, t('settings')),
                            React.createElement('span', { className: "text-sm text-gray-500" }, `Session: ${sessionData.sessionId?.substring(4, 12) || 'N/A'}`)
                        ),
                        React.createElement('div', { className: "flex items-center space-x-6" },
                            React.createElement('div', { className: "flex items-center space-x-2" },
                                React.createElement('span', { className: "text-sm text-gray-600" }, t('language')),
                                React.createElement('select', {
                                    value: language,
                                    onChange: (e) => {
                                        setLanguage(e.target.value);
                                        logEvent('language_changed', { newLanguage: e.target.value });
                                    },
                                    className: "border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                                },
                                    React.createElement('option', { value: "en" }, "English"),
                                    React.createElement('option', { value: "es" }, "Español")
                                )
                            ),
                            React.createElement('div', { className: "flex items-center space-x-2" },
                                React.createElement('span', { className: "text-sm text-gray-600" }, t('mode')),
                                React.createElement('select', {
                                    value: testMode,
                                    onChange: (e) => {
                                        setTestMode(e.target.value);
                                        logEvent('test_mode_changed', { newMode: e.target.value });
                                    },
                                    className: "border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                                },
                                    React.createElement('option', { value: "verbose" }, t('verbose')),
                                    React.createElement('option', { value: "silent" }, t('silent'))
                                )
                            )
                        )
                    ),
                    React.createElement('div', { className: "mt-2 text-xs text-gray-500 flex justify-end space-x-4" },
                        React.createElement('span', { className: "flex items-center space-x-1" },
                            React.createElement(Eye, { className: "w-4 h-4" }),
                            React.createElement('span', null, t('verboseDesc'))
                        ),
                        React.createElement('span', { className: "flex items-center space-x-1" },
                            React.createElement(EyeOff, { className: "w-4 h-4" }),
                            React.createElement('span', null, t('silentDesc'))
                        )
                    )
                ),

                React.createElement('div', { className: "text-center mb-8" },
                    React.createElement('div', { className: "flex justify-center mb-4" },
                        React.createElement(Shield, { className: "w-16 h-16 text-indigo-600" })
                    ),
                    React.createElement('h1', { className: "text-4xl font-bold text-gray-800 mb-4" }, t('title')),
                    React.createElement('p', { className: "text-lg text-gray-600 max-w-2xl mx-auto" }, t('subtitle'))
                ),

                React.createElement('div', { className: "grid md:grid-cols-2 gap-6 mb-8" },
                    React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                        React.createElement('h2', { className: "text-2xl font-semibold text-gray-800 mb-4" }, t('howItWorks')),
                        React.createElement('div', { className: "space-y-3 text-gray-600" },
                            React.createElement('div', { className: "flex items-start space-x-3" },
                                React.createElement(MessageCircle, { className: "w-5 h-5 text-indigo-600 mt-1" }),
                                React.createElement('span', null,
                                    React.createElement('strong', null, t('setup'), ": "),
                                    t('shareStory')
                                )
                            ),
                            React.createElement('div', { className: "flex items-start space-x-3" },
                                React.createElement(MessageCircle, { className: "w-5 h-5 text-indigo-600 mt-1" }),
                                React.createElement('span', null,
                                    React.createElement('strong', null, t('abstractCheck'), ": "),
                                    t('briefSummary')
                                )
                            ),
                            React.createElement('div', { className: "flex items-start space-x-3" },
                                React.createElement(HelpCircle, { className: "w-5 h-5 text-indigo-600 mt-1" }),
                                React.createElement('span', null,
                                    React.createElement('strong', null, t('detailCheck'), ": "),
                                    t('answerQuestions')
                                )
                            ),
                            React.createElement('div', { className: "flex items-start space-x-3" },
                                React.createElement(Check, { className: "w-5 h-5 text-indigo-600 mt-1" }),
                                React.createElement('span', null,
                                    React.createElement('strong', null, t('access'), ": "),
                                    t('accessGranted')
                                )
                            )
                        )
                    ),

                    React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                        React.createElement('h2', { className: "text-2xl font-semibold text-gray-800 mb-4" }, t('enhancedSecurity')),
                        React.createElement('div', { className: "space-y-3 text-gray-600 text-sm" },
                            React.createElement('p', null, t('naturalFlow')),
                            React.createElement('p', null, t('usabilityStudy')),
                            React.createElement('p', null, t('securityAnalysis')),
                            React.createElement('p', null, t('cognitiveLoad')),
                            React.createElement('p', null, t('adaptiveQuestioning')),
                            React.createElement('p', null, t('crossLinguistic'))
                        )
                    )
                ),

                React.createElement('div', { className: "text-center" },
                    React.createElement('button', {
                        onClick: startSetup,
                        className: "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
                    },
                        React.createElement(Lock, { className: "w-5 h-5" }),
                        React.createElement('span', null, t('startTesting'))
                    )
                )
            )
        );
    }

    // Setup mode
    if (mode === 'setup') {
        return React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6" },
            React.createElement('div', { className: "max-w-4xl mx-auto" },
                React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                    React.createElement('div', { className: "flex items-center justify-between mb-6" },
                        React.createElement('h1', { className: "text-3xl font-bold text-gray-800" }, t('setupSemanticPassword')),
                        React.createElement('div', { className: "flex items-center space-x-4" },
                            startTime && React.createElement('div', { className: "flex items-center space-x-2 text-gray-600" },
                                React.createElement(Clock, { className: "w-4 h-4" }),
                                React.createElement('span', { className: "text-sm" }, formatTime(Date.now() - startTime))
                            ),
                            React.createElement('button', {
                                onClick: () => {
                                    logEvent('session_abandoned', { phase: 'setup' });
                                    resetSystem();
                                    setMode('consent');
                                },
                                className: "text-gray-500 hover:text-gray-700"
                            },
                                React.createElement(X, { className: "w-6 h-6" })
                            )
                        )
                    ),

                    React.createElement('div', { className: "space-y-4 mb-6 max-h-96 overflow-y-auto" },
                        setupConversation.map((message, index) =>
                            React.createElement('div', {
                                key: index,
                                className: `p-4 rounded-lg ${message.role === 'user'
                                    ? 'bg-blue-50 border-l-4 border-blue-400'
                                    : 'bg-gray-50 border-l-4 border-gray-400'
                                }`
                            },
                                React.createElement('div', { className: "font-semibold text-sm mb-2 text-gray-600" },
                                    message.role === 'user' ? t('you') : t('assistant')
                                ),
                                React.createElement('div', { className: "text-gray-800" }, message.content)
                            )
                        )
                    ),

                    React.createElement('div', { className: "flex space-x-4" },
                        React.createElement('input', {
                            type: "text",
                            value: currentMessage,
                            onChange: (e) => {
                                setCurrentMessage(e.target.value);
                                logEvent('setup_typing', { messageLength: e.target.value.length });
                            },
                            onKeyPress: (e) => {
                                if (e.key === 'Enter' && !isLoading) {
                                    logEvent('setup_enter_pressed');
                                    continueSetup();
                                }
                            },
                            placeholder: t('typeResponse'),
                            className: "flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent",
                            disabled: isLoading
                        }),
                        React.createElement('button', {
                            onClick: continueSetup,
                            disabled: isLoading || !currentMessage.trim(),
                            className: "bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                        },
                            isLoading 
                                ? React.createElement(Loader, { className: "w-5 h-5 animate-spin" })
                                : React.createElement(MessageCircle, { className: "w-5 h-5" }),
                            React.createElement('span', null, t('send'))
                        )
                    ),

                    setupComplete && React.createElement('div', { className: "mt-6 p-4 bg-green-50 border border-green-200 rounded-lg" },
                        React.createElement('div', { className: "flex items-center space-x-2 mb-2" },
                            React.createElement(Check, { className: "w-5 h-5 text-green-600" }),
                            React.createElement('span', { className: "font-semibold text-green-800" }, t('setupComplete'))
                        ),
                        React.createElement('p', { className: "text-green-700 mb-3" }, t('passwordEstablished')),
                        React.createElement('button', {
                            onClick: startAbstractVerification,
                            className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        }, t('testVerification'))
                    )
                )
            )
        );
    }

    // Abstract verification mode
    if (mode === 'abstract') {
        return React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6" },
            React.createElement('div', { className: "max-w-4xl mx-auto" },
                React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                    React.createElement('div', { className: "flex items-center justify-between mb-6" },
                        React.createElement('h1', { className: "text-3xl font-bold text-gray-800" }, t('abstractStoryVerification')),
                        React.createElement('div', { className: "flex items-center space-x-4" },
                            startTime && React.createElement('div', { className: "flex items-center space-x-2 text-gray-600" },
                                React.createElement(Clock, { className: "w-4 h-4" }),
                                React.createElement('span', { className: "text-sm" }, formatTime(Date.now() - startTime))
                            ),
                            React.createElement('button', {
                                onClick: () => {
                                    logEvent('session_abandoned', { phase: 'abstract' });
                                    resetSystem();
                                    setMode('consent');
                                },
                                className: "text-gray-500 hover:text-gray-700"
                            },
                                React.createElement(X, { className: "w-6 h-6" })
                            )
                        )
                    ),

                    React.createElement('div', { className: "mb-6" },
                        testMode === 'verbose' && React.createElement('div', { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6" },
                            React.createElement('div', { className: "flex items-center space-x-2 mb-2" },
                                React.createElement(MessageCircle, { className: "w-5 h-5 text-blue-600" }),
                                React.createElement('span', { className: "font-semibold text-blue-800" }, t('naturalMemoryCheck'))
                            ),
                            React.createElement('p', { className: "text-blue-700 mb-2" }, t('naturalMemoryDesc')),
                            React.createElement('p', { className: "text-blue-600 text-sm" }, t('focusMainPlot'))
                        ),

                        React.createElement('textarea', {
                            value: abstractSummary,
                            onChange: (e) => {
                                setAbstractSummary(e.target.value);
                                logEvent('abstract_typing', { summaryLength: e.target.value.length });
                            },
                            placeholder: t('brieflyDescribe'),
                            className: "w-full h-24 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
                            disabled: isLoading
                        })
                    ),

                    React.createElement('button', {
                        onClick: verifyAbstractSummary,
                        disabled: isLoading || !abstractSummary.trim(),
                        className: "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 mb-6"
                    },
                        isLoading 
                            ? React.createElement(Loader, { className: "w-5 h-5 animate-spin" })
                            : React.createElement(MessageCircle, { className: "w-5 h-5" }),
                        React.createElement('span', null, t('verifyStoryEssence'))
                    ),

                    abstractResult && React.createElement('div', { className: "bg-gray-50 rounded-lg p-6" },
                        testMode === 'verbose' ? [
                            React.createElement('h3', { key: 'title', className: "text-xl font-semibold text-gray-800 mb-4" }, t('abstractVerificationResults')),
                            
                            React.createElement('div', { key: 'metrics', className: "grid md:grid-cols-2 gap-6 mb-6" },
                                React.createElement('div', { className: "bg-white p-4 rounded-lg" },
                                    React.createElement('div', { className: "flex items-center space-x-3 mb-3" },
                                        getConfidenceIcon(abstractResult.confidence),
                                        React.createElement('h4', { className: "font-semibold text-gray-800" }, t('recognitionConfidence'))
                                    ),
                                    React.createElement('div', { className: `text-3xl font-bold ${getConfidenceColor(abstractResult.confidence)}` },
                                        abstractResult.confidence, "%"
                                    )
                                ),
                                React.createElement('div', { className: "bg-white p-4 rounded-lg" },
                                    React.createElement('h4', { className: "font-semibold text-gray-800 mb-3" }, t('storyRecognition')),
                                    React.createElement('div', { className: `text-lg font-semibold ${abstractResult.abstract_match ? 'text-green-600' : 'text-red-600'}` },
                                        abstractResult.abstract_match ? t('storyRecognized') : t('storyNotRecognized')
                                    )
                                )
                            ),

                            React.createElement('div', { key: 'elements', className: "space-y-4 mb-6" },
                                React.createElement('div', { className: "bg-white p-4 rounded-lg" },
                                    React.createElement('h4', { className: "font-semibold text-gray-800 mb-3" }, t('coreElementsRecognized')),
                                    React.createElement('div', { className: "flex flex-wrap gap-2" },
                                        abstractResult.core_elements_recognized.map((element, index) =>
                                            React.createElement('span', {
                                                key: index,
                                                className: "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                                            }, element)
                                        )
                                    )
                                ),
                                abstractResult.missing_core_elements && abstractResult.missing_core_elements.length > 0 &&
                                React.createElement('div', { className: "bg-white p-4 rounded-lg" },
                                    React.createElement('h4', { className: "font-semibold text-gray-800 mb-3" }, t('missingCoreElements')),
                                    React.createElement('div', { className: "flex flex-wrap gap-2" },
                                        abstractResult.missing_core_elements.map((element, index) =>
                                            React.createElement('span', {
                                                key: index,
                                                className: "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                                            }, element)
                                        )
                                    )
                                ),
                                React.createElement('div', { className: "bg-white p-4 rounded-lg" },
                                    React.createElement('h4', { className: "font-semibold text-gray-800 mb-3" }, t('explanation')),
                                    React.createElement('p', { className: "text-gray-700" }, abstractResult.explanation)
                                )
                            )
                        ] : [
                            // Silent mode - minimal feedback
                            React.createElement('div', { key: 'silent', className: "text-center py-8" },
                                isLoading ? React.createElement('div', { className: "flex items-center justify-center space-x-2" },
                                    React.createElement(Loader, { className: "w-6 h-6 animate-spin text-blue-600" }),
                                    React.createElement('span', { className: "text-gray-600" }, t('processing'))
                                ) : React.createElement('div', { className: "text-lg font-semibold text-gray-800" },
                                    getSilentMessage(getFinalVerificationStatus())
                                )
                            )
                        ],

                        // Continue to secondary verification if needed
                        testMode === 'verbose' && abstractResult.requires_detailed_verification && abstractResult.abstract_match && 
                        React.createElement('div', { key: 'secondary-prompt', className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4" },
                            React.createElement('div', { className: "flex items-center space-x-2 mb-2" },
                                React.createElement(HelpCircle, { className: "w-5 h-5 text-yellow-600" }),
                                React.createElement('span', { className: "font-semibold text-yellow-800" }, t('detailedVerificationRequired'))
                            ),
                            React.createElement('p', { className: "text-yellow-700 mb-3" }, t('summaryShowsRecognition')),
                            secondaryQuestions.length > 0 && React.createElement('button', {
                                onClick: () => setMode('secondary'),
                                className: "bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            }, t('continueToDetailedQuestions'))
                        ),

                        // Silent mode - auto continue to secondary
                        testMode === 'silent' && abstractResult.requires_detailed_verification && abstractResult.abstract_match && secondaryQuestions.length > 0 &&
                        React.createElement('button', {
                            key: 'silent-continue',
                            onClick: () => setMode('secondary'),
                            className: "w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors duration-200"
                        }, t('continue')),

                        // Final result for high confidence cases
                        testMode === 'verbose' && !abstractResult.requires_detailed_verification &&
                        React.createElement('div', {
                            key: 'final-result',
                            className: `p-4 rounded-lg ${getFinalVerificationStatus() ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`
                        },
                            React.createElement('div', { className: "flex items-center space-x-2 mb-2" },
                                getFinalVerificationStatus() 
                                    ? React.createElement(Check, { className: "w-5 h-5 text-green-600" })
                                    : React.createElement(X, { className: "w-5 h-5 text-red-600" }),
                                React.createElement('span', { className: `font-semibold ${getFinalVerificationStatus() ? 'text-green-800' : 'text-red-800'}` },
                                    getFinalVerificationStatus() ? t('accessGrantedMsg') : t('accessDeniedMsg')
                                )
                            ),
                            React.createElement('p', { className: getFinalVerificationStatus() ? 'text-green-700' : 'text-red-700' },
                                getFinalVerificationStatus() ? t('summaryPerfectMatch') : t('summaryNoMatch')
                            )
                        ),

                        // Action buttons for verbose mode
                        testMode === 'verbose' && React.createElement('div', { key: 'actions', className: "mt-6 flex space-x-4" },
                            React.createElement('button', {
                                onClick: () => {
                                    logEvent('abstract_retry');
                                    setAbstractSummary('');
                                    setAbstractResult(null);
                                    setSecondaryQuestions([]);
                                    setSecondaryAnswers({});
                                    setSecondaryResult(null);
                                },
                                className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            }, t('tryDifferentSummary')),
                            React.createElement('button', {
                                onClick: completeSession,
                                className: "bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            }, t('newTest'))
                        )
                    )
                )
            )
        );
    }

    // Secondary verification mode
    if (mode === 'secondary') {
        return React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6" },
            React.createElement('div', { className: "max-w-4xl mx-auto" },
                React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-6" },
                    React.createElement('div', { className: "flex items-center justify-between mb-6" },
                        React.createElement('h1', { className: "text-3xl font-bold text-gray-800" }, t('elementVerification')),
                        React.createElement('div', { className: "flex items-center space-x-4" },
                            startTime && React.createElement('div', { className: "flex items-center space-x-2 text-gray-600" },
                                React.createElement(Clock, { className: "w-4 h-4" }),
                                React.createElement('span', { className: "text-sm" }, formatTime(Date.now() - startTime))
                            ),
                            React.createElement('button', {
                                onClick: () => {
                                    logEvent('session_abandoned', { phase: 'secondary' });
                                    resetSystem();
                                    setMode('consent');
                                },
                                className: "text-gray-500 hover:text-gray-700"
                            },
                                React.createElement(X, { className: "w-6 h-6" })
                            )
                        )
                    ),

                    React.createElement('div', { className: "mb-6" },
                        testMode === 'verbose' && React.createElement('div', { className: "bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6" },
                            React.createElement('div', { className: "flex items-center space-x-2 mb-2" },
                                React.createElement(HelpCircle, { className: "w-5 h-5 text-orange-600" }),
                                React.createElement('span', { className: "font-semibold text-orange-800" }, t('instructions'))
                            ),
                            React.createElement('p', { className: "text-orange-700 mb-2" }, t('elementInstructions')),
                            React.createElement('p', { className: "text-orange-600 text-sm" }, t('questionTypes'))
                        ),

                        React.createElement('div', { className: "space-y-6" },
                            secondaryQuestions.map((question, index) =>
                                React.createElement('div', { key: question.id, className: "bg-gray-50 rounded-lg p-6" },
                                    React.createElement('div', { className: "flex items-center justify-between mb-3" },
                                        React.createElement('h3', { className: "text-lg font-semibold text-gray-800" },
                                            t('question'), " ", index + 1, ": ", question.question
                                        ),
                                        testMode === 'verbose' && question.question_type &&
                                        React.createElement('span', { className: "bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium" },
                                            question.question_type
                                        )
                                    ),
                                    
                                    React.createElement('div', { className: "space-y-3" },
                                        Object.entries(question.options).map(([optionKey, optionText]) =>
                                            React.createElement('label', {
                                                key: optionKey,
                                                className: "flex items-start space-x-3 cursor-pointer"
                                            },
                                                React.createElement('input', {
                                                    type: "checkbox",
                                                    checked: secondaryAnswers[question.id]?.[optionKey] || false,
                                                    onChange: (e) => handleSecondaryAnswer(question.id, optionKey, e.target.checked),
                                                    className: "mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                                }),
                                                React.createElement('span', { className: "text-gray-700" },
                                                    React.createElement('strong', null, optionKey, ": "),
                                                    optionText
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    ),

                    React.createElement('button', {
                        onClick: submitSecondaryVerification,
                        disabled: isLoading,
                        className: "bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2 mb-6"
                    },
                        isLoading 
                            ? React.createElement(Loader, { className: "w-5 h-5 animate-spin" })
                            : React.createElement(Check, { className: "w-5 h-5" }),
                        React.createElement('span', null, t('submitVerification'))
                    ),

                    secondaryResult && React.createElement('div', { className: "bg-gray-50 rounded-lg p-6" },
                        testMode === 'verbose' ? [
                            React.createElement('h3', { key: 'title', className: "text-xl font-semibold text-gray-800 mb-4" }, t('elementVerificationResults')),
                            
                            React.createElement('div', { key: 'metrics', className: "grid md:grid-cols-4 gap-4 mb-6" },
                                React.createElement('div', { className: "bg-white p-4 rounded-lg" },
                                    React.createElement('h4', { className: "font-semibold text-gray-800 mb-3" }, t('score')),
                                    React.createElement('div', { className: `text-3xl font-bold ${getConfidenceColor(secondaryResult.score)}` },
                                        secondaryResult.score.toFixed(0), "%"
                                    )
                                ),
                                React.createElement('div', { className: "bg-white p-4 rounded-lg" },
                                    React.createElement('h4', { className: "font-semibold text-gray-800 mb-3" }, t('correctAnswers')),
                                    React.createElement('div', { className: "text-2xl font-bold text-gray-800" },
                                        secondaryResult.correct, " / ", secondaryResult.total
                                    )
                                ),
                                React.createElement('div', { className: "bg-white p-4 rounded-lg" },
                                    React.createElement('h4', { className: "font-semibold text-gray-800 mb-3" }, t('status')),
                                    React.createElement('div', { className: `text-lg font-semibold ${secondaryResult.success ? 'text-green-600' : 'text-red-600'}` },
                                        secondaryResult.success ? t('passed') : t('failed')
                                    )
                                ),
                                React.createElement('div', { className: "bg-white p-4 rounded-lg" },
                                    React.createElement('h4', { className: "font-semibold text-gray-800 mb-3" }, t('securityStrength')),
                                    React.createElement('div', { className: "text-lg font-bold text-indigo-600" },
                                        secondaryQuestions.reduce((acc, q) => acc * Math.pow(2, q.correct_answers.length), 1), " ", t('combinations')
                                    ),
                                    React.createElement('div', { className: "text-xs text-gray-500" }, t('combinatorialSpace'))
                                )
                            ),

                            React.createElement('div', { key: 'detailed-results', className: "space-y-4 mb-6" },
                                secondaryResult.results.map((result, index) => {
                                    const question = secondaryQuestions.find(q => q.id === result.questionId);
                                    return React.createElement('div', {
                                        key: result.questionId,
                                        className: `p-4 rounded-lg ${result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`
                                    },
                                        React.createElement('div', { className: "flex items-start space-x-3 mb-2" },
                                            result.isCorrect 
                                                ? React.createElement(Check, { className: "w-5 h-5 text-green-600 mt-1" })
                                                : React.createElement(X, { className: "w-5 h-5 text-red-600 mt-1" }),
                                            React.createElement('div', { className: "flex-1" },
                                                React.createElement('div', { className: "flex items-center justify-between mb-1" },
                                                    React.createElement('h5', { className: `font-semibold ${result.isCorrect ? 'text-green-800' : 'text-red-800'}` },
                                                        t('question'), " ", index + 1, ": ", result.isCorrect ? t('correct') : t('incorrect')
                                                    ),
                                                    question?.question_type && React.createElement('span', { className: "bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs" },
                                                        question.question_type
                                                    )
                                                ),
                                                React.createElement('p', { className: "text-gray-700 text-sm mb-2" }, result.question),
                                                React.createElement('div', { className: "text-sm" },
                                                    React.createElement('span', { className: "text-gray-600" }, t('yourAnswers'), ": "),
                                                    React.createElement('span', { className: result.isCorrect ? 'text-green-700' : 'text-red-700' },
                                                        result.userAnswers.length > 0 ? result.userAnswers.join(', ') : t('noneSelected')
                                                    )
                                                ),
                                                React.createElement('div', { className: "text-sm" },
                                                    React.createElement('span', { className: "text-gray-600" }, t('correctAnswersLabel'), ": "),
                                                    React.createElement('span', { className: "text-green-700" }, result.correctAnswers.join(', '))
                                                ),
                                                question?.explanation && React.createElement('div', { className: "text-sm mt-1" },
                                                    React.createElement('span', { className: "text-gray-600" }, t('explanation'), ": "),
                                                    React.createElement('span', { className: "text-gray-700" }, question.explanation)
                                                )
                                            )
                                        )
                                    );
                                })
                            )
                        ] : [
                            // Silent mode - minimal feedback
                            React.createElement('div', { key: 'silent', className: "text-center py-8" },
                                React.createElement('div', { className: "text-lg font-semibold text-gray-800" },
                                    getSilentMessage(getFinalVerificationStatus())
                                )
                            )
                        ],

                        // Final result
                        React.createElement('div', {
                            key: 'final-result',
                            className: `p-4 rounded-lg ${getFinalVerificationStatus() ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`
                        },
                            React.createElement('div', { className: "flex items-center space-x-2 mb-2" },
                                getFinalVerificationStatus() 
                                    ? React.createElement(Check, { className: "w-5 h-5 text-green-600" })
                                    : React.createElement(X, { className: "w-5 h-5 text-red-600" }),
                                React.createElement('span', { className: `font-semibold ${getFinalVerificationStatus() ? 'text-green-800' : 'text-red-800'}` },
                                    t('finalResult'), ": ", getFinalVerificationStatus() ? t('accessGrantedMsg') : t('accessDeniedMsg')
                                )
                            ),
                            testMode === 'verbose' && React.createElement('p', { className: getFinalVerificationStatus() ? 'text-green-700' : 'text-red-700' },
                                getFinalVerificationStatus() 
                                    ? t('bothVerificationsPassed')
                                    : secondaryResult.success 
                                        ? t('elementPassedSemanticFailed')
                                        : t('mustAnswerAllCorrect')
                            )
                        ),

                        // Action buttons for verbose mode
                        testMode === 'verbose' && React.createElement('div', { key: 'actions', className: "mt-6 flex space-x-4" },
                            React.createElement('button', {
                                onClick: () => {
                                    logEvent('secondary_retry');
                                    setSecondaryAnswers({});
                                    setSecondaryResult(null);
                                },
                                className: "bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            }, t('retryQuestions')),
                            React.createElement('button', {
                                onClick: () => setMode('abstract'),
                                className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            }, t('backToMainVerification')),
                            React.createElement('button', {
                                onClick: completeSession,
                                className: "bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            }, t('newTest'))
                        ),

                        // Silent mode completion
                        testMode === 'silent' && React.createElement('div', { key: 'silent-complete', className: "mt-6 text-center" },
                            React.createElement('button', {
                                onClick: completeSession,
                                className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                            }, t('newSession'))
                        )
                    )
                )
            )
        );
    }

    // Fallback
    return React.createElement('div', { className: "min-h-screen bg-gray-100 p-6" },
        React.createElement('div', { className: "max-w-4xl mx-auto" },
            React.createElement('div', { className: "bg-white rounded-xl shadow-lg p-8 text-center" },
                React.createElement('h2', { className: "text-2xl font-bold mb-4" }, "Research Platform Active"),
                React.createElement('p', { className: "text-gray-600 mb-6" }, `Current mode: ${mode}`),
                React.createElement('div', { className: "space-y-4" },
                    React.createElement('button', {
                        onClick: () => setMode('consent'),
                        className: "bg-indigo-600 text-white px-6 py-2 rounded-lg mr-4"
                    }, "Reset to Consent"),
                    React.createElement('button', {
                        onClick: downloadResearchData,
                        className: "bg-green-600 text-white px-6 py-2 rounded-lg"
                    }, "Download Research Data"),
                    React.createElement('button', {
                        onClick: completeSession,
                        className: "bg-blue-600 text-white px-6 py-2 rounded-lg ml-4"
                    }, "Complete Session")
                )
            )
        )
    );
};

// Render the component
ReactDOM.render(React.createElement(SemanticPasswordResearchPlatform), document.getElementById('root'));