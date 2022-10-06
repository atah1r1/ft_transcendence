import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
    provide: 'Cloudinary',
    useFactory: () => {
        return v2.config({
            cloud_name: 'dnztzbjpw',
            api_key: '585454721921359',
            api_secret: 'JOw4uYo0RaQuh7XtcaMnpI9Honk',
        });
    },
};