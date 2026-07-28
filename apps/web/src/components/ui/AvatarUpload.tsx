import React, { useRef, useState } from 'react';
import { User } from 'lucide-react';

interface Props {
  defaultImage?: string | null;
  onImageCompressed: (base64: string) => void;
}

export function AvatarUpload({ defaultImage, onImageCompressed }: Props) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;

        if (ctx) {
          ctx.drawImage(img, 0, 0, 256, 256);
          const dataUri = canvas.toDataURL('image/jpeg', 0.8);
          setPreview(dataUri);
          onImageCompressed(dataUri);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <User className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={inputRef}
        onChange={handleFile}
      />
      <span className="text-sm text-gray-500">Click to upload avatar</span>
    </div>
  );
}
