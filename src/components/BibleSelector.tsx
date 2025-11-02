import { useState, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "../utils/cn";

export interface BibleData {
    [book: string]: {
        chapters: {
            [chapter: string]: number;
        };
    };
}

export interface BibleSelectorProps {
    bibleData: BibleData;
    selectedBook: string;
    selectedChapter: number | null;
    selectedVerse: number | null;
    selectedEndVerse: number | null;
    onSelect: (book: string, chapter: number, verse: number, endVerse?: number) => void;
}

export function BibleSelector({
    bibleData,
    selectedBook,
    selectedChapter,
    selectedVerse,
    selectedEndVerse,
    onSelect,
}: BibleSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [rangeMode, setRangeMode] = useState(false);
    const [rangeStartVerse, setRangeStartVerse] = useState<{ book: string; chapter: number; verse: number } | null>(
        null
    );

    const books = useMemo(() => Object.keys(bibleData), [bibleData]);

    const filteredBooks = useMemo(() => {
        if (!searchQuery.trim()) return books;
        const query = searchQuery.toLowerCase();
        return books.filter((book) => book.toLowerCase().includes(query));
    }, [books, searchQuery]);

    const toggleBook = (book: string) => {
        const newExpanded = new Set(expandedBooks);
        if (newExpanded.has(book)) {
            newExpanded.delete(book);
        } else {
            newExpanded.add(book);
        }
        setExpandedBooks(newExpanded);
    };

    const toggleChapter = (book: string, chapter: string) => {
        const key = `${book}-${chapter}`;
        const newExpanded = new Set(expandedChapters);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedChapters(newExpanded);
    };

    const handleVerseSelect = (book: string, chapter: number, verse: number) => {
        if (rangeMode) {
            if (!rangeStartVerse) {
                // Set start verse
                setRangeStartVerse({ book, chapter, verse });
                onSelect(book, chapter, verse, verse);
            } else {
                // Set end verse
                if (rangeStartVerse.book === book && rangeStartVerse.chapter === chapter) {
                    const startVerse = rangeStartVerse.verse;
                    const endVerse = verse >= startVerse ? verse : startVerse;
                    onSelect(book, chapter, startVerse, endVerse);
                    setRangeStartVerse(null);
                    setRangeMode(false);
                } else {
                    // Different book/chapter, reset
                    setRangeStartVerse({ book, chapter, verse });
                    onSelect(book, chapter, verse, verse);
                }
            }
        } else {
            onSelect(book, chapter, verse);
        }
    };

    const clearRange = () => {
        setRangeStartVerse(null);
        setRangeMode(false);
        if (selectedBook && selectedChapter && selectedVerse) {
            // Reset to single verse selection
            onSelect(selectedBook, selectedChapter, selectedVerse);
        }
    };

    const isVerseInRange = (book: string, chapter: number, verse: number) => {
        if (!rangeMode || !rangeStartVerse) return false;
        if (rangeStartVerse.book !== book || rangeStartVerse.chapter !== chapter) return false;
        return verse === rangeStartVerse.verse;
    };

    const isVerseSelected = (book: string, chapter: number, verse: number) => {
        const isSelected =
            selectedBook === book &&
            selectedChapter === chapter &&
            selectedVerse === verse &&
            (!selectedEndVerse || selectedEndVerse === verse);

        const isInRange =
            selectedBook === book &&
            selectedChapter === chapter &&
            selectedVerse !== null &&
            selectedEndVerse !== null &&
            verse >= selectedVerse &&
            verse <= selectedEndVerse;

        return isSelected || isInRange;
    };

    return (
        <div className="w-full border border-gray-200 rounded-lg bg-white">
            <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="책 이름 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (rangeMode) {
                                    clearRange();
                                } else {
                                    setRangeMode(true);
                                    setRangeStartVerse(null);
                                }
                            }}
                            className={cn(
                                "px-3 py-1.5 text-sm rounded-md font-medium transition-colors",
                                rangeMode ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            {rangeMode ? "구간 선택 모드 (ON)" : "구간 선택 모드"}
                        </button>
                        {rangeMode && (
                            <button
                                onClick={clearRange}
                                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                            >
                                취소
                            </button>
                        )}
                    </div>
                    {rangeMode && rangeStartVerse && (
                        <div className="px-3 py-2 bg-primary-50 border border-primary-200 rounded-md">
                            <div className="text-sm font-medium text-primary-700">
                                시작: {rangeStartVerse.book} {rangeStartVerse.chapter}:{rangeStartVerse.verse}
                            </div>
                            <div className="text-xs text-primary-600 mt-1">끝 절을 클릭하여 구간을 완성하세요</div>
                        </div>
                    )}
                    {rangeMode && !rangeStartVerse && (
                        <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="text-sm text-blue-700">시작 절을 클릭하여 구간 선택을 시작하세요</div>
                        </div>
                    )}
                </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {filteredBooks.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">책을 찾을 수 없습니다</div>
                ) : (
                    filteredBooks.map((book) => {
                        const isExpanded = expandedBooks.has(book);
                        const chapters = bibleData[book]?.chapters || {};
                        const chapterKeys = Object.keys(chapters).sort((a, b) => Number(a) - Number(b));

                        return (
                            <div key={book} className="border-b border-gray-100 last:border-b-0">
                                <button
                                    onClick={() => toggleBook(book)}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors",
                                        selectedBook === book && "bg-primary-50"
                                    )}
                                >
                                    <span className="font-medium text-left">{book}</span>
                                    <ChevronDown
                                        className={cn(
                                            "w-4 h-4 text-gray-500 transition-transform",
                                            isExpanded && "transform rotate-180"
                                        )}
                                    />
                                </button>
                                {isExpanded && (
                                    <div className="bg-gray-50">
                                        {chapterKeys.map((chapterStr) => {
                                            const chapter = Number(chapterStr);
                                            const verseCount = chapters[chapterStr];
                                            const chapterKey = `${book}-${chapterStr}`;
                                            const isChapterExpanded = expandedChapters.has(chapterKey);
                                            const isChapterSelected =
                                                selectedBook === book && selectedChapter === chapter;

                                            return (
                                                <div
                                                    key={chapterStr}
                                                    className="border-b border-gray-200 last:border-b-0"
                                                >
                                                    <button
                                                        onClick={() => toggleChapter(book, chapterStr)}
                                                        className={cn(
                                                            "w-full px-8 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors",
                                                            isChapterSelected && "bg-primary-100"
                                                        )}
                                                    >
                                                        <span className="text-sm">
                                                            {chapter}장 ({verseCount}절)
                                                        </span>
                                                        <ChevronDown
                                                            className={cn(
                                                                "w-4 h-4 text-gray-500 transition-transform",
                                                                isChapterExpanded && "transform rotate-180"
                                                            )}
                                                        />
                                                    </button>
                                                    {isChapterExpanded && (
                                                        <div className="bg-gray-50 px-8 py-2">
                                                            <div className="grid grid-cols-10 gap-2">
                                                                {Array.from(
                                                                    { length: verseCount },
                                                                    (_, i) => i + 1
                                                                ).map((verse) => {
                                                                    const isSelected = isVerseSelected(
                                                                        book,
                                                                        chapter,
                                                                        verse
                                                                    );
                                                                    const isStart = isVerseInRange(
                                                                        book,
                                                                        chapter,
                                                                        verse
                                                                    );

                                                                    return (
                                                                        <button
                                                                            key={verse}
                                                                            onClick={() =>
                                                                                handleVerseSelect(book, chapter, verse)
                                                                            }
                                                                            className={cn(
                                                                                "px-2 py-1 text-xs rounded transition-colors",
                                                                                isSelected
                                                                                    ? "bg-primary-500 text-white"
                                                                                    : isStart
                                                                                    ? "bg-primary-300 text-white ring-2 ring-primary-500"
                                                                                    : "bg-white hover:bg-primary-100 border border-gray-200"
                                                                            )}
                                                                        >
                                                                            {verse}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
