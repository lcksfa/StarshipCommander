export declare class MissionRouter {
    private t;
    getRouter(): import("@trpc/server").TRPCBuiltRouter<{
        ctx: object;
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
        transformer: false;
    }, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
        getMissions: import("@trpc/server").TRPCQueryProcedure<{
            input: void;
            output: never[];
            meta: object;
        }>;
        completeMission: import("@trpc/server").TRPCMutationProcedure<{
            input: void;
            output: {};
            meta: object;
        }>;
        createMission: import("@trpc/server").TRPCMutationProcedure<{
            input: void;
            output: {};
            meta: object;
        }>;
    }>>;
}
//# sourceMappingURL=mission.router.d.ts.map