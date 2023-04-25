export const typeDefs = `
#graphql

type GameStats {
    game_id: Int
    player_id: Int
    player_name: String
    team_id: Int
    team_name: String
    player_age: Int
    player_number: String
    player_position: String
    assists: Int
    goals: Int
    hits: Int
    penalty_minutes: Int
    opponent_team_id: String
}

type GameScores {
    game_id: Int
    away_id: Int
    home_id: Int
    away_score: Int
    home_score: Int
    date: String
    away_name: String
    home_name: String
}

type Player {
    id: Int
    name: String
    team_id: Int
    age: Int
    number: Int
    position: String
}

type Team {
    id: Int
    name: String
}

type Query {
    getGameStatsByGameID(game_id: ID): [GameStats]
    getGameStatsByPlayerID(game_id: ID, player_id: ID): [GameStats]
    getPlayerStatsByID(player_id: ID): [GameStats]
    getPlayerStatsByName(name: String): [GameStats]
    getPlayerByID(player_id: ID): Player
    getPlayerByName(player_name: String): Player
    getTeamByID(team_id: ID): Team
    getTeamByName(team_name: String): Team
    getScores(game_id: ID): GameScores
    getAllGames: [GameScores]
}`