Welcome!

To run the data pipeline:
1. Clone the repo
2. Run 'npm install' to install dependencies
3. Run 'npm start' to start server
4. Run 'npm test' to launch testing suite
5. The Apollo server will run at localhost:4000/graphql
6. Send a getAllGames query to the server, returning game_id
7. Use the game_id to query getGameStatsByGameId
8. From there you can grab player IDs to look up player stats
9. You can look up players by ID or name, teams by ID or name, game scores by ID, game stats by ID, and game stats by ID and playerID. You can also get game scores by gameID.

NOTE: Currently, the child processes are set to run 10 times at 10-second intervals before shutting down. To configure the number of times they run, change the 'count ===' limit in the 'getLiveData' function in child.ts (line 78). You can remove this statement or change the limit number.

    Goals:
-Create 2 processes: 
  1. continuously monitor schedule to check when games go live, when they do...
  2. send live statistics to database, allowing client queries to database for game, player, and team info
-Allow offseason (non-live) querying of game statistics

    Tech
-TypeScript /n
-Node.js/Express /n
-PostgreSQL /n
-GraphQL /n
-Apollo Server /n
-Jest /n
-Axios /n

    Approach
-Create Node server which calls a function every 10 seconds. The function sends a GET request to the schedule API, which has a list of games for that day.
-Once a live game is found, the function creates a child process and sends it a message containing the URL of the live game.
-The child process spins up and, once it receives the URL, calls a function that sends a GET request to that endpoint.
-The function takes the info from the live game and does two things:
  1. Updates the 'players' and 'teams' tables to include all players and teams in the current game
  2. Checks the live game stats for updated plays
-The function which updates plays checks the 'allPlays' key to see if its length has changed since the last update (updates occur every 10 seconds). 
-If there is an update, the function loops through the play objects, checking for events.
-If there is a relevant event, the function sends an upsert to the PostgreSQL database, either adding stats for that player for that game or updating their stats.
-The child process exits when the game is no longer live.

Tables

    game_stats
id SERIAL PRIMARY KEY
event_index INT
game_id INT
player_id INT
assists INT
goals INT
hits INT
points INT
penalty_minutes INT
opponent_team_id INT
UNIQUE (game_id, event_index)
UNIQUE (game_id, player_id)

    game_scores 
game_id INT UNIQUE NOT NULL
away_id INT
home_id INT
away_score INT
home_score INT

    players
id INT UNIQUE NOT NULL
name VARCHAR(50)
position VARCHAR(50)
number VARCHAR(3)
team_id INT

    teams
id INT UNIQUE NOT NULL
name varchar(50) UNIQUE NOT NULL

