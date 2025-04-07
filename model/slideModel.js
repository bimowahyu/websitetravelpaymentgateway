const db = require('../config/dataBase');
const { DataTypes } = require('sequelize');
const Konfigurasi = require('./konfigurasiModel');

const SlideImage = db.define('slideImage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    konfigurasiId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Konfigurasi,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    urlGambar: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    urutan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

Konfigurasi.hasMany(SlideImage, { foreignKey: 'konfigurasiId', onDelete: 'CASCADE' });
SlideImage.belongsTo(Konfigurasi, { foreignKey: 'konfigurasiId' });

module.exports = SlideImage;
