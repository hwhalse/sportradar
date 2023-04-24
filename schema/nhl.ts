export const typeDefs = `
#graphql

type GameStats {
    playerID: int
    playerName: string
    teamID: int
    playerAge: int
    playerNumber: string
    playerPosition: number
    assists: int
    goals: int
    hits: int
    penaltyMinutes: int
    opponentTeam: string
}

type GameScores {
    gameID: int
    awayTeam: string
    homeTeam: string
    score: string
}

type Player {
    ID: int
    name: string
    team: string
    age: int
    number: int
    position: int
}

type Team {
    ID: int
    name: string
}

type Query {
    getGameStats: [GameStats]
    getGameScore: [GameScores]
    getPlayers: [Players]
    getTeams: [Teams]
}`