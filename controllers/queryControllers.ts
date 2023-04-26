import { IGameScores, IGameStats, IPlayer, ITeam } from "../types/resolverTypes";
import * as dotenv from 'dotenv';
dotenv.config()
import { Pool } from "pg";

const pool = new Pool({
    connectionString: 'postgres://qookhyrf:pZq5pcKkVE-00P7K6gID7gzeQKTufdoW@lallah.db.elephantsql.com/qookhyrf'
})

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
            return data.rows
        } catch(err) {
            console.log('error in findStatsByGame: ', err)
        }
    },
    findGameStatsByPlayerID: async (args: {game_id: string, player_id: string}): Promise<void | IGameStats[]> => {
        const playerID = Number(args.player_id)
        const gameID = Number(args.game_id)
        const queryString = `
        SELECT g.*, p.name as player_name, p.position as player_position, p.number as player_number, p.age as player_age, p.team_id, t.name as team_name
        FROM game_stats g 
        INNER JOIN players p 
        ON p.id = g.player_id 
        INNER JOIN teams t 
        ON p.team_id = t.id
        WHERE g.game_id = $1
        AND g.player_id = $2`;
        const values = [gameID, playerID];
        try {
            const data = await pool.query(queryString, values);
            return data.rows
        } catch(err) {
            console.log('error in findGameStatsByPlayerID: ', err)
        }
    },
    findPlayerStatsByID: async (args: {player_id: string}): Promise<void | IGameStats[]> => {
        const playerID = Number(args.player_id)
        const queryString = `
        SELECT g.*, p.name as player_name, p.position as player_position, p.number as player_number, p.age as player_age, p.team_id, t.name as team_name
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
            console.log('error in findPlayerStatsByID: ', err)
        }
    },
    findPlayerStatsByName: async (args: {name: string}): Promise<void | IGameStats[]> => {
        const name = args.name
        const queryString = `
        SELECT g.*, p.name as player_name, p.position as player_position, p.number as player_number, p.age as player_age, p.team_id, t.name as team_name
        FROM game_stats g 
        INNER JOIN players p 
        ON p.id = g.player_id 
        INNER JOIN teams t 
        ON p.team_id = t.id
        WHERE p.name = $1`;
        const values = [name];
        try {
            const data = await pool.query(queryString, values);
            return data.rows
        } catch(err) {
            console.log('error in findPlayerStatsByName: ', err)
        }
    },
    findPlayerByID: async (args: {player_id: string}): Promise<void | IPlayer> => {
        const playerID = Number(args.player_id)
        const queryString = `
        SELECT * 
        FROM players 
        WHERE id = $1`;
        const values = [playerID];
        try {
            const data = await pool.query(queryString, values);
            console.log(data.rows[0])
            return data.rows[0]
        } catch(err) {
            console.log('error in findPlayerByID: ', err)
        }
    },
    findPlayerByName: async (args: {player_name: string}): Promise<void | IPlayer> => {
        const playerName = args.player_name;
        const queryString = `
        SELECT * 
        FROM players 
        WHERE name = $1`;
        const values = [playerName];
        try {
            const data = await pool.query(queryString, values);
            return data.rows[0]
        } catch(err) {
            console.log('error in findPlayerByName: ', err)
        }
    },
    findTeamById: async (args: {team_id: string}): Promise<void | ITeam> => {
        const teamID = Number(args.team_id);
        const queryString = `
        SELECT * 
        FROM teams 
        WHERE id = $1`;
        const values = [teamID];
        try {
            const data = await pool.query(queryString, values);
            return data.rows[0]
        } catch(err) {
            console.log('error in findTeamById: ', err)
        }
    },
    findTeamByName: async (args: {team_name: string}): Promise<void | ITeam> => {
        const teamName = args.team_name;
        const queryString = `
        SELECT * 
        FROM teams 
        WHERE name = $1`;
        const values = [teamName];
        try {
            const data = await pool.query(queryString, values);
            return data.rows[0]
        } catch(err) {
            console.log('error in findTeamByName: ', err)
        }
    },
    findScoreByGameID: async (args: {game_id: string}): Promise<void | IGameScores> => {
        const gameID = Number(args.game_id);
        const queryString = `
        SELECT * 
        FROM game_scores 
        WHERE game_id = $1`;
        const values = [gameID];
        try {
            const data = await pool.query(queryString, values);
            return data.rows[0]
        } catch(err) {
            console.log('error in findScoreByGameID: ', err)
        }
    },
    findAllGames: async (): Promise<void | IGameScores[]> => {
        const queryString = `
        SELECT g.*, a.name as away_name, h.name as home_name 
        FROM game_scores g 
        INNER JOIN teams a 
        ON g.away_id = a.id 
        INNER JOIN teams h 
        ON g.home_id = h.id`;
        try {
            const data = await pool.query(queryString);
            return data.rows
        } catch(err) {
            console.log('error in findAllGames: ', err)
        }
    },
}