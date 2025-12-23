import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./database/prisma.service.js";
import { MissionService } from "./services/mission.service.js";
import { TrpcService } from "./trpc/trpc.service.js";
import { MissionRouter } from "./modules/mission/mission.router.js";
import {
  HealthController,
  ApiController,
} from "./controllers/health.controller.js";
import {
  MissionController,
  HistoryController,
} from "./controllers/mission.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
  ],
  controllers: [
    HealthController,
    ApiController,
    MissionController,
    HistoryController,
  ],
  providers: [PrismaService, MissionService, TrpcService, MissionRouter],
  exports: [PrismaService, MissionService, TrpcService, MissionRouter],
})
export class AppModule {}
