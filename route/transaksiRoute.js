const express = require('express')
const {getTransaksi,
    getTransaksiById,
    createTransaksi,
    deleteTransaksi,
    updateTransaksi,
    getTransaksiByBookingId
} = require('../controller/transaksiController')
const {adminOnly, verifyUser} = require('../middleware/userMiddleware')
//const {} = require('../config/midtransNotification')
const {midtransNotification, verifyMidtransSignature} = require('../config/midtransSignature')
const router = express.Router()

router.get('/gettransaksi',verifyUser,getTransaksi)
router.get('/gettransaksibyid/:id',verifyUser,getTransaksiById)
router.get('/gettransaksibybookingid/:bookingId', verifyUser,getTransaksiByBookingId);
router.post('/createTransaksi',verifyUser,createTransaksi)
router.delete('/deleteTransaksi/:id',verifyUser,adminOnly,deleteTransaksi)
router.put('/updateTransaksi/:id',verifyUser,updateTransaksi)
router.post('/midtrans-notification', verifyMidtransSignature, midtransNotification);
//router.get('/gettransaksinotification/:order_id',getTransaksinotification)

module.exports = router