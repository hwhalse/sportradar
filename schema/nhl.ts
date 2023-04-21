export const typeDefs = `
#graphql

type Stat {
    name: String
}

type Query {
    stat: [Stat]
}`