const boking = require('./bokingModel')
const user = require('./userModel')
const wisata = require('./wisataModel')
const transaksi = require('./transaksiModel')
const kategori = require('./kategoriModel')
const konfigurasi = require('./konfigurasiModel');
const slideImage = require('./slideModel');

const setupAssociations = () => {
    user.hasMany(boking, {
        foreignKey: 'userId',
        onDelete: 'CASCADE'
    });

    boking.belongsTo(user, {
        foreignKey: 'userId',
        as: 'user'
    });

    wisata.hasMany(boking, {
        foreignKey: 'wisataId',
        onDelete: 'CASCADE'
    });

    boking.belongsTo(wisata, {
        foreignKey: 'wisataId',
    });

    boking.hasOne(transaksi, {
        foreignKey: 'bookingId',
        onDelete: 'CASCADE'
    });

    transaksi.belongsTo(boking, {
        foreignKey: 'bookingId',
    });

    // Relasi kategori dengan wisata
    kategori.hasMany(wisata, { 
        foreignKey: 'kategoriId', 
        onDelete: 'CASCADE' 
    });

    wisata.belongsTo(kategori, { 
        foreignKey: 'kategoriId', 
        as: 'kategori' 
    });
    konfigurasi.hasMany(slideImage, {
        foreignKey: 'konfigurasiId',
        onDelete: 'CASCADE'
    });

    slideImage.belongsTo(konfigurasi, {
        foreignKey: 'konfigurasiId'
    });
}

module.exports = { setupAssociations };
