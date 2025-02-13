const express = require('express')
const {
    getUser,
    getUserById,
    createUser,
    registers,
    updateUser,
    deleteUser
} = require('../controller/userController')
const {verifyUser,adminOnly } = require('../middleware/userMiddleware')
const router = express.Router()

router.get('/getuser',verifyUser,getUser)
router.get('/getuser/:id',verifyUser,getUserById)
router.post('/creaetuser', createUser)
router.post('/register',registers)
router.put('/updateuser/:id',verifyUser, updateUser)
router.delete('/deleteuser/:id',verifyUser, deleteUser)

module.exports = router