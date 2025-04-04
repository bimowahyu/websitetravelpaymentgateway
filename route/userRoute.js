const express = require('express')
const {
    getUser,
    getUserById,
    createUser,
    registers,
    updateUser,
    deleteUser,
    resetPassword,
    updatePassword
} = require('../controller/userController')
const {verifyUser,adminOnly } = require('../middleware/userMiddleware')
const router = express.Router()

router.get('/getuser',verifyUser,getUser)
router.get('/getuser/:id',verifyUser,getUserById)
router.post('/creaetuser', createUser)
router.put('/updateuser/:id',verifyUser, updateUser)
router.delete('/deleteuser/:id',verifyUser,adminOnly, deleteUser)


router.post('/register',registers)
router.post('/resetpassword',resetPassword)
router.post('/update-password',updatePassword)

module.exports = router

//docs reset password api
// {
//     "username": "bimoemail",
//     "email": "bimowahyu1908@gmail.com"
// }
//update password
// {
//     "email": "bimowahyu1908@gmail.com",
//     "token": "TOKEN_DARI_EMAIL",
//     "newPassword": "passwordbaru123"
// }
