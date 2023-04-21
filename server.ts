import express from 'express';
import {Pool} from 'pg';
import { ApolloServer } from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { typeDefs } from "./schema/nhl";
import cors from 'cors';
import http from 'http';
import {json} from 'body-parser';
import { resolvers } from "./resolvers/nhlResolver";
import * as dotenv from 'dotenv';
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
  console.log(`🚀 Server ready at http://localhost:4000`);
}

startApolloServer()
