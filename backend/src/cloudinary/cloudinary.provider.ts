import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
    provide: 'Cloudinary',
    useFactory: () => {
        return v2.config({
            cloud_name: 'cloud_name',
            api_key: 'api_key',
            api_secret: 'api_secret',
        });
    },
};
