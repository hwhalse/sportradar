import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import childProcess from 'child_process';
import axios from 'axios';
import { json } from 'body-parser';
import { Pool } from 'pg';
//apollo imports
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { typeDefs } from "./schema/nhl";
import { resolvers } from "./resolvers/nhlResolver";
import { IScheduleHomeAndAwayTeams, ApolloContext } from './types/types';

//node-pg connection pool
const pool = new Pool({
  connectionString: 'postgres://qookhyrf:pZq5pcKkVE-00P7K6gID7gzeQKTufdoW@lallah.db.elephantsql.com/qookhyrf'
})

dotenv.config();

async function startApolloServer () {
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
    console.log('error starting apollo server with express: ', err)
  }
  //make initial call to find live games today
  findGames()
}

startApolloServer()

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

//set of unique game links to prevent new processes for existing games
const live = new Set()

async function findGames () {
  const todaysGames = await axios.get(`https://statsapi.web.nhl.com/api/v1/schedule`)
  //loop array of games today and check for live status
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
  setTimeout(() => {
    findGames()
  }, 10000)
}