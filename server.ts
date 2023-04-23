import express from 'express';
import {Pool} from 'pg';
import { ApolloServer } from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { typeDefs } from "./schema/nhl";
import cors from 'cors';
import http from 'http';
import cron from 'node-cron';
import childProcess from 'child_process';
import { json } from 'body-parser';
import { resolvers } from "./resolvers/nhlResolver";
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.PG_CONNECT_URI
})

interface ApolloContext {
  token?: String;
}

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
  
  await new Promise<void>((resolve: any) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`Server ready at http://localhost:4000`);
}

startApolloServer()

cron.schedule("* */1 * * *", () => {
  const today = new Date()
  const dateString = today.toISOString().slice(0, 10)
  findGames(dateString)
})

async function makeChild (link: string) {
  const child = childProcess.fork("child.ts")
  child.send({url: link})
  child.on("exit", (code: any) => {
    console.log('finished')
    console.log(code)
  })
}

const live = new Set()

async function findGames (today: string) {
  console.log('todays date', today)
  const todaysGames = await axios.get(`https://statsapi.web.nhl.com/api/v1/schedule?&startDate=${today}&endDate=${today}`)
  const gamesTodayArray = todaysGames.data.dates[0].games;
  for (const game of gamesTodayArray) {
    if (game.status.codedGameState === "3") {
      if (live.has(game.link)) {
        continue
      } else {
        live.add(game.link)
        makeChild(game.link)
      }
    }
  }
}

findGames(new Date().toISOString().slice(0, 10))