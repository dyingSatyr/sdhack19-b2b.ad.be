const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
require ('dotenv').config()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Backend Service is now listening on port: ${PORT}`)
})

app.get('/', (req,res) => {
    res.send('Hello, API is Online')
})

/**
 * 
 * 
 * TODO:
 * Get Car Parks
 * 
 * Request Ad
 * 
 * Request Ad Requests
 * 
 * Approve and Deploy Ad
 * 
 * FIXME:
 * ----
 * 
 */