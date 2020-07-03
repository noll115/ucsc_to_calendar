import { GetAllCoursesIDs, QueryCourse } from "../lib/courses";
import { Router, RequestHandler, Request, query } from "express";
import { GetCurrentQuarters } from "../lib/quarter";
import { QuarterSeasons } from "../types/quarter";
import { HttpException } from "../Middleware/http-exception";
import { Course } from "../types/course";

const router = Router();



const ValidateQuarter: RequestHandler = async (req, res, next) => {
    let queryQuarter = parseInt(req.query.quarter as string);
    let availableQuarters = await GetCurrentQuarters();
    for (const season in availableQuarters) {
        const quarter = availableQuarters[season as QuarterSeasons];
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