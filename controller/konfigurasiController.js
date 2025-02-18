const fs = require('fs');
const path = require('path');
const Konfigurasi = require('../model/konfigurasiModel');
const SlideImage = require('../model/slideModel')

const uploadDir = path.join(__dirname, '..', 'uploads/config');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const saveImage = (file) => {
    if (!file) return null;

    const fileName = Date.now() + path.extname(file.name);
    const fullPath = path.join(uploadDir, fileName);

    fs.writeFileSync(fullPath, file.data);
    return `/uploads/config/${fileName}`;
};
exports.getKonfigurasi = async (req, res) => {
    try {
        const konfigurasi = await Konfigurasi.findOne();
        
        if (!konfigurasi) {
            return res.status(404).json({
                status: 'error',
                message: 'Konfigurasi tidak ditemukan'
            });
        }

        res.status(200).json({
            status: 'success',
            data: konfigurasi
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.createKonfigurasi = async (req, res) => {
    try {
        const existingConfig = await Konfigurasi.findOne();
        if (existingConfig) {
            return res.status(400).json({
                status: 'error',
                message: 'Konfigurasi sudah ada, gunakan update untuk mengubahnya'
            });
        }

        const { namaTravel, alamatTravel, noTelpTravel, tentangKami, text,email,footer } = req.body;

        const logoTravel = req.files?.logoTravel ? saveImage(req.files.logoTravel) : null;
        const background = req.files?.background ? saveImage(req.files.background) : null;

        const konfigurasi = await Konfigurasi.create({
            namaTravel,
            alamatTravel,
            noTelpTravel,
            tentangKami,
            text
            ,email,footer,
            logoTravel,
            background
        });

        res.status(201).json({
            status: 'success',
            data: konfigurasi
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.updateKonfigurasi = async (req, res) => {
    try {
        const konfigurasi = await Konfigurasi.findOne();
        
        if (!konfigurasi) {
            return res.status(404).json({
                status: 'error',
                message: 'Konfigurasi tidak ditemukan'
            });
        }

        let { namaTravel, alamatTravel, noTelpTravel, text, tentangKami,email,footer } = req.body;

        let logoTravel = konfigurasi.logoTravel;
        let background = konfigurasi.background;

        if (req.files?.logoTravel) {
            if (logoTravel) {
                const oldLogoPath = path.join(__dirname, '..', logoTravel);
                if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
            }
            logoTravel = saveImage(req.files.logoTravel);
        }

        if (req.files?.background) {
            if (background) {
                const oldBgPath = path.join(__dirname, '..', background);
                if (fs.existsSync(oldBgPath)) fs.unlinkSync(oldBgPath);
            }
            background = saveImage(req.files.background);
        }

        await konfigurasi.update({ namaTravel, alamatTravel, noTelpTravel, tentangKami, text, logoTravel, background,email,footer });

        res.status(200).json({
            status: 'success',
            data: konfigurasi
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.deleteKonfigurasi = async (req, res) => {
    try {
        const konfigurasi = await Konfigurasi.findOne();
        
        if (!konfigurasi) {
            return res.status(404).json({
                status: 'error',
                message: 'Konfigurasi tidak ditemukan'
            });
        }

        if (konfigurasi.logoTravel) {
            const logoPath = path.join(__dirname, '..', konfigurasi.logoTravel);
            if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
        }

        if (konfigurasi.background) {
            const bgPath = path.join(__dirname, '..', konfigurasi.background);
            if (fs.existsSync(bgPath)) fs.unlinkSync(bgPath);
        }

        await konfigurasi.destroy();

        res.status(200).json({
            status: 'success',
            message: 'Konfigurasi berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};


exports.getSlideImages = async (req, res) => {
    try {
        const slides = await SlideImage.findAll({ order: [['urutan', 'ASC']] });

        res.status(200).json({
            status: 'success',
            data: slides
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.createSlideImage = async (req, res) => {
    try {
        const { konfigurasiId, deskripsi, urutan } = req.body;
        const konfigurasi = await Konfigurasi.findByPk(konfigurasiId);
        if (!konfigurasi) {
            return res.status(404).json({
                status: 'error',
                message: 'Konfigurasi tidak ditemukan'
            });
        }
        const urlGambar = req.files?.urlGambar ? saveImage(req.files.urlGambar) : null;

        const slideImage = await SlideImage.create({
            konfigurasiId,
            urlGambar,
            deskripsi,
            urutan
        });

        res.status(201).json({
            status: 'success',
            data: slideImage
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.updateSlideImage = async (req, res) => {
    try {
        const { id } = req.params;
        const slideImage = await SlideImage.findByPk(id);

        if (!slideImage) {
            return res.status(404).json({
                status: 'error',
                message: 'Slide image tidak ditemukan'
            });
        }

        let urlGambar = slideImage.urlGambar;

        if (req.files?.urlGambar) {
            if (urlGambar) {
                const oldImagePath = path.join(__dirname, '..', urlGambar);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }

            urlGambar = saveImage(req.files.urlGambar);
        }

        await slideImage.update({
            ...req.body,
            urlGambar
        });

        res.status(200).json({
            status: 'success',
            data: slideImage
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.deleteSlideImage = async (req, res) => {
    try {
        const { id } = req.params;
        const slideImage = await SlideImage.findByPk(id);

        if (!slideImage) {
            return res.status(404).json({
                status: 'error',
                message: 'Slide image tidak ditemukan'
            });
        }
        if (slideImage.urlGambar) {
            const imagePath = path.join(__dirname, '..', slideImage.urlGambar);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await slideImage.destroy();

        res.status(200).json({
            status: 'success',
            message: 'Slide image berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};