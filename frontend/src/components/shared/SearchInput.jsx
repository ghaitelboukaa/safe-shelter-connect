import React from "react";
import { Search as SearchIcon, X } from "lucide-react";

export function SearchInput({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <SearchIcon className="h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2.5 bg-slate-100/80 hover:bg-slate-200/50 focus:bg-white border-2 border-transparent focus:border-primary-500/20 text-sm placeholder-slate-500 rounded-2xl transition-all duration-300 outline-none ring-0 shadow-sm focus:shadow-md"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
