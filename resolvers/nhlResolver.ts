import { IGameStats } from "./resolverTypes"

export const resolvers = {
    Query: {
        getGameStats: async (parent: IGameStats, args: any, context: any): Promise<void | IGameStats[]> => {
            
        }
    }
}