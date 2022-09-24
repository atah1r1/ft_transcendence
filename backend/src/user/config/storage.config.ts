import { diskStorage } from "multer";
import { extname } from "path";

export const storage = diskStorage({
    destination: "./uploads",
    filename: (req, file, callback) => {
        callback(null, generateFilename(file));
    }
});

function generateFilename(file: Express.Multer.File) {
    return `${Date.now()}${extname(file.originalname)}`;
}