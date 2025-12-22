export declare class TrpcService {
    private t;
    router: import("@trpc/server").TRPCRouterBuilder<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }>;
    procedure: import("@trpc/server").TRPCProcedureBuilder<object, object, object, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
    createContext: () => {};
}
//# sourceMappingURL=trpc.service.d.ts.map