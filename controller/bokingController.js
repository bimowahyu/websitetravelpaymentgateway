const { where } = require('sequelize')
const boking = require('../model/bokingModel')
const user = require('../model/userModel')
const wisata = require('../model/wisataModel')
// const { Op } = require('sequelize');
const db = require('../config/dataBase');
const { Op, Transaction } = require('sequelize');


exports.getBoking = async(req,res) => {
    try {
        const userLogin = req.user
        if(!userLogin){
            return res.status(401).json({message: 'Unauthorized'})
        }
        
        const page = parseInt(req.query.page) || 1 
        const limit = parseInt(req.query.limit) || 10
        if (page < 1 || limit < 1) {
            return res.status(400).json({ msg: 'Page and limit must be greater than 0' });
        }
        const offset = (page - 1) * limit;
        const { count, rows: dataBooking }= await boking.findAndCountAll({
            //where: { userId: userLogin.id },
            attributes:['id','userId','wisataId','tanggalBooking','jumlahOrang','totalHarga','status'],
            include: [
                {
                    model: user,
                    as: 'user',  
                    attributes: ['id', 'username', 'email', 'phone']
                },
                {
                    model: wisata,
                    attributes: ['id', 'nama', 'deskripsi', 'lokasi', 'harga', 'gambar', 'kapasitas', 'status']
                }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });
    
      
        const totalPages = Math.ceil(count / limit);
        res.status(200).json({
            code: 200, 
            status: 'success',
            data: dataBooking,
            meta: {
                totalItems: count,
                currentPage: page,
                totalPages: totalPages,
                limit: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.getBokingById = async(req,res) => {
    try {
        const userLogin = req.user
        if(!userLogin){
            return res.status(401).json({message: 'Unauthorized'})
        }
        const { id } = req.params
        const bookingData = await boking.findOne({
            where: {id},
            include: [
                {
                    model: user,
                    as: 'user',  
                    attributes: ['id', 'username', 'email', 'phone']
                },
                {
              model: wisata,
              attributes: ['id', 'nama', 'deskripsi', 'lokasi', 'harga', 'gambar', 'kapasitas', 'status']
        }]
        })
        return res.status(200).json({
            message: 'succes get data',
            code: '200',
            data: bookingData
        })
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.createBoking = async (req, res) => {
    try {
        const userLogin = req.user;
        const { wisataId, tanggalBooking, jumlahOrang } = req.body;

        if (!wisataId) {
            return res.status(400).json({ message: 'Harus memilih wisata' });
        }

        const wisataData = await wisata.findOne({
            attributes: ['id', 'harga', 'kapasitas', 'status'],
            where: { id: wisataId },
        });

        if (!wisataData) {
            return res.status(404).json({ message: 'Wisata tidak ditemukan' });
        }

        const hargaPerOrang = wisataData.harga;
        const kapasitas = wisataData.kapasitas;
        const statusTempat = wisataData.status;

        if (statusTempat === 'penuh' || statusTempat === 'tutup') {
            return res.status(400).json({ message: 'Tempat tidak tersedia untuk booking' });
        }

        // Parse tanggalBooking ke Date object
        const tanggalBookingDate = new Date(tanggalBooking);
        const startOfDay = new Date(tanggalBookingDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(tanggalBookingDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Ambil semua booking pada tanggal tersebut (tanpa memandang waktu)
        const existingBookings = await boking.findAll({
            where: {
                wisataId,
                tanggalBooking: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: {
                    [Op.in]: ['pending', 'settlement', 'capture']
                }
            },
            attributes: ['jumlahOrang', 'status']
        });

        const totalOrangBooking = existingBookings.reduce((total, booking) => {
            return total + booking.jumlahOrang;
        }, 0);

        const sisaKapasitas = kapasitas - totalOrangBooking;

        if (jumlahOrang > sisaKapasitas) {
            return res.status(400).json({
                message: `Tidak dapat melakukan booking. Kapasitas tersisa: ${sisaKapasitas} orang, permintaan booking: ${jumlahOrang} orang.`
            });
        }

        const totalHarga = hargaPerOrang * jumlahOrang;

        const bookingData = await boking.create({
            userId: userLogin.id,
            wisataId,
            tanggalBooking: tanggalBookingDate, // Simpan sebagai Date object
            jumlahOrang,
            totalHarga,
            status: 'pending',
        });

        // Update status wisata jika kapasitas penuh
        if (totalOrangBooking + jumlahOrang >= kapasitas) {
            await wisata.update(
                { status: 'penuh' },
                { where: { id: wisataId } }
            );
        }

        return res.status(201).json({
            message: 'Booking berhasil dibuat',
            booking: bookingData,
            sisaKapasitas: kapasitas - (totalOrangBooking + jumlahOrang)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

exports.updateBoking = async(req,res) => {
    try {
        const userLogin = req.user
        const {id} = req.params
        const {wisataId , tanggalBooking, jumlahOrang, status} = req.body

        const bookingData = await boking.findOne({
            where: {id, userId: userLogin.id},
            include: [
                { model: user, as:'user',  },
                { model: wisata },
               
            ]
        })
        if (!bookingData) {
            return res.status(404).json({ message: 'Booking tidak ditemukan' });
        }
        if(bookingData.status == 'settlement'){
            return res.status(400).json({ message: 'Booking sudah lunas' });
        }
        let hargaPerOrang = 0;
        let kapasitas = 0;
        let statusTempat = '';
        if (wisataId) {
            const wisataData = await wisata.findOne({
                where: { id: wisataId },
            });
            if (!wisataData) {
                return res.status(404).json({ message: 'Wisata tidak ditemukan' });
            }
            hargaPerOrang = wisataData.harga;
            kapasitas = wisataData.kapasitas;
            statusTempat = wisataData.status;
        }
    if (jumlahOrang > kapasitas) {
        return res.status(400).json({ message: 'Jumlah orang melebihi kapasitas' });
    }
    if (statusTempat === 'penuh' || statusTempat === 'tutup') {
        return res.status(400).json({ message: 'Tempat tidak tersedia untuk booking' });
    }
    const totalHarga = hargaPerOrang * jumlahOrang;
    await bookingData.update({
        wisataId: wisataId || null,
        tanggalBooking,
        jumlahOrang,
        totalHarga,
        status: status || bookingData.status 
    });
    return res.status(200).json({
        message: 'Booking berhasil diperbarui',
        booking: bookingData,
    });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

exports.deleteBoking = async(req,res)=> {
    try {
        
    } catch (error) {
        
    }
}