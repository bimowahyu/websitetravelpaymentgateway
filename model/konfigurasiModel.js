const db = require('../config/dataBase')
const {DataTypes} = require('sequelize')

const konfigurasi = db.define('konfigurasi',{
    namaTravel:{
        type: DataTypes.STRING,
        allowNull: false
    },
    alamatTravel:{
        type: DataTypes.STRING,
        allowNull: false
    },
    noTelpTravel:{
        type: DataTypes.STRING,
        allowNull: false
    },
    tentangKami:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    text:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false
    },
    footer:{
        type: DataTypes.STRING,
        allowNull: false
    },
    logoTravel:{
        type: DataTypes.STRING,
        allowNull: false
    },
    background:{
        type: DataTypes.STRING,
        allowNull: false
    }


})
module.exports = konfigurasi