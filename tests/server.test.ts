import { resolvers } from "../resolvers/nhlResolver";
import {typeDefs} from '../schema/nhl';
import { ApolloServer } from "@apollo/server";
import childProcess from 'node:child_process';

describe('testing resolvers', () => {
    let testServer: ApolloServer;
    beforeAll(() => {
        testServer = new ApolloServer({
            typeDefs,
            resolvers,
        });
    })
    test('returns player name when given ID', async () => {
        const response: any = await testServer.executeOperation({
            query: 'query GetPlayerByID($playerId: ID) { getPlayerByID(player_id: $playerId) {name}}',
            variables: { playerId: 8475314 },
        });
        expect(response).toBeTruthy();
        expect(response.body.singleResult).toHaveProperty('data');
        expect(response.body.singleResult.data.getPlayerByID).toHaveProperty('name');
        expect(response.body.errors).toBe(undefined);
    })
    test('returns team name when given ID', async () => {
        const response: any = await testServer.executeOperation({
            query: 'query GetTeamByID($teamId: ID) { getTeamByID(team_id: $teamId) {name}}',
            variables: { teamId: 25 },
        });
        expect(response).toBeTruthy();
        expect(response.body.singleResult).toHaveProperty('data');
        expect(response.body.singleResult.data.getTeamByID).toHaveProperty('name');
        expect(response.body.errors).toBe(undefined);
    })
    test('returns team name when given ID', async () => {
        const response: any = await testServer.executeOperation({
            query: 'query GetTeamByID($teamId: ID) { getTeamByID(team_id: $teamId) {name}}',
            variables: { teamId: 25 },
        });
        expect(response).toBeTruthy();
        expect(response.body.singleResult).toHaveProperty('data');
        expect(response.body.singleResult.data.getTeamByID).toHaveProperty('name');
        expect(response.body.errors).toBe(undefined);
    })
    test('gets scores by game ID', async () => {
        const response: any = await testServer.executeOperation({
            query: 'query GetScores($gameId: ID) { getScores(game_id: $gameId) {home_score}}',
            variables: { gameId: 2022030144 },
        });
        expect(response).toBeTruthy();
        expect(response.body.singleResult).toHaveProperty('data');
        expect(response.body.singleResult.data.getScores).toHaveProperty('home_score');
        expect(response.body.errors).toBe(undefined);
    })
    test('gets player stats for one game from game ID and player ID', async () => {
        const response: any = await testServer.executeOperation({
            query: 'query GetGameStatsByPlayerID($gameId: ID, $playerId: ID) { getGameStatsByPlayerID(game_id: $gameId, player_id: $playerId) {game_id player_id player_name player_age player_number player_position team_name opponent_team_id assists goals hits penalty_minutes}}',
            variables: { gameId: 2022030144, playerId: 8475765 },
        });
        expect(response).toBeTruthy();
        expect(response.body.singleResult).toHaveProperty('data');
        const data = response.body.singleResult.data.getGameStatsByPlayerID[0]
        expect(data).toHaveProperty('game_id');
        expect(data).toHaveProperty('player_id');
        expect(data).toHaveProperty('player_name');
        expect(data).toHaveProperty('player_age');
        expect(data).toHaveProperty('player_position');
        expect(data).toHaveProperty('player_number');
        expect(data).toHaveProperty('team_name');
        expect(data).toHaveProperty('assists');
        expect(data).toHaveProperty('goals');
        expect(data).toHaveProperty('hits');
        expect(data).toHaveProperty('penalty_minutes');
        expect(response.body.errors).toBe(undefined);
    })
    afterAll(() => {
        testServer.stop()
    })
})

describe('spin up child instance and exit without error', () => {
    test('spins up one child instance and checks for exit code', async () => {
        async function makeChild () {
            let messageFromChild
            const child = childProcess.fork("./tests/childTest.ts")
            child.send('test')
            return new Promise ((resolve) => {
                child.on('error', async (err: Error) => {
                console.log('error,', err)
            })
            child.on('message', async (msg: string) => {
                messageFromChild = msg
            })
            child.on("exit", async (code: number) => {
                resolve(code)
            })
            })
        }
        async function fork () {
            return makeChild().then(data => data, err => err)
        }
        expect(await fork()).toEqual(0)
    })
})