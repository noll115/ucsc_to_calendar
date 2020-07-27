import { GetAllCoursesIDs, QueryCourse } from "../lib/courses";
import { Router, RequestHandler, Request, query } from "express";
import { GetAvailableQuarters } from "../lib/quarter";
import { QuarterSeasons } from "../../../shared/types";
import { HttpException } from "../Middleware/http-exception";
import { Course } from "../../../shared/types";

const router = Router();

let quarterCourses: { [index: number]: { [index: number]: Course } } = {};

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

router.get("/", async (req, res, next) => {
    let courseID = req.query["courseID"] as string;
    let { quarter } = req;
    let courses = quarterCourses[quarter.id];
    if (courses === undefined) {
        courses = quarterCourses[quarter.id] = {};
    }

    let courseIDNum = parseInt(courseID);
    let course: Course = courses[courseIDNum];
    try {

        if (!course) {
            course = await QueryCourse(quarter.id, quarter.keyDates, courseID);
            console.log(course.shortName);
            courses[course.id] = course;
        }
        return res.send(course)
    } catch (error) {
        console.log(error);

        next(new HttpException(500, `Did not find the course ${courseID}`))
    }

})


export { router };