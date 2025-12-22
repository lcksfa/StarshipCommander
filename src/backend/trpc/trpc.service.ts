import { Injectable } from '@nestjs/common';
import { initTRPC } from '@trpc/server';

/**
 * 临时 TrpcService - 用于类型检查通过
 * TODO: 完整实现将在任务 3 中完成
 */
@Injectable()
export class TrpcService {
  private t = initTRPC.create();

  router = this.t.router;
  procedure = this.t.procedure;

  createContext = () => ({});
}
