"use client";

import React from "react";
import { cn } from "~/lib/utils";

interface Channel {
  id: string;
  name: string;
  icon: string;
  characterLimit: number;
}

interface ChannelSelectorProps {
  channels: Channel[];
  selectedChannel: Channel;
  onChannelChange: (channel: Channel) => void;
  className?: string;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channels,
  selectedChannel,
  onChannelChange,
  className,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select Channel
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onChannelChange(channel)}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200",
              selectedChannel.id === channel.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            )}
          >
            <span className="text-2xl mb-1">{channel.icon}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {channel.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {channel.characterLimit} chars
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
