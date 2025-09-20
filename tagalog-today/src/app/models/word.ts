export interface Word {
    id: number;
    starting_letter: string;
    word: string;
    definition: string;
    dialect?: string;
    sentiment?: string;
    created_date: string;
}
