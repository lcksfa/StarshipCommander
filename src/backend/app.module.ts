import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./database/prisma.service.js";
import { MissionService } from "./services/mission.service.js";
import { TrpcService } from "./trpc/trpc.service.js";
import { MissionRouter } from "./modules/mission/mission.router.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
  ],
  controllers: [],
  providers: [PrismaService, MissionService, TrpcService, MissionRouter],
  exports: [PrismaService, MissionService, TrpcService, MissionRouter],
})
export class AppModule {}
