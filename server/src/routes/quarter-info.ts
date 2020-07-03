import { Router } from "express";
import { GetCurrentQuarters } from "../lib/quarter";

const router = Router();


router.get("/", async (req, res) => {
    let availableQuarters = await GetCurrentQuarters();
    res.send(availableQuarters);
})


export { router };