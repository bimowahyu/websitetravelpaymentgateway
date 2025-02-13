const express = require('express')
const {getBoking, getBokingById, createBoking,updateBoking,deleteBoking} = require('../controller/bokingController')
const {verifyUser, adminOnly} = require('../middleware/userMiddleware')
const router = express.Router()

router.get('/getbooking',verifyUser,getBoking)
router.get('/getbooking/:id',verifyUser,getBokingById)
router.post('/createbooking',verifyUser,createBoking)
router.put('/updatebooking/:id',verifyUser,updateBoking)
router.delete('/deletebooking/:id',verifyUser,deleteBoking)

module.exports = router