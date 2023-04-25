process.on('message', (test) => {
    console.log(test);
    process.exit(0);
})