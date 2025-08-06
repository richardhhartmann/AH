const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuração das credenciais do Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuração do armazenamento com multer-storage-cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        // Lógica para determinar a pasta e o tipo de recurso com base no tipo de arquivo
        let folder;
        let resource_type;
        let allowed_formats;

        if (file.mimetype.startsWith('image')) {
            folder = 'aesthete/images';
            resource_type = 'image';
            allowed_formats = ['jpeg', 'png', 'jpg', 'gif'];
        } else if (file.mimetype.startsWith('audio')) {
            folder = 'aesthete/audio';
            // --- AQUI ESTÁ A CORREÇÃO CRÍTICA ---
            // 'video' é o tipo de recurso que o Cloudinary usa para processar arquivos com duração (áudio ou vídeo)
            resource_type = 'video'; 
            allowed_formats = ['mp3', 'webm', 'wav', 'm4a', 'ogg'];
        } else {
            folder = 'aesthete/others';
            resource_type = 'auto';
        }

        return {
            folder: folder,
            resource_type: resource_type,
            allowed_formats: allowed_formats
        };
    }
});

// Cria a instância do multer com a configuração de armazenamento
const upload = multer({ storage: storage });

module.exports = upload;