"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ComboboxProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}

export default function Combobox({ value, onChange, options, placeholder, required }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        // If they leave without selecting, just use whatever they typed
        onChange(inputValue);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, onChange]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          required={required}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-orange transition-all text-sm"
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
        >
          <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <ul className="py-2">
              {filteredOptions.map((opt) => (
                <li
                  key={opt}
                  onClick={() => {
                    setInputValue(opt);
                    onChange(opt);
                    setOpen(false);
                  }}
                  className="px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-brand-orange/20 cursor-pointer transition-colors"
                >
                  {opt}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-xs text-brand-orange/60 font-medium">
              Press Enter to use "{inputValue}" (custom)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
