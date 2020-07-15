import { GetAllCoursesIDs, QueryCourse } from "../lib/courses";
import { Router, RequestHandler, Request, query } from "express";
import { GetAvailableQuarters } from "../lib/quarter";
import { QuarterSeasons } from "../../../shared/types";
import { HttpException } from "../Middleware/http-exception";
import { Course } from "../../../shared/types";

const router = Router();



const ValidateQuarter: RequestHandler = async (req, res, next) => {
    let queryQuarter = parseInt(req.query["quarterID"] as string);
    let { quarters } = await GetAvailableQuarters();
    for (const season in quarters) {
        const quarter = quarters[season as QuarterSeasons];
        if (quarter.id === queryQuarter) {
            req.quarter = quarter;
            return next();
        }
    }
    return next(new HttpException(404, `No such quarter found with ID ${queryQuarter}`))
}

router.use(ValidateQuarter);

router.get("/", async (req, res) => {
    let { quarter } = req;

    let availableCourses = await GetAllCoursesIDs(quarter.id);
    res.send(availableCourses)
})


router.get("/:courseID", async (req, res, next) => {
    let { courseID } = req.params;

    let { quarter } = req;
    let course: Course = null;
    try {
        course = await QueryCourse(quarter.id, quarter.keyDates, courseID);
    } catch (error) {
        next(new HttpException(500, `Did not find the course ${courseID}`))
    }

    res.send(course)
})


export { router };