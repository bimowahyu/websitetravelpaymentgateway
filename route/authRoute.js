const {login,logOut,me} = require('../controller/authController')
const express = require('express')


const router = express.Router()

router.post('/login',login)
router.get('/me',me)
router.delete('/logout',logOut)

module.exports = router