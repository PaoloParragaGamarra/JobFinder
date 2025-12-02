import React from 'react';
import { MapPin, DollarSign, Clock, Heart } from 'lucide-react';

export default function JobCard({ job, isSelected, isLiked, onSelect, onToggleLike }) {
  return (
    <div
      onClick={() => onSelect(job.id)}
      className={`relative p-4 rounded-xl cursor-pointer transition-all group ${
        isSelected
          ? 'bg-slate-800 border-l-4 border-amber-500 shadow-xl'
          : 'hover:bg-slate-800/50 border-l-4 border-transparent'
      }`}
    >
      {/* Gradient Accent */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent rounded-xl pointer-events-none" />
      )}
      
      <div className="relative flex items-start gap-3">
        {/* Logo */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${job.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
          {job.logo}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1 group-hover:text-amber-400 transition-colors">
              {job.title}
            </h3>
            <button
              onClick={(e) => onToggleLike(job.id, e)}
              className="flex-shrink-0 p-1 hover:bg-slate-700 rounded-md transition-all"
            >
              <Heart
                size={16}
                className={`transition-all ${
                  isLiked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-slate-500 hover:text-red-500'
                }`}
              />
            </button>
          </div>
          
          <p className="text-amber-400 text-sm font-medium mb-2">{job.company}</p>
          
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={12} />
              {job.salary.split(' - ')[0]}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {job.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock size={11} />
              {job.posted}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{job.applicants} applicants</span>
              <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded border border-slate-700">
                {job.source}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
