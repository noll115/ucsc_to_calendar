import { QuarterSeasons } from "./quarter-data";

type ClassDays = keyof ExamSchedule;

type QuarterSchedules = {
    [p in QuarterSeasons]: ExamSchedule
}


interface ExamTimes {
    start: Date,
    end: Date
}

interface ExamSchedule {
    MWF: ExamTimes;
    MW: ExamTimes;
    TuTh: ExamTimes;
}

export { ClassDays, ExamSchedule, ExamTimes, QuarterSchedules };