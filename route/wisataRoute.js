const express = require('express')
const {
    getWisata,
    getWisataById,
    createWisata,
    updateWisata,
    deleteWisata
} = require('../controller/wisataController')
const {adminOnly, verifyUser} = require('../middleware/userMiddleware')

const router = express.Router()

router.get('/getwisata',getWisata)
router.get('/getwisata/:id',getWisataById)
router.post('/createwisata',verifyUser,adminOnly,createWisata)
router.put('/updatewisata/:id',verifyUser,adminOnly,updateWisata)
router.delete('/deletewisata/:id',verifyUser,adminOnly,deleteWisata)

module.exports = router