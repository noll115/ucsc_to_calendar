export interface KeyDates {
    finals: Date[];
    holidays: Date[];
    instruction: {
        begins: Date,
        ends: Date
    };
    quarter: {
        begins: Date,
        ends: Date
    };
    [key: string]: any
}


export type QuarterSeasons = keyof Quarters;


export interface Quarter {
    year: number;
    id: number;
    keyDates: KeyDates | null;
}

export interface Quarters {
    fall?: Quarter;
    winter?: Quarter;
    spring?: Quarter;
    summer?: Quarter;
}
export interface RecentQuarters {
    quarters: Quarters,
    currentQuarter: QuarterSeasons
}
