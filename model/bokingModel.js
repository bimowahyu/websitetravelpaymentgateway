const db = require('../config/dataBase')
const {DataTypes} = require('sequelize')

const boking = db.define('boking',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      wisataId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      tanggalBooking: {
        type: DataTypes.DATE,
        allowNull: false
      },
      jumlahOrang: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      totalHarga: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'settlement', 'capture', 'deny', 'cancel', 'expire'),
        defaultValue: 'pending'
      }
    });
module.exports = boking;