import express from "express";
import helmet from "helmet";
import cors from "cors"
import { router as quarterRouter } from "./routes/quarter-info";
import { router as coursesRouter } from "./routes/courses-info";
import { errorMiddleware } from "./Middleware/http-exception";

const port = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use(helmet())

app.use("/quarters", quarterRouter);
app.use("/courses", coursesRouter);

app.use(errorMiddleware)




app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);

})