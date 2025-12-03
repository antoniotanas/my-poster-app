// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function uploadImage(imageSource: string, folder: string = 'events', customPublicId?: string): Promise<string> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) throw new Error("Missing Cloudinary Config");

    return new Promise((resolve, reject) => {
        // Creiamo opzioni sicure
        const fileName =
            customPublicId || `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
       const uploadOptions: any = {
            folder: folder,
            public_id: fileName,
            resource_type: 'auto',
            type: "upload",
            upload_preset: "Ustica-info-hub",   // 👈 usa il nome esatto del preset
            format: 'jpg',
            transformation: [{ quality: '90', fetch_format: 'auto' }]
        };

        // FIX CRITICO: Se non passiamo un public_id, Cloudinary prova a usare il nome del file.
        // Con URL lunghi (Pollinations), questo rompe tutto.
        // Quindi forziamo un ID casuale se non ne viene passato uno specifico.
        // if (customPublicId) {
        //     uploadOptions.public_id = customPublicId;
        // } else {
        //     // Genera un ID breve casuale (es. poster_timestamp)
        //     uploadOptions.public_id = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        // }

        cloudinary.uploader.upload(imageSource, uploadOptions, (error, result) => {
            if (error) {
                console.error('Cloudinary Upload Error:', error);
                return reject(new Error('Failed to upload image to Cloudinary'));
            }
            if (!result || !result.secure_url) {
                return reject(new Error("No URL returned from Cloudinary"));
            }
            resolve(result.secure_url);
        });
    });
}

export async function deleteImage(publicId: string): Promise<void> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) throw new Error("Missing Cloudinary Config");

    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                console.error('Cloudinary Delete Error:', error);
                return reject(new Error('Failed to delete image from Cloudinary'));
            }
            console.log('Cloudinary Delete Result:', result);
            resolve();
        });
    });
}

export function getPublicIdFromUrl(url: string): string | null {
    try {
        // Rimuove parametri query (#, ?, ecc.)
        const cleanUrl = url.split('?')[0].split('#')[0];

        /**
         * Gestisce correttamente:
         * - cartelle multiple
         * - trasformazioni (es: upload/w_600,h_600/)
         * - estensioni variabili (.jpg, .jpeg, .png, .webp, .svg, ecc.)
         *
         * Esempio match:
         * https://res.cloudinary.com/demo/image/upload/v123/a/b/c/myfile_name.jpg
         *                └──────── public_id = "a/b/c/myfile_name"
         */
        const regex = /\/upload\/(?:[^/]+\/)*v\d+\/(.+)\.[A-Za-z0-9]+$/;

        const match = cleanUrl.match(regex);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
}
