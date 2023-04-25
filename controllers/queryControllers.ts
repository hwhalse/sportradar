import { IGameScores, IGameStats, IPlayer, ITeam } from "../resolvers/resolverTypes";
import { pool } from "../server";

export const QueryControllers = {
    findStatsByGame: async (args: {game_id: string}): Promise<void | IGameStats[]> => {
        const gameID = Number(args.game_id)
        console.log(gameID)
        const queryString = `
        SELECT stats.*, p.name as player_name, p.position as player_position, p.number as player_number, p.age as player_age, p.team_id, t.name as team_name 
        FROM game_stats stats 
        INNER JOIN players p 
        ON p.id = stats.player_id 
        INNER JOIN teams t 
        ON p.team_id = t.id
        WHERE stats.game_id = $1`;
        const values = [gameID];
        try {
            const data = await pool.query(queryString, values)
            console.log(data)
            return data.rows
        } catch(err) {
            console.log(err)
        }
    },
    findStatsByPlayer: async (args: {player_id: string}): Promise<void | IGameStats[]> => {
        const playerID = Number(args.player_id)
        const queryString = `
        SELECT g.*, p.name, p.position, p.number, p.age, p.team_id, t.name 
        FROM game_stats g 
        INNER JOIN players p 
        ON p.id = g.player_id 
        INNER JOIN teams t 
        ON p.team_id = t.id
        WHERE g.player_id = $1`;
        const values = [playerID];
        try {
            const data = await pool.query(queryString, values);
            return data.rows
        } catch(err) {
            console.log(err)
        }
    },
    findPlayerByID: async (args: {player_id: string}): Promise<void | IPlayer> => {
        const playerID = Number(args.player_id)
        const queryString = `SELECT * FROM players WHERE id = $1`;
        const values = [playerID];
        try {
            const data = await pool.query(queryString, values);
            console.log(data.rows[0])
            return data.rows[0]
        } catch(err) {
            console.log(err)
        }
    },
    findPlayerByName: async (args: {player_name: string}): Promise<void | IPlayer> => {
        const playerName = args.player_name;
        const queryString = `SELECT * FROM players WHERE name = $1`;
        const values = [playerName];
        try {
            const data = await pool.query(queryString, values);
            return data.rows[0]
        } catch(err) {
            console.log(err)
        }
    },
    findTeamById: async (args: {team_id: string}): Promise<void | ITeam> => {
        const teamID = Number(args.team_id);
        const queryString = `SELECT * FROM teams WHERE id = $1`;
        const values = [teamID];
        try {
            const data = await pool.query(queryString, values);
            return data.rows[0]
        } catch(err) {
            console.log(err)
        }
    },
    findTeamByName: async (args: {team_name: string}): Promise<void | ITeam> => {
        const teamName = args.team_name;
        const queryString = `SELECT * FROM teams WHERE name = $1`;
        const values = [teamName];
        try {
            const data = await pool.query(queryString, values);
            return data.rows[0]
        } catch(err) {
            console.log(err)
        }
    },
    findScoreByGameID: async (args: {game_id: string}): Promise<void | IGameScores> => {
        const gameID = Number(args.game_id);
        const queryString = `SELECT * FROM game_scores WHERE game_id = $1`;
        const values = [gameID];
        try {
            const data = await pool.query(queryString, values);
            return data.rows[0]
        } catch(err) {
            console.log(err)
        }
    },
}