
export interface IGameStats {
    playerID: number;
    playerName: string;
    teamID: number;
    playerAge: number;
    playerNumber: string;
    playerPosition: number;
    assists: number;
    goals: number;
    hits: number;
    penaltyMinutes: number;
    opponentTeam: string;
}

export interface IPlayer {
    ID: number;
    name: string;
    team: string;
    age: number;
    number: number;
    position: number;
}

export interface ITeam {
    ID: number;
    name: string;
}

export interface IGameScores {
    gameID: number;
    awayTeam: string
    homeTeam: string
    score: string
}