const express = require('express')
const {getTransaksi,
    getTransaksiById,
    createTransaksi,
    deleteTransaksi,
    updateTransaksi
} = require('../controller/transaksiController')
const {adminOnly, verifyUser} = require('../middleware/userMiddleware')
//const {} = require('../config/midtransNotification')
const {midtransNotification, verifyMidtransSignature} = require('../config/midtransSignature')
const router = express.Router()

router.get('/gettransaksi',verifyUser,getTransaksi)
router.get('/gettransaksibyid/:id',verifyUser,getTransaksiById)
router.post('/createTransaksi',verifyUser,createTransaksi)
router.delete('/deleteTransaksi/:id',verifyUser,deleteTransaksi)
router.put('/updateTransaksi/:id',verifyUser,updateTransaksi)
router.post('/midtrans-notification', verifyMidtransSignature, midtransNotification);
//router.get('/gettransaksinotification/:order_id',getTransaksinotification)

module.exports = router