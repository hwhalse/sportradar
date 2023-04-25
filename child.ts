import axios from "axios";
import { Play } from "./types/types";
import { Pool } from 'pg'
import { PlayerInfo, TeamInfo, Msg } from "./types/types";

const pool = new Pool({
    connectionString: process.env.PG_CONNECT_URI
})

console.log('child ' + process.pid + ' forked')

process.on("message", async (message: Msg): Promise<void> => {
    console.log('this is the message', message)
    await updatePlayersAndTeams(message.url)
    getLiveData(message.url, message.gameId)
})

let count = 0
let score: Array<number | undefined> = [0, 0]

async function updatePlayersAndTeams (link: string) {
    const fetchInfo = await axios.get(`https://statsapi.web.nhl.com${link}`);
    const data = fetchInfo.data;
    console.log('updating players and teams')
    for (const playerId in data.gameData.players) {
        const playerInfo: PlayerInfo = data.gameData.players[playerId];
        try {   
            const values = [playerInfo.id, playerInfo.fullName, playerInfo.primaryPosition.name, playerInfo.primaryNumber, playerInfo.currentTeam.id, playerInfo.currentAge]
            const queryString = `
            INSERT INTO players (id, name, position, number, team_id, age) 
            Values ($1, $2, $3, $4, $5, $6) 
            ON CONFLICT (id) 
            DO NOTHING`
            await pool.query(queryString, values)
        } catch(err) {
            console.log(err)
        }
    }
    for (const team in data.gameData.teams) {
        const teamInfo: TeamInfo = data.gameData.teams[team];
        try {
            const values = [teamInfo.id, teamInfo.name];
            const queryString = `
            INSERT INTO teams (id, name) 
            VALUES ($1, $2) 
            ON CONFLICT 
            DO NOTHING`
            await pool.query(queryString, values)
        } catch(err) {
            console.log(err)
        }
    }
}

let playCount = 0;

async function getLiveData (link: string, gameId: number) {
    const ftch = await axios.get(`https://statsapi.web.nhl.com${link}`);
    const response = ftch.data;
    const plays = response.liveData.plays.allPlays;
    const numPlays = response.liveData.plays.allPlays.length;
    const homeTeam = response.gameData.teams.home;
    const awayTeam = response.gameData.teams.away;
    if (numPlays > playCount) {
        const newPlays = plays.slice(playCount, numPlays)
        console.log('number of new plays since last update: ', newPlays.length)
        enqueue(newPlays, homeTeam, awayTeam, gameId)
        playCount = numPlays;
    }
    if (response.gameData.status.abstractGameState !== "Live" || count === 10) {
        console.log('game over')
        process.exit(0)
    } else {
        setTimeout(() => {
            getLiveData(link, gameId)
        }, 10000)
        count++
    }
}

const queue: Play[] = []

async function enqueue (chunks: Play[], homeTeam: TeamInfo, awayTeam: TeamInfo, gameId: number) {
    for (const play of chunks) {
        queue.push(play)
    }
    writePlaysToDb(homeTeam, awayTeam, gameId)
}

async function writePlaysToDb (homeTeam: TeamInfo, awayTeam: TeamInfo, gameId: number) {
    while (queue.length > 0) {
        console.log('queue length', queue.length)
        let queryString;
        const play = queue.shift();
        let player;
        if (play!.players) player = play!.players[0];
        const playEvent = play?.result.event
        if (playEvent === 'Hit') {
            const opponentTeamId = play!.team.id === homeTeam.id ? awayTeam.id : homeTeam.id
            const values = [play?.about.eventIdx, gameId, play!.players[0].player.id, 0, 0, 1, 0, 0, opponentTeamId]
            queryString = `
            INSERT INTO game_stats 
            (event_index, game_id, player_id, assists, goals, hits, points, penalty_minutes, opponent_team_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            ON CONFLICT (game_id, player_id) 
            DO UPDATE SET 
            hits = game_stats.hits + 1 
            WHERE game_stats.player_id = $2`;
            await pool.query(queryString, values)
        } else if (playEvent === 'Goal') {
            for (const playerInPlay of play!.players) {
                if (playerInPlay.playerType === 'Scorer') {
                    try {
                        const opponentTeamId = play!.team.id === homeTeam.id ? awayTeam.id : homeTeam.id
                        const values = [play?.about.eventIdx, gameId, playerInPlay.player.id, 0, 1, 0, 0, 0, opponentTeamId]
                        const queryString = `
                        INSERT INTO game_stats 
                        (event_index, game_id, player_id, assists, goals, hits, points, penalty_minutes, opponent_team_id) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        ON CONFLICT (game_id, player_id) 
                        DO UPDATE SET 
                        goals = game_stats.goals + 1 
                        WHERE game_stats.player_id = $2`;
                        await pool.query(queryString, values)
                    } catch(err) {
                        console.log(err)
                    }
                } else if (playerInPlay.playerType === 'Assist') {
                    try {
                        const opponentTeamId = play!.team.id === homeTeam.id ? awayTeam.id : homeTeam.id
                        const values = [play?.about.eventIdx, gameId, playerInPlay.player.id, 1, 0, 0, 0, 0, opponentTeamId]
                        const queryString = `
                        INSERT INTO game_stats 
                        (event_index, game_id, player_id, assists, goals, hits, points, penalty_minutes, opponent_team_id) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                        ON CONFLICT (game_id, player_id) 
                        DO UPDATE SET 
                        assists = game_stats.assists + 1 
                        WHERE game_stats.player_id = $2`;
                        await pool.query(queryString, values)
                    } catch(err) {
                        console.log(err)
                    }
                }
            }
        } else if (playEvent === 'Penalty') {
            const opponentTeamId = play!.team.id === homeTeam.id ? awayTeam.id : homeTeam.id
            const values = [play?.about.eventIdx, gameId, play!.players[0].player.id, 0, 0, 0, 0, play!.result.penaltyMinutes, opponentTeamId]
            const queryString = `
            INSERT INTO game_stats 
            (event_index, game_id, player_id, assists, goals, hits, points, penalty_minutes, opponent_team_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            ON CONFLICT (game_id, player_id) 
            DO UPDATE SET 
            penalty_minutes = game_stats.penalty_minutes + 1 
            WHERE game_stats.player_id = $2`;
            try {
                await pool.query (queryString, values)
            } catch(err) {
                console.log(err)
            }
        }
        const newScore = [play?.about.goals.away, play?.about.goals.home]
        if (newScore[0] !== score[0] || newScore[1] !== score[1]) {
            const today = new Date()
            const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
            score = newScore
            const queryString = `
            INSERT INTO game_scores 
            (game_id, away_id, home_id, away_score, home_score, date) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            ON CONFLICT (game_id) 
            DO UPDATE SET 
            away_score = $4,
            home_score = $5
            WHERE game_scores.game_id = $1`;
            const values = [gameId, awayTeam.id, homeTeam.id, score[0], score[1], date]
            console.log(values)
            await pool.query(queryString, values)
        }
    }
}
