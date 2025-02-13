const db = require('../config/dataBase')
const {DataTypes} = require('sequelize')

const transaksi = db.define('transaksi',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      midtransOrderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      paymentType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'success', 'failed', 'expired'),
        defaultValue: 'pending'
      },
      paymentTime: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });
module.exports = transaksi