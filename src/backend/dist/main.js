import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { TrpcService } from "./trpc/trpc.service.js";
import { MissionRouter } from "./modules/mission/mission.router.js";
import * as expressAdapter from "@trpc/server/adapters/express";
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(helmet());
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    });
    const trpcService = app.get(TrpcService);
    const missionRouter = app.get(MissionRouter);
    const appRouter = trpcService.router({
        health: trpcService.procedure.query(() => ({
            status: "Server is running",
            timestamp: new Date().toISOString(),
            framework: "NestJS + tRPC",
            version: "2.0.0",
        })),
        missions: missionRouter.getRouter(),
    });
    app.use("/trpc", expressAdapter.createExpressMiddleware({
        router: appRouter,
        createContext: trpcService.createContext,
    }));
    const config = new DocumentBuilder()
        .setTitle("Starship Commander API")
        .setDescription("AI-friendly backend API for Starship Commander Habits using NestJS + tRPC")
        .setVersion("2.0.0")
        .addTag("tRPC")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Starship Commander Backend (NestJS + tRPC) running on port ${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    console.log(`🔗 tRPC Endpoint: http://localhost:${port}/trpc`);
}
bootstrap();
//# sourceMappingURL=main.js.map