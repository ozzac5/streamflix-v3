'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Radio, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelCardProps {
  channel: {
    id: string;
    name: string;
    logoUrl?: string | null;
    country?: string | null;
    isLive?: boolean;
  };
  className?: string;
}

export default function ChannelCard({ channel, className }: ChannelCardProps) {
  return (
    <Link href={`/?channel=${channel.id}`} className={cn('group relative block', className)}>
      <div className="relative aspect-video rounded-lg overflow-hidden bg-[#141414]">
        {/* Logo or Placeholder */}
        {channel.logoUrl ? (
          <Image
            src={channel.logoUrl}
            alt={channel.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
            <span className="text-2xl font-bold text-white/30">
              {channel.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-[#e50914] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Live Badge */}
        {channel.isLive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-red-600 rounded-full">
            <Radio className="w-3 h-3 text-white animate-pulse" />
            <span className="text-[10px] font-bold text-white">LIVE</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-[#e50914] transition-colors">
          {channel.name}
        </h3>
        {channel.country && (
          <p className="text-xs text-[#a3a3a3] mt-0.5">{channel.country}</p>
        )}
      </div>
    </Link>
  );
}
