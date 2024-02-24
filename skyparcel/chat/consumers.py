from channels.generic.websocket import AsyncWebsocketConsumer
import json


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.chat_group_name = f"chat_{self.chat_id}"

        # Присоединение к группе чата
        await self.channel_layer.group_add(
            self.chat_group_name, self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Отсоединение от группы чата
        await self.channel_layer.group_discard(
            self.chat_group_name, self.channel_name
        )

    # Получение сообщения из WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Отправка сообщения в группу чата
        await self.channel_layer.group_send(
            self.chat_group_name, {"type": "chat_message", "message": message}
        )

    # Получение сообщения от группы чата
    async def chat_message(self, event):
        message = event["message"]

        # Отправка сообщения в WebSocket
        await self.send(text_data=json.dumps({"message": message}))
