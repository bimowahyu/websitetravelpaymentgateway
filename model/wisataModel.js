const db = require('../config/dataBase')
const { DataTypes } = require('sequelize')

const wisata = db.define('wisata',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nama: {
        type: DataTypes.STRING,
        allowNull: false
      },
      deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      lokasi: {
        type: DataTypes.STRING,
        allowNull: false
      },
      harga: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      gambar: {
        type: DataTypes.STRING,
        allowNull: true
      },
      kapasitas: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('tersedia', 'penuh', 'tutup'),
        defaultValue: 'tersedia'
      }
    });
module.exports = wisata    