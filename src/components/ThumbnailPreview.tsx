import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { cn } from "../utils/cn";
import { formatBibleRef, type BibleReference } from "../utils/formatters";
import type { UnsplashImage } from "./ImageGrid";

export type LayoutType = "overlay" | "minimal" | "side-modern";

export interface ThumbnailPreviewProps {
    layout: LayoutType;
    image: UnsplashImage | null;
    pastor: string;
    title: string;
    date: string;
    bibleRef: BibleReference | null;
}

export function ThumbnailPreview({ layout, image, pastor, title, date, bibleRef }: ThumbnailPreviewProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            setPreviewUrl(null);
            return;
        }

        const bgColor = "#1a1a1a";
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const drawText = (
            x: number,
            y: number,
            align: CanvasTextAlign,
            fontSize: number,
            fontWeight: string,
            text: string,
            color: string = "#ffffff"
        ) => {
            ctx.fillStyle = color;
            ctx.font = `${fontWeight} ${fontSize}px Inter, Pretendard, system-ui, sans-serif`;
            ctx.textAlign = align;
            ctx.textBaseline = "top";
            ctx.fillText(text, x, y);
        };

        // Calculate optimal font size to fit text within maxWidth
        const calculateOptimalFontSize = (
            text: string,
            maxWidth: number,
            maxFontSize: number,
            minFontSize: number,
            fontWeight: string
        ): number => {
            let fontSize = maxFontSize;
            ctx.font = `${fontWeight} ${fontSize}px Inter, Pretendard, system-ui, sans-serif`;
            let metrics = ctx.measureText(text);

            // If text fits, return max size
            if (metrics.width <= maxWidth) {
                return maxFontSize;
            }

            // Binary search for optimal font size
            let low = minFontSize;
            let high = maxFontSize;
            let optimalSize = minFontSize;

            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                ctx.font = `${fontWeight} ${mid}px Inter, Pretendard, system-ui, sans-serif`;
                metrics = ctx.measureText(text);

                if (metrics.width <= maxWidth) {
                    optimalSize = mid;
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }

            return optimalSize;
        };

        const wrapText = (text: string, maxWidth: number, fontSize: number, fontWeight: string): string[] => {
            if (!text || text.trim() === "") return [""];

            ctx.font = `${fontWeight} ${fontSize}px Inter, Pretendard, system-ui, sans-serif`;

            // Preserve bible reference patterns (e.g., "1:4", "1:4-5", "1:4-1:9", "1:4 - 1:9")
            // We need to match both single references and range references
            // Priority: range pattern first (e.g., "1:4 - 1:9"), then single pattern (e.g., "1:4")
            // Range pattern: 숫자:숫자 - 숫자:숫자 (with spaces around dash)
            // Single pattern: 숫자:숫자 or 숫자:숫자-숫자 or 숫자:숫자-숫자:숫자
            const rangePattern = /\d+:\d+\s*-\s*\d+:\d+/g;
            const singlePattern = /\d+:\d+(?:-\d+(?::\d+)?)?/g;

            // First, find all range patterns, then single patterns
            const allMatches: Array<{ text: string; index: number; isRange: boolean }> = [];

            let match: RegExpExecArray | null;
            while ((match = rangePattern.exec(text)) !== null) {
                allMatches.push({ text: match[0], index: match.index, isRange: true });
            }

            // Reset regex for single pattern
            singlePattern.lastIndex = 0;
            while ((match = singlePattern.exec(text)) !== null) {
                // Check if this match is already covered by a range pattern
                const matchIndex = match.index;
                const matchText = match[0];
                const isOverlapped = allMatches.some(
                    (m) => matchIndex >= m.index && matchIndex < m.index + m.text.length
                );
                if (!isOverlapped) {
                    allMatches.push({ text: matchText, index: matchIndex, isRange: false });
                }
            }

            // Sort matches by index
            allMatches.sort((a, b) => a.index - b.index);
            const tokens: Array<{ text: string; isBibleRef: boolean }> = [];
            let lastIndex = 0;

            // Extract bible references and regular text
            for (const match of allMatches) {
                // Add text before the match
                if (match.index > lastIndex) {
                    const beforeText = text.substring(lastIndex, match.index);
                    if (beforeText.trim()) {
                        // Split by spaces but keep spaces
                        const parts = beforeText.split(/(\s+)/);
                        parts.forEach((part) => {
                            if (part.trim() || part === " ") {
                                tokens.push({ text: part, isBibleRef: false });
                            }
                        });
                    }
                }
                // Add the bible reference as a single token (never split)
                tokens.push({ text: match.text, isBibleRef: true });
                lastIndex = match.index + match.text.length;
            }

            // Add remaining text
            if (lastIndex < text.length) {
                const remaining = text.substring(lastIndex);
                if (remaining.trim()) {
                    const parts = remaining.split(/(\s+)/);
                    parts.forEach((part) => {
                        if (part.trim() || part === " ") {
                            tokens.push({ text: part, isBibleRef: false });
                        }
                    });
                }
            }

            // If no tokens found, split by spaces
            if (tokens.length === 0) {
                const parts = text.split(/(\s+)/);
                parts.forEach((part) => {
                    if (part.trim() || part === " ") {
                        tokens.push({ text: part, isBibleRef: false });
                    }
                });
            }

            const lines: string[] = [];
            let currentLine = "";

            for (const token of tokens) {
                const isSpace = token.text === " " || /^\s+$/.test(token.text);
                let testLine: string;

                if (isSpace) {
                    // Add space to current line
                    testLine = currentLine + token.text;
                } else if (token.isBibleRef) {
                    // Bible reference - never split, add with space if needed
                    const separator = currentLine && !currentLine.endsWith(" ") ? " " : "";
                    testLine = currentLine + separator + token.text;
                } else {
                    // Regular word
                    const separator = currentLine && !currentLine.endsWith(" ") ? " " : "";
                    testLine = currentLine + separator + token.text;
                }

                const metrics = ctx.measureText(testLine);

                if (metrics.width > maxWidth && currentLine.trim().length > 0) {
                    // Current line is full, start new line
                    lines.push(currentLine.trim());
                    // Start new line with current token (skip if it's just a space)
                    currentLine = isSpace ? "" : token.text;
                } else {
                    currentLine = testLine;
                }
            }

            // Add the last line
            if (currentLine.trim().length > 0) {
                lines.push(currentLine.trim());
            }

            // Final check: if any line is still too wide, break by characters (last resort)
            const finalLines: string[] = [];
            for (const line of lines) {
                const metrics = ctx.measureText(line);
                if (metrics.width <= maxWidth) {
                    finalLines.push(line);
                } else {
                    // Break by characters as last resort (for very long single words/tokens)
                    let charLine = "";
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        const testCharLine = charLine + char;
                        const charMetrics = ctx.measureText(testCharLine);
                        if (charMetrics.width > maxWidth && charLine.length > 0) {
                            finalLines.push(charLine);
                            charLine = char;
                        } else {
                            charLine = testCharLine;
                        }
                    }
                    if (charLine.length > 0) {
                        finalLines.push(charLine);
                    }
                }
            }

            return finalLines.length > 0 ? finalLines : [text];
        };

        const drawTextBlock = (
            x: number,
            y: number,
            width: number,
            align: CanvasTextAlign,
            lines: Array<{ text: string; fontSize: number; fontWeight: string; color?: string }>
        ) => {
            let currentY = y;
            lines.forEach((line) => {
                let textX = x;
                if (align === "center") {
                    textX = x + width / 2;
                } else if (align === "right") {
                    textX = x + width;
                }

                // Wrap text if it's too long
                const wrappedLines = wrapText(line.text, width, line.fontSize, line.fontWeight);

                wrappedLines.forEach((wrappedLine) => {
                    ctx.textAlign = align;
                    drawText(textX, currentY, align, line.fontSize, line.fontWeight, wrappedLine, line.color);
                    currentY += line.fontSize * 1.5;
                });
            });
        };

        const drawWithLayout = () => {
            setPreviewUrl(canvas.toDataURL("image/png"));
        };

        if (image) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Layout 1: Overlay - Text over image with gradient
                if (layout === "overlay") {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    gradient.addColorStop(0, "rgba(0,0,0,0.3)");
                    gradient.addColorStop(1, "rgba(0,0,0,0.8)");
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    const lines = [];
                    const bibleRefSize = title ? 56 : 96; // Larger if no title
                    if (title) lines.push({ text: title, fontSize: 80, fontWeight: "bold" });
                    if (bibleRef)
                        lines.push({ text: formatBibleRef(bibleRef), fontSize: bibleRefSize, fontWeight: "bold" });
                    if (date) lines.push({ text: date, fontSize: 30, fontWeight: "normal" });
                    if (pastor) lines.push({ text: `${pastor}`, fontSize: 30, fontWeight: "normal" });

                    // Calculate total height to center vertically when no title
                    let totalHeight = 0;
                    lines.forEach((line) => {
                        const wrapped = wrapText(line.text, canvas.width - 160, line.fontSize, line.fontWeight);
                        totalHeight += wrapped.length * line.fontSize * 1.5;
                    });

                    const startY = title ? 120 : (canvas.height - totalHeight) / 2;
                    drawTextBlock(80, startY, canvas.width - 160, "left", lines);
                }
                // Layout 2: Minimal - Small text overlay at corner
                else if (layout === "minimal") {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "rgba(0,0,0,0.7)";
                    const cornerWidth = 500;
                    const cornerHeight = 200;
                    ctx.fillRect(canvas.width - cornerWidth - 40, 40, cornerWidth, cornerHeight);
                    const lines = [];
                    const bibleRefSize = title ? 36 : 56; // Larger if no title
                    if (title) lines.push({ text: title, fontSize: 48, fontWeight: "bold" });

                    if (bibleRef)
                        lines.push({ text: formatBibleRef(bibleRef), fontSize: bibleRefSize, fontWeight: "normal" });
                    if (pastor) lines.push({ text: pastor, fontSize: 32, fontWeight: "normal" });

                    // Calculate total height to center vertically in corner box when no title
                    let totalHeight = 0;
                    lines.forEach((line) => {
                        const wrapped = wrapText(line.text, cornerWidth - 40, line.fontSize, line.fontWeight);
                        totalHeight += wrapped.length * line.fontSize * 1.5;
                    });

                    const startY = title ? 60 : 40 + (cornerHeight - totalHeight) / 2;
                    drawTextBlock(canvas.width - cornerWidth - 20, startY, cornerWidth - 40, "right", lines);
                }
                // Layout 3: Side Modern - Modern split layout with diagonal separator
                else if (layout === "side-modern") {
                    const splitX = canvas.width * 0.6; // 60% for image, 40% for panel
                    const panelColor = "#E8E8E8"; // Light grey panel
                    const textColor = "#1a1a1a"; // Dark text

                    // Draw image on left (60%)
                    ctx.drawImage(img, 0, 0, splitX, canvas.height);
                    // Add subtle gradient overlay
                    const imageGradient = ctx.createLinearGradient(0, 0, splitX * 0.3, 0);
                    imageGradient.addColorStop(0, "rgba(0,0,0,0.1)");
                    imageGradient.addColorStop(1, "rgba(0,0,0,0.3)");
                    ctx.fillStyle = imageGradient;
                    ctx.fillRect(0, 0, splitX, canvas.height);

                    // Draw grey panel on right (40%)
                    ctx.fillStyle = panelColor;
                    ctx.beginPath();
                    ctx.moveTo(splitX, 0);
                    ctx.lineTo(canvas.width, 0);
                    ctx.lineTo(canvas.width, canvas.height);
                    // Diagonal bottom edge
                    ctx.lineTo(splitX + (canvas.width - splitX) * 0.1, canvas.height);
                    ctx.closePath();
                    ctx.fill();

                    // Add subtle grid pattern to panel
                    ctx.strokeStyle = "rgba(200,200,200,0.3)";
                    ctx.lineWidth = 1;
                    const gridSize = 40;
                    for (let x = splitX; x < canvas.width; x += gridSize) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, canvas.height);
                        ctx.stroke();
                    }
                    for (let y = 0; y < canvas.height; y += gridSize) {
                        ctx.beginPath();
                        ctx.moveTo(splitX, y);
                        ctx.lineTo(canvas.width, y);
                        ctx.stroke();
                    }

                    // Diagonal separator line
                    ctx.beginPath();
                    ctx.moveTo(splitX, 0);
                    ctx.lineTo(splitX + (canvas.width - splitX) * 0.1, canvas.height);
                    ctx.strokeStyle = "#C0C0C0";
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Text on right panel
                    const panelPadding = 60;
                    const rightPadding = 40; // Additional padding on right for diagonal edge
                    const textBlockX = splitX + panelPadding;
                    const textBlockWidth = canvas.width - splitX - panelPadding - rightPadding;

                    const rightTextLines = [];
                    if (title) {
                        rightTextLines.push({ text: title, fontSize: 64, fontWeight: "bold", color: textColor });
                    }

                    if (bibleRef && !title) {
                        // If no title, make bible ref very large, but adjust if range mode
                        const isRangeMode = bibleRef.endVerse !== undefined && bibleRef.endVerse !== bibleRef.verse;
                        const bibleRefText = formatBibleRef(bibleRef);
                        let fontSize = 96;

                        if (isRangeMode) {
                            // For range mode, calculate optimal font size to fit within width
                            fontSize = calculateOptimalFontSize(
                                bibleRefText,
                                textBlockWidth,
                                96, // max size
                                48, // min size
                                "bold"
                            );
                        }

                        rightTextLines.push({
                            text: bibleRefText,
                            fontSize: fontSize,
                            fontWeight: "bold",
                            color: textColor,
                        });
                    } else if (bibleRef) {
                        // Check if it's a range mode selection
                        const isRangeMode = bibleRef.endVerse !== undefined && bibleRef.endVerse !== bibleRef.verse;
                        const bibleRefText = formatBibleRef(bibleRef);
                        let fontSize = 56;

                        if (isRangeMode) {
                            // For range mode with title, adjust font size to fit in one line
                            fontSize = calculateOptimalFontSize(
                                bibleRefText,
                                textBlockWidth,
                                56, // max size
                                32, // min size
                                "bold"
                            );
                        }

                        rightTextLines.push({
                            text: bibleRefText,
                            fontSize: fontSize,
                            fontWeight: "bold",
                            color: textColor,
                        });
                    }
                    if (pastor) {
                        rightTextLines.push({
                            text: `${pastor}`,
                            fontSize: 40,
                            fontWeight: "normal",
                            color: textColor,
                        });
                    }
                    if (date) {
                        rightTextLines.push({ text: date, fontSize: 36, fontWeight: "normal", color: textColor });
                    }

                    // Calculate total height to center vertically when no title
                    let totalHeight = 0;
                    rightTextLines.forEach((line) => {
                        const wrapped = wrapText(line.text, textBlockWidth, line.fontSize, line.fontWeight);
                        totalHeight += wrapped.length * line.fontSize * 1.5;
                    });

                    const yPos = title ? 100 : (canvas.height - totalHeight) / 2;
                    drawTextBlock(textBlockX, yPos, textBlockWidth, "left", rightTextLines);
                }

                drawWithLayout();
            };
            img.onerror = () => {
                // Fallback: draw text only
                const lines = [];
                const bibleRefSize = title ? 56 : 96;
                if (title) lines.push({ text: title, fontSize: 80, fontWeight: "bold" });
                if (bibleRef)
                    lines.push({ text: formatBibleRef(bibleRef), fontSize: bibleRefSize, fontWeight: "bold" });
                if (date) lines.push({ text: date, fontSize: 30, fontWeight: "normal" });
                if (pastor) lines.push({ text: `${pastor}`, fontSize: 30, fontWeight: "normal" });

                // Calculate total height to center vertically when no title
                let totalHeight = 0;
                lines.forEach((line) => {
                    const wrapped = wrapText(line.text, canvas.width - 160, line.fontSize, line.fontWeight);
                    totalHeight += wrapped.length * line.fontSize * 1.5;
                });

                const startY = title ? 120 : (canvas.height - totalHeight) / 2;
                drawTextBlock(80, startY, canvas.width - 160, "left", lines);
                drawWithLayout();
            };
            img.src = image.urls.regular;
        } else {
            // No image: draw text only
            const lines = [];
            const bibleRefSize = title ? 56 : 96;
            if (title) lines.push({ text: title, fontSize: 80, fontWeight: "bold" });
            if (bibleRef) lines.push({ text: formatBibleRef(bibleRef), fontSize: bibleRefSize, fontWeight: "bold" });
            if (date) lines.push({ text: date, fontSize: 30, fontWeight: "normal" });
            if (pastor) lines.push({ text: `${pastor}`, fontSize: 30, fontWeight: "normal" });

            // Calculate total height to center vertically when no title
            let totalHeight = 0;
            lines.forEach((line) => {
                const wrapped = wrapText(line.text, canvas.width - 160, line.fontSize, line.fontWeight);
                totalHeight += wrapped.length * line.fontSize * 1.5;
            });

            const startY = title ? 120 : (canvas.height - totalHeight) / 2;
            drawTextBlock(80, startY, canvas.width - 160, "left", lines);
            drawWithLayout();
        }
    }, [layout, image, pastor, title, date, bibleRef]);

    const handleExport = () => {
        if (!previewUrl) return;

        const link = document.createElement("a");
        link.download = `thumbnail-${Date.now()}.png`;
        link.href = previewUrl;
        link.click();
    };

    const isExportDisabled = !pastor || !bibleRef;

    return (
        <div className="w-full space-y-4">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                {previewUrl ? (
                    <img src={previewUrl} alt="Thumbnail preview" className="w-full h-full object-contain" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <p className="text-lg font-medium mb-2">Preview</p>
                            <p className="text-sm">Select image and fill metadata</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleExport}
                    disabled={isExportDisabled}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors",
                        isExportDisabled
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-primary-500 text-white hover:bg-primary-600"
                    )}
                >
                    <Download className="w-4 h-4" />
                    Export Thumbnail
                </button>
            </div>

            {isExportDisabled && (
                <p className="text-sm text-gray-500 text-center">Complete required fields to export</p>
            )}
        </div>
    );
}
