import { day } from "ical-generator";

type TBA = "TBA"
type NA = "N/A"

interface Meeting {
    days: day[],
    start: Date,
    end: Date,
    loc: string
}

interface Lab {
    id: number,
    sect: string,
    meet: Meeting | TBA | NA,
}

interface Labs {
    [index: number]: Lab,
    type: string
}
interface Course {
    course: string,
    section: string,
    title: string,
    type: string,
    id: number,
    instructor: string,
    meets: Meeting[] | TBA,
    labs: Labs | null
}


interface Courses {
    [index: number]: Course
}

interface CourseCatalogue { [index: string]: { [index: string]: number } }

export { CourseCatalogue, Courses, Course, Labs, Lab, Meeting, TBA };