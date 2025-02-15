const express = require('express')
const {getKategori,getKategoriById,
    createKategori,
    updateKategori,
    deleteKategori
} = require('../controller/kategoriController')

const {adminOnly, verifyUser} = require('../middleware/userMiddleware')
const router = express.Router()

router.get('/getkategori',getKategori)
router.get('/getkategori/:id',getKategoriById)
router.post('/createkategori',verifyUser,adminOnly,createKategori)
router.put('/updatekategori/:id',verifyUser,adminOnly,updateKategori)
router.delete('/deletekategori/:id',verifyUser,adminOnly,deleteKategori)

module.exports = router