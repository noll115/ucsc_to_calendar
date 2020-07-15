export interface KeyDates {
    finals: Date[] | string[];
    holidays: Date[] | string[];
    instruction: {
        begins: Date | string,
        ends: Date | string
    };
    quarter: {
        begins: Date | string,
        ends: Date | string
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
