import { useState, useEffect } from "react";
import { BibleSelector, type BibleData } from "./components/BibleSelector";
import { ImageGrid, type UnsplashImage } from "./components/ImageGrid";
import { MetadataForm } from "./components/MetadataForm";
import { ThumbnailPreview, type LayoutType } from "./components/ThumbnailPreview";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { BibleReference } from "./utils/formatters";

function App() {
    const [bibleData, setBibleData] = useState<BibleData>({});
    const [selectedBook, setSelectedBook] = useLocalStorage<string>("church.thumbnail.book", "");
    const [selectedChapter, setSelectedChapter] = useLocalStorage<number | null>("church.thumbnail.chapter", null);
    const [selectedVerse, setSelectedVerse] = useLocalStorage<number | null>("church.thumbnail.verse", null);
    const [selectedEndVerse, setSelectedEndVerse] = useLocalStorage<number | null>("church.thumbnail.endVerse", null);
    const [selectedImageId, setSelectedImageId] = useLocalStorage<string | null>("church.thumbnail.image", null);
    const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);

    const handleImageSelect = (image: UnsplashImage | null) => {
        setSelectedImage(image);
        setSelectedImageId(image?.id || null);
    };
    const [pastor, setPastor] = useLocalStorage<string>("church.thumbnail.pastor", "");
    const [title, setTitle] = useLocalStorage<string>("church.thumbnail.title", "");
    const [date, setDate] = useLocalStorage<string>("church.thumbnail.date", "");
    const [churchName, setChurchName] = useLocalStorage<string>("church.thumbnail.churchName", "");
    const [serviceType, setServiceType] = useLocalStorage<string>("church.thumbnail.serviceType", "");
    const [layout, setLayout] = useState<LayoutType>("overlay");

    useEffect(() => {
        fetch("/bible_converted.json")
            .then((res) => res.json())
            .then((data: BibleData) => {
                setBibleData(data);
            })
            .catch((error) => {
                console.error("Error loading Bible data:", error);
            });
    }, []);

    const handleBibleSelect = (book: string, chapter: number, verse: number, endVerse?: number) => {
        setSelectedBook(book);
        setSelectedChapter(chapter);
        setSelectedVerse(verse);
        setSelectedEndVerse(endVerse || null);
    };

    const bibleRef: BibleReference | null =
        selectedBook && selectedChapter !== null && selectedVerse !== null
            ? {
                  book: selectedBook,
                  chapter: selectedChapter,
                  verse: selectedVerse,
                  endVerse: selectedEndVerse || undefined,
              }
            : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-screen-lg">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">교회 썸네일 제작기</h1>
                    <p className="text-gray-600">아름다운 YouTube 썸네일을 만들어보세요</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4">성경 구절 선택</h2>
                            <BibleSelector
                                bibleData={bibleData}
                                selectedBook={selectedBook}
                                selectedChapter={selectedChapter}
                                selectedVerse={selectedVerse}
                                selectedEndVerse={selectedEndVerse}
                                onSelect={handleBibleSelect}
                            />
                        </section>

                        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4">정보 입력</h2>
                            <MetadataForm
                                pastor={pastor}
                                title={title}
                                date={date}
                                churchName={churchName}
                                serviceType={serviceType}
                                bibleRef={bibleRef}
                                onPastorChange={setPastor}
                                onTitleChange={setTitle}
                                onDateChange={setDate}
                                onChurchNameChange={setChurchName}
                                onServiceTypeChange={setServiceType}
                            />
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4">미리보기</h2>
                            <ThumbnailPreview
                                layout={layout}
                                image={selectedImage}
                                pastor={pastor}
                                title={title}
                                date={date}
                                churchName={churchName}
                                serviceType={serviceType}
                                bibleRef={bibleRef}
                            />
                        </section>{" "}
                        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4">배경 이미지</h2>
                            <ImageGrid selectedImageId={selectedImageId} onSelectImage={handleImageSelect} />
                        </section>
                        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4">레이아웃</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setLayout("overlay")}
                                    className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                                        layout === "overlay"
                                            ? "bg-primary-500 text-white ring-2 ring-primary-200"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    오버레이
                                </button>
                                <button
                                    onClick={() => setLayout("minimal")}
                                    className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                                        layout === "minimal"
                                            ? "bg-primary-500 text-white ring-2 ring-primary-200"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    미니멀
                                </button>
                                <button
                                    onClick={() => setLayout("side-modern")}
                                    className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                                        layout === "side-modern"
                                            ? "bg-primary-500 text-white ring-2 ring-primary-200"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    사이드 모던
                                </button>
                                <button
                                    onClick={() => setLayout("center")}
                                    className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                                        layout === "center"
                                            ? "bg-primary-500 text-white ring-2 ring-primary-200"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    센터링
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-3">
                                {layout === "overlay"
                                    ? "이미지 위에 그라데이션과 함께 텍스트 배치"
                                    : layout === "minimal"
                                    ? "코너에 텍스트가 배치된 미니멀 디자인"
                                    : layout === "side-modern"
                                    ? "대각선 구분선이 있는 모던한 분할 레이아웃"
                                    : "텍스트가 이미지 정가운데 정렬된 레이아웃"}
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
