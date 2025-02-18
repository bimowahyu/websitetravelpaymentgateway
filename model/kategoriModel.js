const db = require('../config/dataBase')
const {DataTypes} = require('sequelize')

const kategori = db.define('kategori',{
    namaKategori:{
        type: DataTypes.STRING,
        allowNull: false
    }
})

module.exports = kategori