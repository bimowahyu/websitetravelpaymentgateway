const { where } = require('sequelize');
const user = require('../model/userModel')
const argon2 = require('argon2');


const validateLoginInput = (username, password) => {
    const errors = {};
    if (!username || username.trim() === '') {
        errors.username = "Username harus diisi.";
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
        errors.username = "Username hanya boleh mengandung huruf dan angka saja.";
    }
    if (!password || password.trim() === '') {
        errors.password = "Password harus diisi.";
    } else if (password.length < 4) {
        errors.password = "Password minimal harus 4 karakter.";
    }
    return errors;
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const errors = validateLoginInput(username, password);
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ msg: "Validasi gagal.", errors });
    }

    try {
        const userLogin = await user.findOne({
            where: { username },
            attributes: ['id', 'username', 'password', 'role', 'phone']
        });

        if (!userLogin) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const match = await argon2.verify(userLogin.password, password);
        if (!match) {
            return res.status(401).json({ message: 'Password salah' });
        }

        req.session.userId = userLogin.id;
        req.session.userRole = userLogin.role;
        req.session.save(); 

        console.log("Session after login:", req.session);
        res.status(200).json({
            id: userLogin.id,
            username: userLogin.username,
            role: userLogin.role
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


exports.me = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ msg: "Anda belum login." });
    }

    try {
        const dataUser = await user.findOne({
            attributes: ['id', 'username', 'role', 'phone', 'email'],
            where: { id: req.session.userId }
        });

        if (!dataUser) {
            return res.status(404).json({ message: "User tidak ditemukan atau session tidak valid." });
        }

        return res.status(200).json({
            message: 'Success get user',
            code: '200',
            data: dataUser
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.logOut = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout Error:", err);
            return res.status(500).json({ message: "Terjadi kesalahan saat logout" });
        }

        res.status(200).json({ msg: "Berhasil logout" });
    });
};
