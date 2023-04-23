export interface Play {
    players: LivePlayers[];
    result: Result;
    about: About;
    coordinates: Coordinates;
    team: Team;
}

export interface Result {
    event: string;
    eventCode: string;
    eventTypeId: string;
    description: string;
    secondaryType: string;
    penaltySeverity: string;
    penaltyMinutes: number;
}

export interface About {
    eventIdx: number;
    eventId: number;
    period: number;
    periodType: string;
    originalNum: string;
    periodTime: string;
    periodTimeRemaining: string;
    dateTime: string;
    goals: Goals
}

export interface Coordinates {
    x: number;
    y: number;
}

export interface Team {
    id: number;
    name: string;
    link: string;
    triCode: string;
}

export interface Goals {
    away: number;
    home: number;
}

export interface LivePlayers {
    player: Player;
    playerType: string;
}

export interface Player {
    id: number;
    fullName: string;
    link: string;
}