import express from 'express';
import { Pool } from 'pg';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { typeDefs } from "./schema/nhl";
import cors from 'cors';
import http from 'http';
import cron from 'node-cron';
import childProcess from 'child_process';
import { json } from 'body-parser';
import { resolvers } from "./resolvers/nhlResolver";
import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { IScheduleHomeAndAwayTeams, ApolloContext } from './types/types';

export const pool = new Pool({
  connectionString: process.env.PG_CONNECT_URI
})

export async function startApolloServer () {
  const app = express();

  const httpServer = http.createServer(app);
  
  const apolloServer = new ApolloServer<ApolloContext>({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({httpServer})],
  })
  
  await apolloServer.start();
  
  app.use('/graphql', cors<cors.CorsRequest>(), json(), expressMiddleware(apolloServer, {
    context: async ({req}) => ({token: req.headers.token}) 
  }))
  try {
    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`Server ready at http://localhost:4000`);
  } catch(err) {
    console.log(err)
  }
  findGames()
}

startApolloServer()

cron.schedule("* * */1 * *", () => {
  console.log('running cron job in main process')
  findGames()
})

async function makeChild (link: string, gameId: number, teams: IScheduleHomeAndAwayTeams) {
  const child = childProcess.fork("child.ts")
  child.send({url: link, gameId: gameId, teams: teams})
  child.on('error', (err: Error) => {
    console.log('error,', err)
  })
  child.on("exit", (code: number) => {
    console.log('finished')
    console.log(code)
  })
}

const live = new Set()

async function findGames () {
  const todaysGames = await axios.get(`https://statsapi.web.nhl.com/api/v1/schedule`)
  const gamesDatesArray = todaysGames.data.dates;
  for (const gameDate of gamesDatesArray) {
    for (const game of gameDate.games) {
      if (game.status.abstractGameState === "Live") {
        if (live.has(game.link)) {
          continue
        } else {
          live.add(game.link)
          makeChild(game.link, game.gamePk, game.teams)
        }
      }
    }
  }
}