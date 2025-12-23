import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { TrpcService } from "./trpc/trpc.service";
import { MissionRouter } from "./modules/mission/mission.router";
import * as expressAdapter from "@trpc/server/adapters/express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  // Get tRPC service and mission router
  const trpcService = app.get(TrpcService);
  const missionRouter = app.get(MissionRouter);

  // Create tRPC router
  const appRouter = trpcService.router({
    health: trpcService.procedure.query(() => ({
      status: "Server is running",
      timestamp: new Date().toISOString(),
      framework: "NestJS + tRPC",
      version: "2.0.0",
    })),
    missions: missionRouter.getRouter(),
  });

  // Mount tRPC middleware
  app.use(
    "/trpc",
    expressAdapter.createExpressMiddleware({
      router: appRouter,
      createContext: trpcService.createContext,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Starship Commander API")
    .setDescription(
      "AI-friendly backend API for Starship Commander Habits using NestJS + tRPC",
    )
    .setVersion("2.0.0")
    .addTag("tRPC")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(
    `🚀 Starship Commander Backend (NestJS + tRPC) running on port ${port}`,
  );
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🔗 tRPC Endpoint: http://localhost:${port}/trpc`);
}

bootstrap();
