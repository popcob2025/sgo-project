import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io'; // Importar!

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // Habilita o CORS para o frontend
  app.useWebSocketAdapter(new IoAdapter(app)); // Adicionar esta linha!

  await app.listen(3000);
}
bootstrap();