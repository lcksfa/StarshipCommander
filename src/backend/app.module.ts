import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * 临时 AppModule - 用于类型检查通过
 * TODO: 完整实现将在任务 3 中完成
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
