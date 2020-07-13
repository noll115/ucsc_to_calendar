import { Router } from "express";
import { GetAvailableQuarters } from "../lib/quarter";

const router = Router();


router.get("/", async (req, res) => {
    let availableQuarters = await GetAvailableQuarters();
    res.send(availableQuarters);
})


export { router };