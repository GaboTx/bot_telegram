from telegram import Bot
import time
import asyncio

# Pega aquí tu token del BotFather
TOKEN = '7870807238:AAF3iGTIqe2_iM0vuq_IB0j3C95LQ7S7k-M'
CHAT_ID = -4677324347  # ID del chat al que enviarás la alarma

# Función que simula la detección de alarmas
def detectar_alarma():
    # Esta es una función simulada. Aquí deberías tener tu código de detección real.
    # Simularemos que detecta una alarma cada 10 segundos
    return "¡ALERTA! Máquina X ha fallado. Código de error: 101."

# Función para enviar mensajes al bot de Telegram
async def enviar_alarma_a_telegram(alarma: str):
    bot = Bot(TOKEN)
    # Enviar la alarma al chat específico
    await bot.send_message(chat_id=CHAT_ID, text=alarma)

# Función principal que monitorea las alarmas y las envía al bot
def monitorear_alarmas():
    while True:
        # Detecta si hay una alarma
        alarma = detectar_alarma()
        
        # Imprime la alarma en consola
        print(f"Alarma detectada: {alarma}")
        
        # Envía la alarma por el bot
        asyncio.run(enviar_alarma_a_telegram(alarma))
        
        # Simula un intervalo de tiempo antes de la siguiente detección (por ejemplo, 10 segundos)
        time.sleep(10)

if __name__ == '__main__':
    # Inicia el monitoreo de las alarmas
    monitorear_alarmas()
