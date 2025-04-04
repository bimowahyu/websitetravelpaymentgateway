const db = require('../config/dataBase')
const { DataTypes } = require('sequelize')

const user = db.define('user',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role:{
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      resetToken:{
        type: DataTypes.STRING,
        allowNull: true
      },
      resetTokenExpires:{
        type: DataTypes.DATE,
        allowNull: true
      }
    });

module.exports = user