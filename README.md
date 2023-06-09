<h1>Welcome!</h1>

To run the data pipeline:
<ol>
    <li>Clone the repo</li><br/>
    <li>Run 'npm install' to install dependencies</li><br/>
    <li>Run 'npm start' to start server</li><br/>
    <li>Run 'npm test' to launch testing suite</li><br/>
    <li>The Apollo server will run at localhost:4000/graphql</li><br/>
    <li>Send a getAllGames query to the server, returning game_id</li><br/>
    <li>Use the game_id to query getGameStatsByGameId</li><br/>
    <li>From there you can grab player IDs to look up player stats</li><br/>
    <li>You can look up players by ID or name, teams by ID or name, game scores by ID, game stats by ID, and game stats by ID and playerID. You can also get game scores by gameID</li><br/>
</ol>

        NOTE: Currently, the child processes are set to run 10 times at 10-second intervals before shutting down. To configure the number of times they run, change the 'count ===' limit in the 'getLiveData' function in child.ts (line 78). You can remove this statement or change the limit number.

<h2>Goals:</h2>
<ol>
  <li>Continuously monitor schedule to check when games go live, when they do...</li><br/>
  <li>Send live statistics to database, allowing client queries to database for game, player, and team info</li><br/>
    <li>Allow offseason (non-live) querying of game statistics</li><br/>
</ol>

<h2>Tech</h2>
-TypeScript <br/>
-Node.js/Express <br/>
-PostgreSQL <br/>
-GraphQL <br/>
-Apollo Server <br/>
-Jest <br/>
-Axios <br/>

<h2>Approach</h2>
-Create Node server which calls a function every 10 seconds. The function sends a GET request to the schedule API, which has a list of games for that day.<br/>
-Once a live game is found, the function creates a child process and sends it a message containing the URL of the live game.<br/>
-The child process spins up and, once it receives the URL, calls a function that sends a GET request to that endpoint.<br/>
-The function takes the info from the live game and does two things:<br/>
  1. Updates the 'players' and 'teams' tables to include all players and teams in the current game<br/>
  2. Checks the live game stats for updated plays<br/>
-The function which updates plays checks the 'allPlays' key to see if its length has changed since the last update (updates occur every 10 seconds). <br/>
-If there is an update, the function loops through the play objects, checking for events.<br/>
-If there is a relevant event, the function sends an upsert to the PostgreSQL database, either adding stats for that player for that game or updating their stats.<br/>
-The child process exits when the game is no longer live.<br/>

Tables

<h3>game_stats</h3>

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

<h3>game_scores</h3> 
    
    game_id INT UNIQUE NOT NULL 
    away_id INT 
    home_id INT 
    away_score INT 
    home_score INT 

<h3>players</h3>
    
    id INT UNIQUE NOT NULL 
    name VARCHAR(50) 
    position VARCHAR(50) 
    number VARCHAR(3) 
    team_id INT 

<h3>teams</h3>
    
    id INT UNIQUE NOT NULL 
    name varchar(50) UNIQUE NOT NULL 

