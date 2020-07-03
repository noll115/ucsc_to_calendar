import { QuarterSeasons } from "./quarter";


type QuarterSchedules = {
    [p in QuarterSeasons]?: ExamSchedule
}


interface ExamTimes {
    start: Date,
    end: Date
}

interface ExamSchedule {
    MWF: ExamTimes[];
    MW: ExamTimes[];
    TuTh: ExamTimes[];
}

type MeetDays = keyof ExamSchedule;

export { MeetDays, ExamSchedule, ExamTimes, QuarterSchedules };