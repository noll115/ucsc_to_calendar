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
    c: string, //course
    s: string, //section
    ti: string, //title
    t: string, //type
    id: number,
    inst: string, //instructor
    m: Meeting[] | TBA, //meets
    l: Labs | null //labs
}


interface Courses {
    [index: number]: Course
}

interface CourseCatalogue { [index: string]: { [index: string]: { [index: string]: number } } }

export { CourseCatalogue, Courses, Course, Labs, Lab, Meeting, TBA };