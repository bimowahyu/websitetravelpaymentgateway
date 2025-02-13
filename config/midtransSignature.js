require('dotenv').config();
const crypto = require('crypto');
const transaksi = require('../model/transaksiModel')
const { Op } = require('sequelize');
const boking = require('../model/bokingModel')

exports.verifyMidtransSignature = (req, res, next) => {
  try {
    const serverKey = process.env.SERVERKEY;
    const { signature_key, order_id, status_code, gross_amount } = req.body;

    const hashString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const generatedSignature = crypto.createHash('sha512').update(hashString).digest('hex');

    if (generatedSignature === signature_key) {
      next();
    } else {
      return res.status(403).json({ message: 'Signature tidak valid' });
    }
  } catch (error) {
    console.error('Error verifying signature:', error);
    return res.status(500).json({ message: 'Kesalahan pada verifikasi signature' });
  }
};

 
  exports.midtransNotification = async (req, res) => {
    console.log("Midtrans Webhook Data:", req.body);
    try {
      const {
        order_id,
        transaction_status,
        fraud_status,
        transaction_time,
        settlement_time,
        payment_type
      } = req.body;
  
      // ------------Handle test notifications---------------------
      if (order_id && order_id.startsWith('payment_notif_test_')) {
        console.log('Received test notification from Midtrans');
        return res.status(200).json({
          status: true,
          message: 'Test notification received successfully'
        });
      }
      let transaksiData = await transaksi.findOne({
        where: { midtransOrderId: order_id }
      })
      if (!transaksiData && order_id && order_id.includes('_')) {
        const alternativeId = order_id.split('_').pop();
        transaksiData = await transaksi.findOne({
          where: { 
            [Op.or]: [
              { id: alternativeId },
              { order_id: alternativeId }
            ]
          }
        });
      }
  
      if (!transaksiData) {
        console.error(`Transaksi dengan order_id ${order_id} tidak ditemukan`);
        return res.status(404).json({
          status: false,
          message: 'Transaksi tidak ditemukan'
        });
      }
  
  
      let status = "pending";
      if (transaction_status === "capture" || transaction_status === "settlement") {
        status = "success";
      } else if (transaction_status === "deny") {
        status = "failed";  
      } else if (transaction_status === "cancel" || transaction_status === "expire") {
        status = "expired"; 
      }
  
     
      await transaksi.update({
        status: status,
        paymentType: payment_type,
        paymentTime: settlement_time || transaction_time,
        updatedAt: settlement_time || transaction_time || new Date()
      }, {
        where: { id: transaksiData.id } 
      });
      if (status === "success") {
        await boking.update({
            status: transaction_status,
        }, {
            where: { id: transaksiData.bookingId }
        });
        
        console.log(`Booking ID ${transaksiData.bookingId} status updated to ${transaction_status}`);
    }

      console.log(`Transaksi ${order_id} berhasil diupdate ke status: ${status}`);
      console.log('Status Update:', {
        orderId: order_id,
        oldStatus: transaksiData.status,
        newStatus: status,
        transactionStatus: transaction_status,
        updateTime: settlement_time || transaction_time,
        bookingId: transaksiData.bookingId
      });
      return res.status(200).json({
        status: true,
        message: 'Notifikasi berhasil diproses'
      });
  
    } catch (error) {
      console.error('Error processing notification:', error);
      return res.status(500).json({
        status: false,
        message: 'Internal Server Error'
      });
    }
  };