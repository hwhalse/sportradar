import { IGameScores, IGameStats, IPlayer, ITeam } from "../types/resolverTypes"
import { QueryControllers } from "../controllers/queryControllers"

export const resolvers = {
    Query: {
        getGameStatsByGameID: async (parent: IGameStats, args: any, context: any): Promise<void | IGameStats[]> => {
            return QueryControllers.findStatsByGame(args)
        },
        getGameStatsByPlayerID: async (parent: IGameStats, args: any, context: any): Promise<void | IGameStats[]> => {
            return QueryControllers.findGameStatsByPlayerID(args)
        },
        getPlayerStatsByID: async (parent: IGameStats, args: any, context: any): Promise<void | IGameStats[]> => {
            return QueryControllers.findPlayerStatsByID(args)
        },
        getPlayerStatsByName: async (parent: IGameStats, args: any, context: any): Promise<void | IGameStats[]> => {
            return QueryControllers.findPlayerStatsByName(args)
        },
        getPlayerByID: async (parent: IPlayer, args: any, context: any): Promise<void | IPlayer> => {
            return QueryControllers.findPlayerByID(args)
        },
        getPlayerByName: async (parent: IPlayer, args: any, context: any): Promise<void | IPlayer> => {
            return QueryControllers.findPlayerByName(args)
        },
        getTeamByID: async (parent: ITeam, args: any, context: any): Promise<void | ITeam> => {
            return QueryControllers.findTeamById(args)
        },
        getTeamByName: async (parent: ITeam, args: any, context: any): Promise<void | ITeam> => {
            return QueryControllers.findTeamByName(args)
        },
        getScores: async (parent: IGameScores, args: any, context: any): Promise<void | IGameScores> => {
            return QueryControllers.findScoreByGameID(args)
        },
        getAllGames: async (parent: IGameScores, args: any, context: any): Promise<void | IGameScores[]> => {
            return QueryControllers.findAllGames(args)
        },
    }
}