import { day } from "ical-generator";

type TBA = "TBA"
type NA = "N/A"

interface Meeting {
    days: day[]
    startTime: Date | string | NA
    endTime: Date | string | NA
    loc: string | NA
}

interface Lab {
    id: number,
    sect: string,
    meet: Meeting | TBA | NA,
}

interface LabsInfo {
    labs: Lab[]
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
    labs: LabsInfo
}


interface Courses {
    [index: number]: Course
}

interface CourseCatalogue { [index: string]: { [index: string]: { [index: string]: number } } }

export {NA,TBA, CourseCatalogue, Courses, Course, LabsInfo, Lab, Meeting };