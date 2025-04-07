const express = require('express')
const {getKonfigurasi,createKonfigurasi,updateKonfigurasi,deleteKonfigurasi
    ,getSlideImages,updateSlideImage,deleteSlideImage,createSlideImage,getSlideImagesById} = require('../controller/konfigurasiController')
const {verifyUser, adminOnly} = require('../middleware/userMiddleware')

const router = express.Router()

router.get('/getkonfigurasi',getKonfigurasi)
router.post('/createkonfigurasi',verifyUser,adminOnly,createKonfigurasi)
router.put('/updatekonfigurasi',verifyUser,adminOnly,updateKonfigurasi)
router.delete('/deletekonfigurasi',verifyUser,adminOnly,deleteKonfigurasi)


router.get('/getslide',getSlideImages)
router.get('/getslide/:id',getSlideImagesById)
router.post('/createslide',verifyUser,adminOnly,createSlideImage)
router.put('/updateslide/:id',verifyUser,adminOnly,updateSlideImage)
router.delete('/deletesl/:id',verifyUser,adminOnly,deleteSlideImage)

module.exports = router