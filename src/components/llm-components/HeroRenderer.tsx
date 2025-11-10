"use client";

import { HeroComponent } from "./types";
import { UIRenderer } from "./UIRenderer";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface HeroRendererProps {
  component: HeroComponent;
  onAction?: (action: string, label: string) => void;
  formValues?: Record<string, string>;
  onFormChange?: (id: string, value: string) => void;
}

export function HeroRenderer({
  component,
  onAction,
  formValues,
  onFormChange,
}: HeroRendererProps) {
  const {
    title,
    subtitle,
    backgroundImage,
    backgroundImageQuery,
    overlayColor = "rgba(0,0,0,0.4)",
    children = [],
  } = component;
  const [imageUrl, setImageUrl] = useState<string | null>(
    backgroundImage || null,
  );
  const [loading, setLoading] = useState(false);
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);

  useEffect(() => {
    if (
      !backgroundImage &&
      backgroundImageQuery &&
      backgroundImageQuery.length >= 3 &&
      backgroundImageQuery !== loadedQuery
    ) {
      let cancelled = false;

      const debounceTimer = setTimeout(() => {
        const fetchImage = async () => {
          try {
            setLoading(true);
            
            // Get API key from localStorage
            let apiKey: string | undefined;
            try {
              const settings = localStorage.getItem('epoch_provider_settings');
              if (settings) {
                const parsed = JSON.parse(settings);
                apiKey = parsed.serperApiKey;
              }
            } catch (e) {
              console.warn('Failed to get API key from settings');
            }
            
            if (!apiKey) {
              console.error('Serper API key not configured');
              return;
            }
            
            // Call Serper API directly from client
            const res = await fetch("https://google.serper.dev/images", {
              method: "POST",
              headers: {
                "X-API-KEY": apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ q: backgroundImageQuery }),
            });
            
            if (!res.ok) {
              throw new Error(`Image search failed: ${res.statusText}`);
            }
            
            const data = await res.json();
            if (!cancelled && data.images && data.images.length > 0) {
              setImageUrl(data.images[0].imageUrl);
              setLoadedQuery(backgroundImageQuery);
              
              // Track usage
              const { trackImageSearch } = await import("@/lib/searchUsageTracker");
              trackImageSearch();
            }
          } catch (err) {
            console.error("Failed to fetch image:", err);
          } finally {
            if (!cancelled) {
              setLoading(false);
            }
          }
        };

        fetchImage();
      }, 700);

      return () => {
        cancelled = true;
        clearTimeout(debounceTimer);
      };
    }
  }, [backgroundImage, backgroundImageQuery, loadedQuery]);

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 min-h-[300px] sm:min-h-[400px]">
      {(imageUrl || loading) && (
        <div className="absolute inset-0">
          {loading ? (
            <div className="w-full h-full animate-pulse bg-gradient-to-br from-gray-800 to-gray-700" />
          ) : (
            imageUrl && (
              <>
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: overlayColor }}
                />
              </>
            )
          )}
        </div>
      )}

      <div className="relative z-10 p-6 sm:p-12 flex flex-col justify-center min-h-[300px] sm:min-h-[400px]">
        {title && (
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 max-w-3xl">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl">
            {subtitle}
          </p>
        )}

        {children.length > 0 && (
          <div className="space-y-3 sm:space-y-4 mt-4">
            {children.map((child, index) => (
              <UIRenderer
                key={index}
                component={child}
                onAction={onAction}
                formValues={formValues}
                onFormChange={onFormChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
