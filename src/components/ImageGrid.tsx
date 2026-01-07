import { useState, useEffect, useRef } from "react";
import { cn } from "../utils/cn";
import { Check, Upload } from "lucide-react";
import ch1Image from "../assets/ch1.jpeg";
import ch2Image from "../assets/ch2.jpeg";
import ch3Image from "../assets/ch3.jpg";
import ch4Image from "../assets/ch4.jpeg";
import ch5Image from "../assets/ch5.jpeg";
import ch6Image from "../assets/ch6.jpeg";
import ch7Image from "../assets/ch7.jpg";
import ch8Image from "../assets/ch8.jpg";
import ch9Image from "../assets/ch9.jpg";

export interface UnsplashImage {
    id: string;
    urls: {
        thumb: string;
        regular: string;
        full: string;
    };
    alt_description?: string;
    user: {
        name: string;
    };
    isUploaded?: boolean; // Flag for uploaded images
}

export interface ImageGridProps {
    selectedImageId: string | null;
    onSelectImage: (image: UnsplashImage | null) => void;
}

const SAMPLE_IMAGES: UnsplashImage[] = [
    {
        id: "1",
        urls: {
            thumb: ch1Image,
            regular: ch1Image,
            full: ch1Image,
        },
        alt_description: "Church image 1",
        user: { name: "Local Assets" },
    },
    {
        id: "2",
        urls: {
            thumb: ch2Image,
            regular: ch2Image,
            full: ch2Image,
        },
        alt_description: "Church image 2",
        user: { name: "Local Assets" },
    },
    {
        id: "3",
        urls: {
            thumb: ch3Image,
            regular: ch3Image,
            full: ch3Image,
        },
        alt_description: "Church image 3",
        user: { name: "Local Assets" },
    },
    {
        id: "4",
        urls: {
            thumb: ch4Image,
            regular: ch4Image,
            full: ch4Image,
        },
        alt_description: "Church image 4",
        user: { name: "Local Assets" },
    },
    {
        id: "5",
        urls: {
            thumb: ch5Image,
            regular: ch5Image,
            full: ch5Image,
        },
        alt_description: "Church image 5",
        user: { name: "Local Assets" },
    },
    {
        id: "6",
        urls: {
            thumb: ch6Image,
            regular: ch6Image,
            full: ch6Image,
        },
        alt_description: "Church image 6",
        user: { name: "Local Assets" },
    },
    {
        id: "7",
        urls: {
            thumb: ch7Image,
            regular: ch7Image,
            full: ch7Image,
        },
        alt_description: "Church image 7",
        user: { name: "Local Assets" },
    },
    {
        id: "8",
        urls: {
            thumb: ch8Image,
            regular: ch8Image,
            full: ch8Image,
        },
        alt_description: "Church image 8",
        user: { name: "Local Assets" },
    },
    {
        id: "9",
        urls: {
            thumb: ch9Image,
            regular: ch9Image,
            full: ch9Image,
        },
        alt_description: "Church image 9",
        user: { name: "Local Assets" },
    },
];

export function ImageGrid({ selectedImageId, onSelectImage }: ImageGridProps) {
    const [images, setImages] = useState<UnsplashImage[]>(SAMPLE_IMAGES);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setImages(SAMPLE_IMAGES);
            setLoading(false);
        }, 500);
    }, []);

    // Restore selected image from localStorage on mount
    useEffect(() => {
        if (selectedImageId && images.length > 0) {
            const image = images.find((img) => img.id === selectedImageId);
            if (image) {
                onSelectImage(image);
            }
        }
    }, [selectedImageId, images]);

    const handleImageClick = (image: UnsplashImage) => {
        if (selectedImageId === image.id) {
            onSelectImage(null);
        } else {
            onSelectImage(image);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 업로드 가능합니다.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target?.result as string;
            const uploadedImage: UnsplashImage = {
                id: `uploaded-${Date.now()}`,
                urls: {
                    thumb: imageUrl,
                    regular: imageUrl,
                    full: imageUrl,
                },
                alt_description: file.name,
                user: { name: "업로드된 이미지" },
                isUploaded: true,
            };

            setImages((prev) => [uploadedImage, ...prev]);
            onSelectImage(uploadedImage);
        };
        reader.readAsDataURL(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    if (error) {
        return (
            <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
                이미지 소스를 사용할 수 없습니다. 플레이스홀더를 사용합니다.
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={handleUploadClick}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                >
                    <Upload className="w-4 h-4" />
                    이미지 업로드
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
            <div className="grid grid-cols-3 gap-4">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
                      ))
                    : images.map((image) => {
                          const isSelected = selectedImageId === image.id;

                          return (
                              <div
                                  key={image.id}
                                  className={cn(
                                      "relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                                      isSelected ? "border-primary-500 ring-2 ring-primary-200" : "border-gray-200"
                                  )}
                                  onClick={() => handleImageClick(image)}
                              >
                                  <img
                                      src={image.urls.thumb}
                                      alt={image.alt_description || "썸네일 이미지"}
                                      className="w-full h-full object-cover"
                                      onError={() =>
                                          setError("이미지 소스를 사용할 수 없습니다. 플레이스홀더를 사용합니다.")
                                      }
                                  />
                                  {isSelected && (
                                      <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                                          <div className="bg-primary-500 rounded-full p-2">
                                              <Check className="w-4 h-4 text-white" />
                                          </div>
                                      </div>
                                  )}
                              </div>
                          );
                      })}
            </div>
        </div>
    );
}
