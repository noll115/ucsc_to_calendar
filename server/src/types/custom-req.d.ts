import { Quarter } from "../../../shared/types";

declare module 'express-serve-static-core' {
    interface Request {
        quarter?: Quarter
    }
}