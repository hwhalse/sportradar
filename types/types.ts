//TYPES FOR SERVER.TS AND CHILD.TS

//main server start function
export interface ApolloContext {
    token?: String;
}

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

//CHILD.TS TYPES

export interface Msg {
    url: string;
    gameId: number;
}
export interface PlayerInfo {
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

export interface TeamInfo {
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

export type RosterData = Record<string, PlayerInfo>

//schedule types
  
export interface IScheduleHomeAndAwayTeams {
    away: IScheduleTeamObject
    home: IScheduleTeamObject
}

interface IScheduleTeamObject {
    leagueRecord: IScheduleLeagueRecord
    score: number;
    team: IScheduleTeam
}
  
interface IScheduleLeagueRecord {
    wins: number;
    losses: number;
    type: string;
}
  
interface IScheduleTeam {
    id: number;
    name: string;
    link: string;
}