import axios from "axios";
import { pool } from './server';
import { Play } from "./types";

interface Msg {
    url: string;
    gameId: number;
}

process.on("message", (message: Msg): void => {
    console.log('this is the message', message)
    getLiveData(message.url, message.gameId)
    updatePlayersAndTeams(message.url)
})

let count = 0
let playCount = 0;

const queue: Play[] = []

async function updatePlayersAndTeams (link: string) {
    const fetchInfo = await axios.get(`https://statsapi.web.nhl.com${link}`);
    const data = fetchInfo.data;
    for (const playerId in data.players) {
        const playerInfo: PlayerInfo = data.player[playerId];
        try {   
            const values = [playerInfo.id, playerInfo.fullName, playerInfo.primaryPosition.name, playerInfo.primaryNumber, playerInfo.currentTeam.id]
            pool.query(`INSERT INTO players (id, name, position, number, team_id) values ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`, values)
        } catch(err) {
            console.log(err)
        }
    }
    for (const team in data.teams) {
        const teamInfo: TeamInfo = data.teams[team];
        try {
            const values = [teamInfo.id, teamInfo.name];
            pool.query(`INSERT INTO teams (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, values)
        } catch(err) {
            console.log(err)
        }
    }
}

async function writePlaysToDb (roster: RosterData, homeTeam: TeamInfo, awayTeam: TeamInfo, gameId: number) {
    while (queue.length > 0) {
        let queryString;
        const play = queue.shift()
        const values = []
        const player = play?.players[0]
        if (play && player) {
            const firstPlayer = player.player;
            values.push(firstPlayer.id, firstPlayer.fullName)
        }
        if (play && play.team) {
            values.push(play.team.id, play.team.name)    
        }
        const playerExtraInfo = await pool.query(`SELECT age, number, position FROM players WHERE id=${player?.player.id}`)
        values.push(...playerExtraInfo.rows[0])
        const playEvent = play?.result.event
        if (playEvent === 'hit') {
            const opponentTeamId = play!.team.id === homeTeam.id ? awayTeam.id : homeTeam.id
            const values = [gameId, play!.players[0].player.id, 0, 0, 1, 0, 0, opponentTeamId]
            queryString = `INSERT INTO game_stats 
            (game_id, player_id, assists, goals, hits, points, penalty_minutes, opponent_team_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            ON CONFLICT (game_id, player_id) 
            DO UPDATE SET 
            hits = game_stats.hits + 1 
            WHERE game_stats.player_id = $2`;
        } else if (playEvent === 'Goal') {
            for (const playerInPlay of play!.players) {
                if (playerInPlay.playerType === 'Scorer') {
                    try {

                    } catch(err) {

                    }
                }
            }
        }
        try {   
            if (queryString) await pool.query(queryString)
        } catch(err) {
            console.log(err)
        }
    }
}

async function enqueue (chunks: Play[], roster: RosterData, homeTeam: TeamInfo, awayTeam: TeamInfo, gameId: number) {
    console.log('ready to write', chunks)
    for (const play of chunks) {
        queue.push(play)
    }
    writePlaysToDb(roster, homeTeam, awayTeam, gameId)
}

interface TeamInfo {
    id: number;
    name: string;
    link: string;
    venue: {
        name: string;
        link: string;
        city: string;
        timeZone: {
            id: string;
            offset: number;
            tz: string
        }
    };
    abbreviation: string;
    triCode: string;
    teamName: string;
    locationName: string;
    firstYearOfPlay: string;
    division: {
        id: number;
        name: string;
        nameShort: string;
        link: string;
        abbreviation: string;
    };
    conference: {
        id: number;
        name: string;
        link: string;
    };
    franchise: {
        franchiseId: number;
        teamName: string;
        link: string;
    };
    shortName: string;
    officialSiteUrl: string;
    franchiseId: number;
    active: boolean;
}

interface PlayerInfo {
    id: number;
    fullName: string;
    link: string;
    firstName: string;
    lastName: string;
    primaryNumber: string;
    birthDate: string;
    currentAge: number;
    birthCity: string;
    birthStateProvince: string;
    nationality: string;
    height: string;
    weight: number;
    active: boolean;
    alternateCaptain: boolean;
    captain: boolean;
    rookie: boolean;
    shootsCatches: string;
    rosterStatus: string;
    currentTeam: {
        id: number;
        name: string;
        link: string;
        triCode: string;
    };
    primaryPosition: {
        code: string;
        name: string;
        type: string;
        abbreviation: string;
    }
}

type RosterData = Record<string, PlayerInfo>

async function getLiveData (link: string, gameId: number) {
    const ftch = await axios.get(`https://statsapi.web.nhl.com${link}`);
    const response = ftch.data;
    const plays = response.liveData.plays.allPlays;
    const numPlays = response.liveData.plays.allPlays.length;
    const homeTeam = response.teams.home;
    const awayTeam = response.teams.away;
    if (numPlays > playCount) {
        const newPlays = plays.slice(playCount, numPlays)
        console.log('len of arr', newPlays.length)
        enqueue(newPlays, response.players, homeTeam, awayTeam, gameId)
        playCount = numPlays;
    }
    if (response.gameData.status.abstractGameState !== "Live" || count === 10) {
        console.log('game over')
        process.exit(0)
    } else {
        console.log('live data length')
        console.log(Object.keys(response.liveData.plays.allPlays).length)
        setTimeout(() => {
            getLiveData(link, gameId)
        }, 10000)
        count++
    }
}

console.log(process.argv)
console.log(process.pid)
