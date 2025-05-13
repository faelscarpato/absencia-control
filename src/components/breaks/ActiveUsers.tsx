'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ActiveUsersProps {
  scheduleDate: string;
}

export default function ActiveUsers({ scheduleDate }: ActiveUsersProps) {
  const [activeUsers, setActiveUsers] = useState<number>(1); // Start with 1 (current user)
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    // Create a unique presence channel for this schedule date
    const presenceChannel = supabase.channel(`presence-break-schedule-${scheduleDate}`, {
      config: {
        presence: {
          key: crypto.randomUUID(), // Generate a unique ID for this user
        },
      },
    });

    // Set up presence tracking
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const userCount = Object.keys(state).length;
        setActiveUsers(userCount);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(presenceChannel);

    // Clean up the subscription when the component unmounts
    return () => {
      if (presenceChannel) {
        presenceChannel.unsubscribe();
      }
    };
  }, [scheduleDate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground bg-secondary bg-opacity-50 px-2 py-1 rounded-full"
    >
      <User size={12} />
      <span>
        {activeUsers} {activeUsers === 1 ? 'online' : 'online'}
      </span>
    </motion.div>
  );
}
