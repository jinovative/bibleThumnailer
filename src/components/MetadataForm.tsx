import { cn } from "../utils/cn";
import { formatBibleRef, type BibleReference } from "../utils/formatters";

export interface MetadataFormProps {
    pastor: string;
    title: string;
    date: string;
    churchName: string;
    serviceType: string;
    bibleRef: BibleReference | null;
    onPastorChange: (value: string) => void;
    onTitleChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onChurchNameChange: (value: string) => void;
    onServiceTypeChange: (value: string) => void;
}

export function MetadataForm({
    pastor,
    title,
    date,
    churchName,
    serviceType,
    bibleRef,
    onPastorChange,
    onTitleChange,
    onDateChange,
    onChurchNameChange,
    onServiceTypeChange,
}: MetadataFormProps) {
    // Debounce is handled by useLocalStorage hook - direct updates are fine
    const handlePastorChange = (value: string) => {
        onPastorChange(value);
    };

    const handleTitleChange = (value: string) => {
        onTitleChange(value);
    };

    const handleDateChange = (value: string) => {
        onDateChange(value);
    };

    const handleChurchNameChange = (value: string) => {
        onChurchNameChange(value);
    };

    const handleServiceTypeChange = (value: string) => {
        onServiceTypeChange(value);
    };

    const isFormValid = pastor.trim() !== "" && bibleRef !== null;

    return (
        <div className="w-full space-y-4">
            <div>
                <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 mb-1">
                    교회 이름
                </label>
                <input
                    id="churchName"
                    type="text"
                    value={churchName}
                    onChange={(e) => handleChurchNameChange(e.target.value)}
                    placeholder="교회 이름을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                    예배 종류
                </label>
                <input
                    id="serviceType"
                    type="text"
                    value={serviceType}
                    onChange={(e) => handleServiceTypeChange(e.target.value)}
                    placeholder="예배 종류를 입력하세요 (예: 주일예배, 수요예배 등)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            <div>
                <label htmlFor="pastor" className="block text-sm font-medium text-gray-700 mb-1">
                    설교자 <span className="text-red-500">*</span>
                </label>
                <input
                    id="pastor"
                    type="text"
                    value={pastor}
                    onChange={(e) => handlePastorChange(e.target.value)}
                    placeholder="설교자 이름을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    제목 (선택사항)
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="설교 제목을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    날짜 (선택사항)
                </label>
                <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    성경 구절 <span className="text-red-500">*</span>
                </label>
                <div
                    className={cn(
                        "w-full px-4 py-2 border rounded-lg bg-gray-50",
                        bibleRef ? "border-gray-300" : "border-red-300"
                    )}
                >
                    {bibleRef ? (
                        <span className="text-gray-900">{formatBibleRef(bibleRef)}</span>
                    ) : (
                        <span className="text-gray-400">성경 선택기에서 선택하세요</span>
                    )}
                </div>
            </div>

            {!isFormValid && <div className="text-sm text-red-600">설교자 이름과 성경 구절을 입력해주세요</div>}
        </div>
    );
}
