import { IGameStats } from "../resolvers/resolverTypes";
import { pool } from "../server";

export const QueryControllers = {
    findByGame: async (gameID: string): Promise<void | IGameStats[]> => {
        const queryString = `SELECT g.*, p.name, p.position, p.number, p.age, p.team_id, t.name 
        FROM game_stats g 
        INNER JOIN players p 
        ON p.id = g.player_id 
        INNER JOIN teams t 
        ON p.team_id = t.id
        WHERE g.game_id = $1`;
        const values = [gameID]
        try {
            const data = await pool.query(queryString, values)
            return data.rows
        } catch(err) {
            console.log(err)
        }
    },
    findByPlayer: async (playerID: string): Promise<void | IGameStats[]> => {
        const queryString = `SELECT g.*, p.name, p.position, p.number, p.age, p.team_id, t.name 
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
    }
}