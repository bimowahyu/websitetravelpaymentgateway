const wisata = require('../model/wisataModel')
const user = require('../model/userModel')
const { where } = require('sequelize')
const path = require('path');
const fs = require('fs').promises;
const moment = require('moment');

exports.getWisata = async(req,res) => {
    try {
        const Wisata = await wisata.findAll({
            attributes: ['id','nama','deskripsi','lokasi','harga','gambar','kapasitas','status']
        })
        return res.status(200).json({
            code: '200',
            status: 'success',
            data: Wisata
        })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.getWisataById = async(req,res) => {
    try {
        const {id} = req.params
        const Wisata = await wisata.findOne({
            where: {id}

        })
        if(!Wisata){
            return res.status(404).json('wisata not found')
        }
        return res.status(200).json(
            {
                code: '200',
                status: 'success',
                data: Wisata
            }
        )
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.createWisata = async(req,res) => {
    try {
        const userLogin = req.user;
        if (!userLogin) {
            return res.status(401).json({message: 'Unauthorized'})
        }
        const {nama, deskripsi, lokasi, harga, kapasitas, status} = req.body
        console.log(req.files);
        if (!req.files || !req.files.image) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        console.log(req.files);

        const file = req.files.image; 
        const ext = path.extname(file.name).toLowerCase();
        const allowedTypes = ['.png', '.jpg', '.jpeg'];
        if (!allowedTypes.includes(ext)) {
            return res.status(422).json({ msg: 'Invalid file type. Allowed: .png, .jpg, .jpeg' });
        }
        const fileSize = file.size;
        if (fileSize > 1 * 1024 * 1024) { // 1mb
            return res.status(422).json({ msg: 'File size must be less than 1mb' });
        }
        const tglPembuatan = moment().format('YYYY-MM-DD');
        const fileName = `${nama}-${tglPembuatan}-${Date.now()}${ext}`;
        const uploadPath = path.join(__dirname, '../public/uploads/wisata');
        const filePath = path.join(uploadPath, fileName);
        try {
            await fs.access(uploadPath); 
        } catch (error) {
            await fs.mkdir(uploadPath, { recursive: true }); 
        }
        await file.mv(filePath);
        const createWisata = {
            nama: nama,
            deskripsi: deskripsi,
            lokasi: lokasi,
            harga: harga,
            gambar: fileName,
            kapasitas: kapasitas,
            status: status
        }
        console.log(createWisata)
        await wisata.create(createWisata)
        return res.status(201).json({
            msg: 'Wisata created successfully',
            code: '200',
            data: createWisata
        })
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.updateWisata = async(req,res) => {
    try {
        const userLogin = req.user;
        if (!userLogin) {
            return res.status(401).json({message: 'Unauthorized'})
        }
        const {id} = req.params
        const { nama, deskripsi, lokasi, harga, kapasitas, status } = req.body;
        const WisataUpdate = await wisata.findOne({
            where: {id}
        })
        if(!WisataUpdate){
            return res.status(404).json('wisata not found')
        }
        let fileName = WisataUpdate.gambar
        if(req.files && req.files.image){
            const file = req.files.image
            const ext = path.extname(file.name).toLowerCase();
            const allowedTypes = ['.png', '.jpg', '.jpeg'];
            if (!allowedTypes.includes(ext)) {
                return res.status(422).json({ msg: 'Invalid file type. Allowed: .png, .jpg, .jpeg' });
            }

            const fileSize = file.size;
            if (fileSize > 1 * 1024 * 1024) { // 1MB
                return res.status(422).json({ msg: 'File size must be less than 1MB' });
            }
            const tglPembuatan = moment().format('YYYY-MM-DD');
            fileName = `${nama}-${tglPembuatan}-${Date.now()}${ext}`;
            const uploadPath = path.join(__dirname, '../public/uploads/wisata');
            const filePath = path.join(uploadPath, fileName);

            try {
                await fs.access(uploadPath);
            } catch (error) {
                await fs.mkdir(uploadPath, { recursive: true });
            }

            await file.mv(filePath);
            if (WisataUpdate.gambar) {
                const oldFilePath = path.join(__dirname, '../public/uploads/wisata', WisataUpdate.gambar);
                try {
                    await fs.unlink(oldFilePath);
                } catch (err) {
                    console.log("Gagal menghapus gambar lama:", err.message);
                }
            }
        }
        await WisataUpdate.update({
            nama,
            deskripsi,
            lokasi,
            harga,
            gambar: fileName,
            kapasitas,
            status
        });

        return res.status(200).json({
            msg: 'Wisata updated successfully',
            code: '200',
            data: WisataUpdate
        });

        
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.deleteWisata = async(req,res) => {
    try {
        const userLogin = req.user;
        if (!userLogin) {
            return res.status(401).json({message: 'Unauthorized'})
        }
        const {id} = req.params
        const WisataDelete = await wisata.findOne({
            where:{ id }
        })
        if(!WisataDelete){
            return res.status(404).json('widata tidak di temukan')
        }
        await wisata.destroy()
        return res.status(203).json('wisata berhasil di hapus')
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}