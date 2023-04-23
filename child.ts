import axios from "axios"

interface Msg {
    url: string;
}

process.on("message", (message: Msg): void => {
    console.log('this is the message', message)
    startStream(message.url)
})

let count = 0
let playCount = 0;

let queue = []

async function write (chunks: any[]) {
    console.log('ready to write', chunks)
    for (const play of chunks) {
        queue.push(play)
    }
}

async function startStream (link: string) {
    const ftch = await axios.get(`https://statsapi.web.nhl.com${link}`);
    const response = ftch.data;
    const oldPlayNum = playCount
    const plays = response.liveData.plays.allPlays;
    const numPlays = response.liveData.plays.allPlays.length
    if (numPlays > playCount) {
        const newPlays = plays.slice(playCount, numPlays)
        console.log('len of arr', newPlays.length)
        write(plays[numPlays - 1])
        playCount = numPlays;
    }
    if (response.gameData.status.abstractGameState !== "Live" || count === 10) {
        console.log('game over')
        process.exit(0)
    } else {
        console.log('live data length')
        console.log(Object.keys(response.liveData.plays.allPlays).length)
        setTimeout(() => {
            startStream(link)
        }, 10000)
        count++
    }
}

console.log(process.argv)
console.log(process.pid)
