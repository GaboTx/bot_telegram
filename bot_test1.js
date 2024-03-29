const TelegramBot = require('node-telegram-bot-api');



// Reemplaza 'TOKEN' con tu token de bot proporcionado por BotFather
const token = '7066085332:AAFLWoAfIUiUpH8DKtnqUZUGL0861r0msUs';
// Crea una nueva instancia del bot
const bot = new TelegramBot(token, { polling: true });

// Objeto para almacenar la información del ticket
const ticketInfo = {
    linea: '',
    lado: '',
    estacion: '',
    issue: '',
    responsable: '',
    timestamp: ''
};

// Preguntas y respuestas posibles para cada campo
const preguntas = [
    {
        pregunta: '¿Qué línea está caída?',
        opciones: [
            'D31', 'D21', 'D11', 'C41', 'C31', 'C21', 'C11', 'B61', 'B51', 'G21', 'A11'
        ]
    },
    {
        pregunta: '¿Qué lado?',
        opciones: ['S Side', 'C Side']
    },
    {
        pregunta: '¿Qué estación?',
        opciones: ['Montadora', 'Solder Printer']
    },
    {
        pregunta: '¿Qué issue?',
        opciones: ['Shifted', 'Tombstone', 'Missing', 'Billboard', 'Otro']
    },
    {
        pregunta: '¿Quién es el responsable del grupo?',
        opciones: ['Seleccionar de la lista']
    }
];

let currentStep = 0; // Paso actual de las preguntas

// Manejar comandos para iniciar el bot con opciones desplegables
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '¡Hola! Soy un bot de seguimiento de tickets. ¿En qué puedo ayudarte?', {
        reply_markup: {
            keyboard: [
                ['/levantar_ticket']
            ],
            resize_keyboard: true
        }
    });
});

// Manejar comando para levantar ticket
bot.onText(/\/levantar/, (msg) => {
    const chatId = msg.chat.id;
    currentStep = 0;
    askQuestion(chatId);
});

// Manejar respuestas del usuario
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const respuesta = msg.text;

    // Verificar si la respuesta es válida
    const opcionSeleccionada = preguntas[currentStep].opciones.find(opcion => opcion === respuesta);
    if (opcionSeleccionada || preguntas[currentStep].pregunta === '¿Qué issue?') {
        // Guardar la respuesta en el objeto ticketInfo
        const campo = preguntas[currentStep].pregunta.split(':')[0].trim();
        if (campo === '¿Qué issue?' && respuesta.toLowerCase() === 'otro') {
            currentStep++;
            askForIssueDescription(chatId);
            return;
        } else if (campo === '¿Quién es el responsable del grupo?' && respuesta.toLowerCase() === 'seleccionar de la lista') {
            currentStep++;
            await askForResponsableFromList(chatId);
            return;
        } else {
            ticketInfo[campo] = respuesta;
        }

        currentStep++;

        // Si se ha completado el cuestionario, imprimir la información del ticket
        if (currentStep >= preguntas.length) {
            ticketInfo.timestamp = new Date().toLocaleString();
            printTicket(chatId);
        } else {
            askQuestion(chatId);
        }
    } else {
        bot.sendMessage(chatId, 'Por favor, selecciona una opción válida.', {
            reply_markup: {
                keyboard: preguntas[currentStep].opciones.map(opcion => [opcion]),
                one_time_keyboard: true
            }
        });
    }
});

// Función para hacer preguntas al usuario
function askQuestion(chatId) {
    const pregunta = preguntas[currentStep].pregunta;
    const opciones = preguntas[currentStep].opciones;

    bot.sendMessage(chatId, pregunta, {
        reply_markup: {
            keyboard: opciones.map(opcion => [opcion]),
            one_time_keyboard: true
        }
    });
}

// Función para pedir una descripción del issue en caso de que el usuario seleccione 'Otro'
function askForIssueDescription(chatId) {
    bot.sendMessage(chatId, 'Por favor, describe el issue:', {
        reply_markup: {
            remove_keyboard: true
        }
    });
}

// Función para solicitar al usuario que seleccione un responsable de la lista de miembros del grupo
async function askForResponsableFromList(chatId) {
    try {
        const members = await bot.getChatMembers(chatId);
        const options = members.map(member => member.user.username);
        preguntas[4].opciones = options;
        bot.sendMessage(chatId, 'Por favor, selecciona al responsable del grupo:', {
            reply_markup: {
                keyboard: options.map(opcion => [opcion]),
                one_time_keyboard: true
            }
        });
    } catch (error) {
        console.error('Error al obtener los miembros del grupo:', error);
        bot.sendMessage(chatId, 'Lo siento, ocurrió un error al obtener los miembros del grupo. Por favor, inténtalo de nuevo más tarde.');
    }
}

// Función para imprimir la información completa del ticket
function printTicket(chatId) {
    let ticketInfoTexto = 'Información del Ticket:\n';
    for (const campo in ticketInfo) {
        ticketInfoTexto += `${campo}: ${ticketInfo[campo]}\n`;
    }
    bot.sendMessage(chatId, ticketInfoTexto);
}
