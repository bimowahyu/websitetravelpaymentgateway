const user = require('../model/userModel')
const boking = require('../model/bokingModel')
const transaksi = require('../model/transaksiModel')
const argon2 = require('argon2')
const { where } = require('sequelize')

exports.getUser = async(req,res) => {
   try {
    const User = req.user;
    if(!User){
        return res.status(401).json({message: 'Unauthorized'})
    }
    const page = parseInt(req.query.page) || 1 
    const limit = parseInt(req.query.limit) || 10
    if (page < 1 || limit < 1) {
        return res.status(400).json({ msg: 'Page and limit must be greater than 0' });
    }
    const offset = (page - 1) * limit;
    const { count, rows: users } = await user.findAndCountAll({
        attributes: ['id', 'username', 'email', 'password', 'phone', 'role'],
        include: [{
            model: boking,
            attributes: ['id', 'userId', 'wisataId', 'tanggalBooking', 'jumlahOrang', 'totalHarga', 'status', 'createdAt'],
            include: [{
                model: transaksi,
                attributes: ['id', 'bookingId', 'midtransOrderId', 'amount', 'paymentType', 'status', 'paymentTime', 'createdAt']
            }]
        }],
        limit: limit,
        offset: offset,
        //order: [['createdAt', 'DESC']]
        });
        const totalPages = Math.ceil(count / limit);
        res.status(200).json({
            code: 200, 
            status: 'success',
            data: users,
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
    console.error('Error fetching users:', error);
    res.status(500).json({ 
        code: 500,
        status: 'error',
        message: 'Internal server error'
    });
    
   }
}

exports.getUserById = async(req,res) => {
    try {
        const User = await user.findOne({
            where: { id: req.params.id },
        })
        if (!User) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json({
            code: 200,
            status: 'success',
            data: User
        })
        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}
exports.createUser = async(req,res) =>{
    try {
        const {username, email, password, role, phone} = req.body;
        if(!username || !email|| !password || !role || !phone){
            return res.status(400).json({msg: 'Please fill in all fields'})
        }
        const hashpassword = await argon2.hash(password)
        const User = await user.create({
            username,
            email,
            password: hashpassword,
            role,
            phone
        })
        return res.status(201).json({
            code: 201,
            status: 'success',
            data: User
        })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.registers = async(req,res) => {
    try {
        const {username, email, password, role, phone} = req.body;
        if(!username || !email|| !password || !role || !phone){
            return res.status(400).json({msg: 'Please fill in all fields'})
        }
        const hashpassword = await argon2.hash(password)
        const User = await user.create({
            username,
            email,
            password: hashpassword,
            role:'user',
            phone
        })
        return res.status(201).json({
            code: 201,
            status: 'success',
            data: User
        })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.updateUser = async(req, res) => {
    const { username, email, password, role, phone } = req.body;
    try {
        const User = await user.findOne({
            where: { id: req.params.id }
        });

        if (!User) {
            return res.status(404).json({
                code: 404,
                status: 'error',
                message: 'User not found'
            });
        }
        let updateData = {
            username: username || User.username,
            email: email || User.email,
            role: role || User.role,
            phone: phone || User.phone
        };
        if (password && password.trim() !== '') {
            updateData.password = await argon2.hash(password);
        }
        await user.update(updateData, {
            where: { id: req.params.id }
        });
        const updatedUser = await user.findOne({
            where: { id: req.params.id },
            attributes: ['id', 'username', 'email', 'role', 'phone', 'createdAt', 'updatedAt']
        });

        return res.status(200).json({
            code: 200,
            status: 'success',
            message: 'User updated successfully',
            data: updatedUser
        });
        
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
}

exports.deleteUser = async(req,res) => {
    try {
        const {id} = req.params
        const User = await user.findOne({where: {id}})
        if(!User){
            return res.status(404).json('user not found')
        }
        await user.destroy({where:{id}})
        return res.status(202).json({
            message:'user delete succes',
            code: 202,
        })        
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

