import { cn } from "../utils/cn";
import { formatBibleRef, type BibleReference } from "../utils/formatters";

export interface MetadataFormProps {
    pastor: string;
    title: string;
    date: string;
    bibleRef: BibleReference | null;
    onPastorChange: (value: string) => void;
    onTitleChange: (value: string) => void;
    onDateChange: (value: string) => void;
}

export function MetadataForm({
    pastor,
    title,
    date,
    bibleRef,
    onPastorChange,
    onTitleChange,
    onDateChange,
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

    const isFormValid = pastor.trim() !== "" && bibleRef !== null;

    return (
        <div className="w-full space-y-4">
            <div>
                <label htmlFor="pastor" className="block text-sm font-medium text-gray-700 mb-1">
                    Pastor Name <span className="text-red-500">*</span>
                </label>
                <input
                    id="pastor"
                    type="text"
                    value={pastor}
                    onChange={(e) => handlePastorChange(e.target.value)}
                    placeholder="Enter pastor name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                />
            </div>

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title (Optional)
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter sermon title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
            </div>

            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date (Optional)
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
                    Bible Reference <span className="text-red-500">*</span>
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
                        <span className="text-gray-400">Select from Bible Selector</span>
                    )}
                </div>
            </div>

            {!isFormValid && (
                <div className="text-sm text-red-600">Please fill in pastor name and select a Bible reference</div>
            )}
        </div>
    );
}
