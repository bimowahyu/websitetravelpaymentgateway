const boking = require('./bokingModel')
const user = require('./userModel')
const wisata = require('./wisataModel')
const transaksi = require('./transaksiModel')


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
}

module.exports = { setupAssociations };