const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aesthete_posts',
    format: async (req, file) => {
        if (file.mimetype.startsWith('video')) {
            return 'mp4';
        }
        return 'jpg';
    },
    resource_type: 'auto', // Permite que o Cloudinary detete se é imagem ou vídeo
    public_id: (req, file) => {
      const originalName = file.originalname.split('.')[0];
      return `${req.user.id}_${originalName}_${Date.now()}`;
    },
  },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // Aumenta o limite para 100MB para vídeos
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de ficheiro não suportado! Apenas imagens e vídeos são permitidos.'), false);
        }
    }
});

module.exports = upload;