"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Users, Calendar, X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import type { Stadium } from "@/data/stadiums";
import { useLocale, useTranslation } from "@/contexts/LocaleContext";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200";

type StadiumCardProps = {
  stadium: Stadium;
};

export function StadiumCard({ stadium }: StadiumCardProps) {
  const { locale } = useLocale();
  const { t } = useTranslation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const name = (locale === "tr" ? stadium?.nameTr : stadium?.nameEn) ?? t("venues.tbd");
  const city = (locale === "tr" ? stadium?.cityTr : stadium?.cityEn) ?? "";
  const country = (locale === "tr" ? stadium?.countryTr : stadium?.countryEn) ?? "";
  const schedule = (locale === "tr" ? stadium?.scheduleNoteTr : stadium?.scheduleNoteEn) ?? "";

  const images = stadium?.images?.length ? stadium.images : [FALLBACK_IMAGE];

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImgError = (index: number) => {
    setImgErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <>
      <article
        onClick={() => setIsModalOpen(true)}
        className={`group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${stadium?.imageGradient ?? "from-zinc-800 to-zinc-900"} transition hover:border-white/20 hover:shadow-xl hover:shadow-black/30`}
      >
        <div className="relative h-32 w-full overflow-hidden bg-zinc-900">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 to-transparent" />
          <Image
            src={imgErrors[0] ? FALLBACK_IMAGE : (images[0] || FALLBACK_IMAGE)}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => handleImgError(0)}
            unoptimized
          />
          <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur">
            <ImageIcon className="h-3 w-3" />
            {t("venues.gallery") || "Galeri"}
          </div>
        </div>

        <div className="p-6 pt-4">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white transition group-hover:text-emerald-400 truncate max-w-[180px]">{name}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span className="truncate">{city && country ? `${city}, ${country}` : (city || country || "---")}</span>
              </p>
            </div>
            <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-medium text-emerald-300 whitespace-nowrap">
              {stadium?.matchesHosted ?? 0} {t("venues.matches")}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-zinc-300">
              <Users className="h-4 w-4 text-emerald-400" />
              <span>
                {(stadium?.capacity ?? 0).toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}{" "}
                {t("venues.capacity")}
              </span>
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-lg border border-white/5 bg-black/20 p-3 text-xs text-zinc-400 min-h-[3rem]">
            <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span className="line-clamp-2">{schedule}</span>
          </p>
        </div>
      </article>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md">
          <div className="relative w-full max-w-4xl px-4 sm:px-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-4 z-[210] rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:-right-12 sm:top-0"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
              <Image
                src={imgErrors[currentImgIndex] ? FALLBACK_IMAGE : (images[currentImgIndex] || FALLBACK_IMAGE)}
                alt={`${name} image ${currentImgIndex + 1}`}
                fill
                className="object-contain"
                onError={() => handleImgError(currentImgIndex)}
                unoptimized
              />
              
              {images.length > 1 && (
                <>
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <button
                      onClick={prevImg}
                      className="ml-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <button
                      onClick={nextImg}
                      className="mr-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full transition-all ${i === currentImgIndex ? "bg-emerald-400 w-4" : "bg-white/30"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-white">{name}</h2>
              <p className="mt-2 text-zinc-400">
                {city}, {country} — {t("venues.capacity")}: {(stadium?.capacity ?? 0).toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
