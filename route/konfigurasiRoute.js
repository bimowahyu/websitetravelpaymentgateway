const express = require('express')
const {getKonfigurasi,createKonfigurasi,updateKonfigurasi,deleteKonfigurasi
    ,getSlideImages,updateSlideImage,deleteSlideImage,createSlideImage} = require('../controller/konfigurasiController')


const router = express.Router()

router.get('/getkonfigurasi',getKonfigurasi)
router.post('/createkonfigurasi',createKonfigurasi)
router.put('/updatekonfigurasi',updateKonfigurasi)
router.delete('/deletekonfigurasi',deleteKonfigurasi)


router.get('/getslide',getSlideImages)
router.post('/createslide',createSlideImage)
router.put('/updateslide',updateSlideImage)
router.delete('/deleteslide',deleteSlideImage)

module.exports = router