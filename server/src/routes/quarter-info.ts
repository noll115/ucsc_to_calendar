import { Router } from "express";
import { GetAvailableQuarters } from "../lib/quarter";
import { RecentQuarters } from "../../../shared/types";

const router = Router();

let recentAvailableQuarters: RecentQuarters = null;

router.get("/", async (req, res) => {
    if (recentAvailableQuarters) {
        return res.send(recentAvailableQuarters);
    }
    let availableQuarters = await GetAvailableQuarters();
    recentAvailableQuarters = availableQuarters;
    console.log(availableQuarters);
    res.send(availableQuarters);
})


export { router };