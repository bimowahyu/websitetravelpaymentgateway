require('dotenv').config();
const midtransClient = require("midtrans-client");
const transaksi = require('../model/transaksiModel');
const boking = require('../model/bokingModel');
const user = require('../model/userModel');
const wisata = require('../model/wisataModel');
const { Op, where } = require('sequelize');
const crypto = require('crypto');

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.SERVERKEY,
  clientKey: process.env.CLIENTKEY,
});


exports.getTransaksi = async (req, res) => {
    try {
        const userLogin = req.user;
        if (!userLogin) {
            return res.status(401).json({ message: 'Silahkan login terlebih dahulu' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: transaksiData } = await transaksi.findAndCountAll({
            attributes: [
                'id', 'bookingId', 'midtransOrderId', 'amount', 
                'paymentType', 'status', 'paymentTime', 'createdAt', 'updatedAt'
            ],
            include: [
                {
                    model: boking,
                   // where: { userId: userLogin.id },
                    attributes: [
                        'id', 'userId', 'wisataId', 'tanggalBooking', 
                        'jumlahOrang', 'totalHarga', 'status', 'createdAt', 'updatedAt'
                    ],
                    include: [
                        {
                            model: user,
                            as: 'user',
                            attributes: ['id', 'username', 'email', 'phone']
                        },
                        {
                            model: wisata,
                            attributes: ['id', 'nama', 'lokasi', 'harga']
                        },
                        
                    ]
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: transaksiData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

exports.getTransaksiById = async(req,res)=> {
    try {
        const userLogin = req.user
        if(!userLogin){
            return res.status(401).json({ message: 'Anda harus login terlebih dahulu'})
        }
        const {id} = req.params
        let whereCondition = {id}
        // const dataTransaksi = await transaksi.findOne({
        //     where: {id}
        // })
        if(userLogin.role == 'user'){
            const userBooking = await boking.findOne({
                where: { userId: userLogin.id },
            })
            if (!userBooking) {
                return res.status(403).json({ message: 'Anda tidak memiliki transaksi ini' });
            }

            whereCondition = { id, bookingId: userBooking.id };
        }
        const dataTransaksi = await transaksi.findOne({
            where: whereCondition,
            include: [
                {
                    model: boking,
                    attributes: ['id', 'userId', 'wisataId', 'tanggalBooking', 'jumlahOrang', 'totalHarga', 'status'],
                    include: [
                        {
                            model: user,
                            as: 'user',
                            attributes: ['id', 'username', 'email'],
                        },
                        {
                            model: wisata,
                            attributes: ['id', 'nama', 'lokasi', 'harga'],
                        },
                        
                    ]
                }
            ]
        });

        if (!dataTransaksi) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }
        return res.status(200).json({
            message: 'Transaksi berhasil ditemukan',
            code:200,
            data: dataTransaksi
        })
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}
exports.getTransaksiByBookingId = async(req, res) => {
    try {
        const userLogin = req.user;
        if (!userLogin) {
            return res.status(401).json({ message: 'Anda harus login terlebih dahulu' });
        }
        
        const { bookingId } = req.params;
        
        const dataTransaksi = await transaksi.findOne({
            where: { bookingId: bookingId },
            include: [
                {
                    model: boking,
                    attributes: ['id', 'userId', 'wisataId', 'tanggalBooking', 'jumlahOrang', 'totalHarga', 'status'],
                    include: [
                        {
                            model: user,
                            as: 'user', // Make sure to include the alias
                            attributes: ['id', 'username', 'email'],
                        },
                        {
                            model: wisata,
                            attributes: ['id', 'nama', 'lokasi', 'harga'],
                        },
                    ]
                }
            ]
        });
  
        if (!dataTransaksi) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
        }
        
        return res.status(200).json({
            message: 'Transaksi berhasil ditemukan',
            code: 200,
            data: dataTransaksi
        });
        
    } catch (error) {
        return res.status(500).json(error.message);
    }
  };
  
exports.createTransaksi = async (req, res) => {
    try {
      const { bookingId } = req.body;
  
      if (!bookingId) {
        return res.status(400).json({ message: 'bookingId harus disertakan' });
      }
    //   const existingTransaction = await transaksi.findOne({
    //     where: {
    //         bookingId: bookingId,
    //         status: 'success'
    //     }
    // });

    // if (existingTransaction) {
    //     return res.status(400).json({
    //         message: 'Booking ini sudah memiliki transaksi yang berhasil'
    //     });
    // }
      const dataBoking = await boking.findOne({
        where: { id: bookingId, status: 'pending' },
        include: [
         
          { model: wisata, attributes: ['nama', 'harga', 'lokasi'] },
          { model: user, as: 'user', attributes: ['username', 'email'] }

        ],
      });
  
      if (!dataBoking) {
        return res.status(404).json({ message: 'Booking tidak ditemukan atau tidak pending' });
      }
  
      const orderId = `ORDER-${dataBoking.id}-${Date.now()}`;
      const totalHarga = parseFloat(dataBoking.totalHarga); 
      const userData = dataBoking.user;
  
      if (!userData) {
        return res.status(400).json({ message: 'Data user tidak ditemukan pada booking ini' });
      }
  
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: totalHarga,
        },
        customer_details: {
          first_name: userData.username,
          email: userData.email,
        },
      };
  
      console.log("Parameter Midtrans:", parameter); 
  
      const transaction = await snap.createTransaction(parameter);
      const redirectUrl = transaction.redirect_url;
  
      await transaksi.create({
        bookingId: dataBoking.id,
        midtransOrderId: orderId,
        amount: totalHarga,
        paymentType: 'midtrans',
        status: 'pending',
        paymentTime: null,
      });
  
      return res.status(201).json({
        message: 'Transaksi berhasil dibuat',
        paymentUrl: redirectUrl,
      });
    } catch (error) {
      console.error("Error Server:", error); 
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  };
exports.updateTransaksi = async(req,res) => {
    try {
        const userLogin = req.user
        if(!userLogin){
            return res.status(401).json({message: 'Anda tidak memiliki akses'})
        }
        const {id} = req.params
        const {bookingId,midtransOrderId,amount,paymentType,status} = req.body
        const transaksiUpdate = await transaksi.findOne({
            where:{id}
        })  
        if(!transaksiUpdate){
            return res.status(404).json({message: 'Transaksi tidak ditemukan'})
        }     
        await transaksi.update({
            bookingId,
            midtransOrderId,
            amount,
            paymentType,
            status

        }) 
        return res.status(200).json({
            message: 'Transaksi berhasil diupdate',
            code: 200,
            data: transaksiUpdate
        })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.deleteTransaksi = async(req,res) => {
    try {
        const userLogin = req.user
        if(!userLogin){
            return res.status(401).json({message: 'silahkan login'})
        }
        const {id} = req.params
        const transaksiDelete = await transaksi.findOne({
            where:{id}
        })
        if(!transaksiDelete){
            return res.status(404).json({message: 'Transaksi tidak ditemukan'})
        }
        await transaksi.destroy({where: {id}})
        return res.status(203).json({
            message: 'Transaksi berhasil dihapus',
            code: 203

        })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}