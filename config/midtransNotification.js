const transaksi = require('../model/transaksiModel');
const { Op } = require('sequelize');

exports.midtransNotification = async (req, res) => {
    try {
        console.log("Midtrans Webhook Data:", req.body);
      const { order_id, transaction_status, fraud_status, settlement_time, transaction_time, payment_type } = req.body;
      let transaksiData = await transaksi.findOne({ where: { midtransOrderId: order_id } });
  
      if (!transaksiData) {
        return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      }
  
      let status = "pending";
      if (transaction_status === "capture") {
        status = fraud_status === "accept" ? "success" : "failed";
      } else if (transaction_status === "settlement") {
        status = "success";
      } else if (transaction_status === "deny") {
        status = "failed";
      } else if (transaction_status === "cancel" || transaction_status === "expire") {
        status = "expired";
      }
  
      await transaksiData.update({
        status,
        paymentType: payment_type,
        paymentTime: settlement_time || transaction_time || new Date(),
      });
  
      console.log(`Transaksi ${order_id} diperbarui ke status: ${status}`);
      return res.status(200).json({ message: 'Notifikasi berhasil diproses' });
    } catch (error) {
      console.error('Error processing notification:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  