'use client';

import React, { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Loader2, Star, Trash2, Link2 } from 'lucide-react';

export type MultiImageUploadFieldProps = {
  images: string[];
  mainImage: string;
  onChange: (images: string[], mainImage: string) => void;
  onUpload: (file: File) => void | Promise<void>;
  uploading?: boolean;
  label?: string;
  className?: string;
};

export function MultiImageUploadField({
  images,
  mainImage,
  onChange,
  onUpload,
  uploading = false,
  label = 'Product Images',
  className = '',
}: MultiImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const list = images.length > 0 ? images : mainImage ? [mainImage] : [];
  const main = mainImage || list[0] || '';

  const setMain = (url: string) => onChange(list, url);

  const removeImage = (url: string) => {
    const next = list.filter((u) => u !== url);
    const nextMain = url === main ? next[0] || '' : main;
    onChange(next, nextMain);
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url || list.includes(url)) {
      setUrlInput('');
      return;
    }
    const next = [...list, url];
    onChange(next, main || url);
    setUrlInput('');
  };

  const pickFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        await onUpload(file);
      }
      if (inputRef.current) inputRef.current.value = '';
    },
    [onUpload]
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-[10px] uppercase font-black tracking-wider text-stone-500">
          {label}
        </label>
      )}

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 space-y-3">
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Paste image URL & add"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-200 bg-white"
          />
          <button
            type="button"
            onClick={addUrl}
            className="px-3 py-2 text-xs font-bold rounded-lg bg-[#1a234d] text-white shrink-0"
          >
            Add
          </button>
        </div>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void pickFiles(e.dataTransfer.files);
          }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center py-5 px-4 border-2 border-dashed rounded-xl cursor-pointer transition ${
            dragOver ? 'border-[#f5b075] bg-[#fef8f2]' : 'border-stone-300 hover:border-[#1a234d]/40 bg-white'
          } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => void pickFiles(e.target.files)}
          />
          {uploading ? (
            <Loader2 className="w-7 h-7 text-[#1a234d] animate-spin mb-2" />
          ) : (
            <Upload className="w-7 h-7 text-[#1a234d] mb-2" />
          )}
          <span className="text-[10px] font-black uppercase text-[#1a234d]">
            {uploading ? 'Uploading...' : 'Upload multiple images'}
          </span>
          <span className="text-[9px] text-stone-400 mt-1 flex items-center gap-1">
            <Link2 className="w-3 h-3" /> Drag & drop or click — select main with ★
          </span>
        </div>

        {list.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {list.map((url) => {
              const isMain = url === main;
              return (
                <div
                  key={url}
                  className={`relative group rounded-xl overflow-hidden border-2 aspect-square bg-white ${
                    isMain ? 'border-[#f5b075] ring-2 ring-[#f5b075]/40' : 'border-stone-200'
                  }`}
                >
                  <Image src={url} alt="" fill className="object-cover" referrerPolicy="no-referrer" sizes="120px" />
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1.5 bg-gradient-to-t from-black/70 to-transparent">
                    <button
                      type="button"
                      title="Set as main image"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMain(url);
                      }}
                      className={`p-1.5 rounded-md ${isMain ? 'bg-[#f5b075] text-[#1a234d]' : 'bg-white/90 text-stone-700'}`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isMain ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      title="Delete image"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(url);
                      }}
                      className="p-1.5 rounded-md bg-red-500/90 text-white ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {isMain && (
                    <span className="absolute top-1.5 left-1.5 text-[8px] font-black uppercase bg-[#f5b075] text-[#1a234d] px-1.5 py-0.5 rounded">
                      Main
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
