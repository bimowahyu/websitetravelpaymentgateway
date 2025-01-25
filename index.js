const express = require('express')

const app = express()

app.get('/',(req,res)=> {
    res.send('Hello everyone')
})
const port = 3021

app.listen(port,() =>{'hello world'})