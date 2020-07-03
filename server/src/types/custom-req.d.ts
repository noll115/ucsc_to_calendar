import { Quarter } from "./quarter";

declare module 'express-serve-static-core' {
    interface Request {
        quarter?: Quarter
    }
}