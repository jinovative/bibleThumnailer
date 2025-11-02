export interface BibleReference {
    book: string;
    chapter: number;
    verse: number;
    endVerse?: number;
}

export function formatBibleRef({ book, chapter, verse, endVerse }: BibleReference): string {
    if (endVerse && endVerse !== verse) {
        return `${book} ${chapter}:${verse}-${endVerse}`;
    }
    return `${book} ${chapter}:${verse}`;
}
