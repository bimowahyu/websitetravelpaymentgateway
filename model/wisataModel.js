const db = require('../config/dataBase')
const { DataTypes } = require('sequelize')
const kategori = require('./kategoriModel')

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
      pemberangkatan: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('tersedia', 'penuh', 'tutup'),
        defaultValue: 'tersedia'
      },
      kategoriId: {  
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: kategori,
            key: 'id'
        }
    }
    });
module.exports = wisata    