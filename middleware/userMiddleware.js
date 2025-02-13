const user = require('../model/userModel')

exports.verifyUser = async (req, res, next) => {
  try {
      if (!req.session?.userId) {
          return res.status(401).json({
              status: false,
              message: "Silahkan login terlebih dahulu"
          });
      }

      const userLogin = await user.findOne({
          where: { id: req.session.userId }
      });

      if (!userLogin) {
          return res.status(401).json({ message: 'Silahkan login' });
      }

      req.user = userLogin;
      next();

  } catch (error) {
      return res.status(500).json({ message: error.message });
  }
};


exports.adminOnly = async (req, res, next) => {
  try {
      if (!req.user || req.user.role !== 'admin') {
          return res.status(403).json({
              status: false,
              message: "Akses ditolak. Hanya admin yang diizinkan."
          });
      }

      next();

  } catch (error) {
      console.error("Admin Only Error:", error);
      return res.status(500).json({
          status: false,
          message: "Terjadi kesalahan pada server"
      });
  }
};
