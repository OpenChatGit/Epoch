"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "error" | "info" | "success";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = "error", duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const bgColor = type === "error" 
    ? "bg-red-50 border-red-200" 
    : type === "success" 
    ? "bg-green-50 border-green-200" 
    : "bg-gray-50 border-gray-200";

  const textColor = type === "error" 
    ? "text-red-700" 
    : type === "success" 
    ? "text-green-700" 
    : "text-gray-700";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className={`${bgColor} border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[400px]`}>
        <p className={`${textColor} text-sm font-[450] flex-1`}>{message}</p>
        <button
          onClick={handleClose}
          className={`${textColor} hover:opacity-70 transition-opacity`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
