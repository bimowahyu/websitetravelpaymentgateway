const { where } = require('sequelize')
const kategori = require('../model/kategoriModel')
const user = require('../model/userModel')
const wisata = require('../model/wisataModel')

exports.getKategori = async(req,res) => {
    try {
        const kategoriData = await kategori.findAll()
        if(!kategoriData){
            return res.status(404).json({message: 'Kategori tidak ditemukan'})
        }
        return res.status(200).json({
            message: 'success get kategori',
            code: 200,
            data: kategoriData
        })
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.getKategoriById = async(req,res) => {
    try {
        const {id} = req.params
        const kategoriData = await kategori.findOne({
            where:{id}
        })
        if(!kategoriData){
            return res.status(404).json({message: 'Kategori tidak ditemukan'})
        }
        return res.status(200).json({
            message:'succes get kategori id',
            code: 200,
            data: kategoriData
        })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.createKategori = async (req,res)=> {
    try {
        const userLogin = req.user
        if(!userLogin){
            return res.status(401).json({message: 'anda harus login terlebih dahulu'})
        }
        const {namaKategori} = req.body
        const kategoriData = await kategori.create({
            namaKategori,
        })
        return res.status(201).json({
            message: 'succes create kategori',
            code: 201,
            data: kategoriData
        })
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.updateKategori = async (req,res) => {
    try {
        const userLogin = req.user
        if(!userLogin){
            return res.status(401).json({message: 'anda harus login terlebih dahulu'})
        }
        const {id} = req.params
        const {namaKategori} = req.body
        const updateKategori = await kategori.findOne({
            where: {id}
        })
        if(!updateKategori){
            return res.status(404).json({message: 'Kategori tidak ditemukan'})
        }
      await updateKategori.update({
            namaKategori
        })
        return res.status(203).json({
            message: 'succes update kategori',
            code: 203,
            data: updateKategori
        })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.deleteKategori = async(req,res) => {
    try {
        const userLogin = req.user
        if(!userLogin){
            return res.status(401).json({message: 'anda harus login terlebih dahulu'})
        }
        const {id} = req.params
        await wisata.update(
            {kategoriId : null},
            {where : {kategoriId: id}}
        )
        const deleteKategori = await kategori.findOne({
            where: {id}
        })
        if(!deleteKategori){
            return res.status(404).json({message: 'Kategori tidak ditemukan'})
        }
        await kategori.destroy({ where: { id } })
        return res.status(202).json({
            message: 'succes delete kategori',
            code: 202

        })
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}