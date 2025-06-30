module.exports = {
    apps: [ 
        {
            name: "voterlookup",
            script: "build/index.js",
            env: {
                PORT: "3001"
            }
        }
    ]
}