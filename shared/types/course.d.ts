import { day } from "ical-generator";

type TBA = "TBA"
type NA = "N/A"

interface Meeting {
    days: day[]
    startTime: Date | NA
    endTime: Date | NA
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
    shortName: string, //CSE-3
    sect: string, //"01"
    fullName: string, //Intro to Computers
    type: string, // "lecture"
    id: number,
    inst: string, //instructor
    meets: Meeting[], //times meeting
    labs: Labs | null
}


interface Courses {
    [index: number]: Course
}

interface CourseCatalogue { [index: string]: { [index: string]: { [index: string]: number } } }

export { CourseCatalogue, Courses, Course, Labs, Lab, Meeting, TBA };