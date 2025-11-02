import { useState, useEffect } from "react";
import { cn } from "../utils/cn";
import { Check } from "lucide-react";

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
}

export interface ImageGridProps {
    selectedImageId: string | null;
    onSelectImage: (image: UnsplashImage | null) => void;
}

const SAMPLE_IMAGES: UnsplashImage[] = [
    {
        id: "1",
        urls: {
            thumb: "https://images.unsplash.com/photo-1477672680933-0287a151330e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=147?w=300",
            regular:
                "https://images.unsplash.com/photo-1477672680933-0287a151330e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=147?w=800",
            full: "https://images.unsplash.com/photo-1477672680933-0287a151330e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=147?w=1920",
        },
        alt_description: "Church building",
        user: { name: "Unsplash" },
    },
    {
        id: "2",
        urls: {
            thumb: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=300",
            regular:
                "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=800",
            full: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=1920",
        },
        alt_description: "Cross on wall",
        user: { name: "Unsplash" },
    },
    {
        id: "3",
        urls: {
            thumb: "https://images.unsplash.com/photo-1536704231234-beca9772ca68?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1548?w=300",
            regular:
                "https://images.unsplash.com/photo-1536704231234-beca9772ca68?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1548?w=800",
            full: "https://images.unsplash.com/photo-1536704231234-beca9772ca68?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1548?w=1920",
        },
        alt_description: "Bible on table",
        user: { name: "Unsplash" },
    },
    {
        id: "4",
        urls: {
            thumb: "http://images.unsplash.com/photo-1528825539566-2bcb5882445c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=300",
            regular:
                "http://images.unsplash.com/photo-1528825539566-2bcb5882445c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=800",
            full: "http://images.unsplash.com/photo-1528825539566-2bcb5882445c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=1920",
        },
        alt_description: "Stained glass window",
        user: { name: "Unsplash" },
    },
    {
        id: "5",
        urls: {
            thumb: "https://images.unsplash.com/photo-1554623301-7ab68a2a30e1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=300",
            regular:
                "https://images.unsplash.com/photo-1554623301-7ab68a2a30e1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=800",
            full: "https://images.unsplash.com/photo-1554623301-7ab68a2a30e1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=1920",
        },
        alt_description: "Prayer hands",
        user: { name: "Unsplash" },
    },
    {
        id: "6",
        urls: {
            thumb: "https://images.unsplash.com/photo-1448227700746-d8eab5a1b9d7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=300",
            regular:
                "https://images.unsplash.com/photo-1448227700746-d8eab5a1b9d7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=800",
            full: "https://images.unsplash.com/photo-1448227700746-d8eab5a1b9d7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470?w=1920",
        },
        alt_description: "Worship setting",
        user: { name: "Unsplash" },
    },
];

export function ImageGrid({ selectedImageId, onSelectImage }: ImageGridProps) {
    const [images, setImages] = useState<UnsplashImage[]>(SAMPLE_IMAGES);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    if (error) {
        return (
            <div className="p-4 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
                Image source unavailable. Using placeholder.
            </div>
        );
    }

    return (
        <div className="w-full">
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
                                      alt={image.alt_description || "Thumbnail image"}
                                      className="w-full h-full object-cover"
                                      onError={() => setError("Image source unavailable. Using placeholder.")}
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
