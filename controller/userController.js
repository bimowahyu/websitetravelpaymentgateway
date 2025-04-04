const user = require('../model/userModel')
const boking = require('../model/bokingModel')
const transaksi = require('../model/transaksiModel')
const argon2 = require('argon2')
const nodemailer = require('nodemailer');
const crypto = require("crypto");
require('dotenv').config();


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



exports.registers = async(req,res) =>{
    try {
        const {username, email, phone} = req.body
        if (!username || !email  || !phone) {
            return res.status(400).json({ msg: 'Please fill in all fields' });
        }
        const defaultPassword = Math.random().toString(36).slice(-8)
        const hashpassword = await argon2.hash(defaultPassword)

        const validateEmail = (email) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };
        
        if (!validateEmail(email)) {
            return res.status(400).json({ msg: "Invalid email format" });
        }

        const existingUser = await user.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ msg: "Email already exists" });
        }
        const User = await user.create({
            username,
            email,
            password: hashpassword,
            role: 'user',
            phone
        });
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS,
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome! Your Default Password',
            text: `Hello ${username},\n\nYour account has been created successfully!\n\nYour default password is: ${defaultPassword}\n\nPlease change your password after logging in.\n\nBest Regards,\nYour App Team`
        };
        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            code: 201,
            status: 'success',
            message: 'User registered successfully. Default password sent to email if not on your email please check spam file.',
            data: User
        });
        
    } catch (error) {
        return res.status(500).json({ logerror: error.message });
    }
}
exports.resetPassword = async(req,res)=> {
    try {
        const {username, email} = req.body
        if (!username || !email ) {
            return res.status(400).json({ msg: 'Please fill in all fields' });
        }
        const findUser = await user.findOne({
            where: {
                username, email
            }
        })
        if(!findUser){
            return res.status(404).json({ msg: 'Data not found' });
        }
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = await argon2.hash(resetToken);
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
        findUser.resetToken = resetTokenHash;
        findUser.resetTokenExpires = resetTokenExpires;
        await findUser.save();
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;
        const mailOptions = {
            from: `"Your App Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset Request",
            html: `
                <p>Hello <strong>${username}</strong>,</p>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a href="${resetLink}" target="_blank">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Best Regards,<br><strong>Your App Team</strong></p>
            `,
        };
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            msg: "Password reset link has been sent to your email.",
        });

        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
exports.updatePassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({ msg: "Please fill in all fields" });
        }

        const findUser = await user.findOne({ where: { email } });
        if (!findUser) {
            return res.status(404).json({ msg: "User not found" });
        }
        const isTokenValid = await argon2.verify(findUser.resetToken, token);
        const isTokenExpired = new Date() > new Date(findUser.resetTokenExpires);

        if (!isTokenValid || isTokenExpired) {
            return res.status(400).json({ msg: "Invalid or expired token" });
        }
        const hashNewPassword = await argon2.hash(newPassword);
        findUser.password = hashNewPassword;
        findUser.resetToken = null; 
        findUser.resetTokenExpires = null;
        await findUser.save();

        return res.status(200).json({ msg: "Password has been updated successfully." });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

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

