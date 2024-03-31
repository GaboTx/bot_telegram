const TelegramBot = require('node-telegram-bot-api');

// Reemplaza 'TOKEN' con tu token de bot proporcionado por BotFather
const token = '7066085332:AAFLWoAfIUiUpH8DKtnqUZUGL0861r0msUs';


// Crea una nueva instancia del bot
const bot = new TelegramBot(token, { polling: true });

// Objeto para almacenar la información del ticket
let ticketInfo = {};



// Preguntas y respuestas posibles para cada campo
let preguntas = [
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
        opciones: [] // Se llenará dinámicamente
    }
];

let currentStep = 0; // Paso actual de las preguntas

// Manejar comandos para iniciar el bot con opciones desplegables
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '¡Hola! Soy un bot de seguimiento de tickets. Aquí tienes algunas cosas que puedo hacer:\n- Para levantar un ticket, usa el comando /levantar_ticket.\n- Para ver las opciones de ayuda, usa el comando /ayuda.', {
        reply_markup: {
            keyboard: [
                ['/levantar_ticket']
            ],
            resize_keyboard: true
        }
    });
});

// Manejar comando para levantar ticket
bot.onText(/\/levantar_ticket/, (msg) => {
    const chatId = msg.chat.id;
    currentStep = 0;
    askQuestion(chatId);
});

// Manejar respuestas del usuario
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const respuesta = msg.text;

    // Verificar si la respuesta es válida
    const opcionSeleccionada = preguntas[currentStep].opciones.find(opcion => opcion === respuesta);
    if (opcionSeleccionada || preguntas[currentStep].pregunta === '¿Qué issue?') {
        // Guardar la respuesta en el objeto ticketInfo
        const campo = preguntas[currentStep].pregunta.split(':')[0].trim();
        if (campo === '¿Qué estación?') {
            // Definir las opciones de issue según el tipo de estación seleccionado
            preguntas[3].opciones = respuesta === 'Montadora' ?
                ['Shifted', 'Tombstone', 'Missing', 'Billboard'] :
                ['Under volume', 'Under area'];
        } else if (campo === '¿Qué issue?' && respuesta.toLowerCase() === 'otro') {
            currentStep++;
            askForIssueDescription(chatId);
            return;
        } else {
            ticketInfo[campo] = respuesta;
        }

        currentStep++;

        // Si se ha completado el cuestionario, imprimir la información del ticket
        if (currentStep >= preguntas.length) {
            ticketInfo.timestamp = new Date().toLocaleString();
            askToSendToGroup(chatId);
        } else {
            askQuestion(chatId);
        }
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

// Función para mostrar el menú para seleccionar el grupo al que enviar el ticket
function askToSendToGroup(chatId) {
    bot.sendMessage(chatId, '¿A qué grupo deseas enviar el ticket?', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Grupo 1', callback_data: 'group1' },
                    { text: 'Grupo 2', callback_data: 'group2' },
                    { text: 'Grupo 3', callback_data: 'group3' }
                ],
                [
                    { text: 'Grupo 4', callback_data: 'group4' },
                    { text: 'Grupo 5', callback_data: 'group5' },
                    { text: 'Grupo 6', callback_data: 'group6' }
                ],
                [
                    { text: 'Grupo 7', callback_data: 'group7' },
                    { text: 'Grupo 8', callback_data: 'group8' },
                    { text: 'Grupo 9', callback_data: 'group9' }
                ],
                [
                    { text: 'Grupo 10', callback_data: 'group10' },
                    { text: 'Grupo 11', callback_data: 'group11' }
                ]
            ]
        }
    });
}

// Manejar los callbacks de los botones de selección de grupo
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    // Enviar la información del ticket al grupo seleccionado
    const groupId = getGroupId(data);
    sendTicketToGroup(chatId, groupId);
});

// Función para obtener el ID del grupo seleccionado
function getGroupId(groupName) {
    // Mapear los nombres de los grupos con sus respectivos IDs
    const groupIds = {
        'group1': '-4127878520',
        'group2': '-4127878550',
        'group3': 'GROUP3_ID',
        'group4': 'GROUP4_ID',
        'group5': 'GROUP5_ID',
        'group6': 'GROUP6_ID',
        'group7': 'GROUP7_ID',
        'group8': 'GROUP8_ID',
        'group9': 'GROUP9_ID',
        'group10': 'GROUP10_ID',
        'group11': 'GROUP11_ID'
    };
    return groupIds[groupName];
}

// Función para enviar el ticket al grupo seleccionado
function sendTicketToGroup(chatId, groupId) {
    let ticketInfoTexto = 'Información del Ticket:\n';
    for (const campo in ticketInfo) {
        ticketInfoTexto += `${campo}: ${ticketInfo[campo]}\n`;
    }
    bot.sendMessage(groupId, ticketInfoTexto);
    bot.sendMessage(chatId, '¡Tu ticket ha sido enviado con éxito al grupo!');
    currentStep = 0;            
    ticketInfo = {};
    
    // Reiniciar el estado
    currentStep = 0;
    ticketInfo = {};
}
