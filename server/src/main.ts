import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TODO: Configurar CORS
  app.enableCors({
    origin: '*', // Em produção, mude para o seu domínio
  });

  await app.listen(process.env.PORT || 3000);
}

// CORREÇÃO 1: Adicionado o operador 'void'
void bootstrap();

// CORREÇÃO 2: Garantida uma linha em branco no final
