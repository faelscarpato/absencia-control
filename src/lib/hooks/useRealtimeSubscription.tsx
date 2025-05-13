'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, checkRealtimeConnection } from '@/lib/supabase';

type SubscriptionCallback<T> = (payload: T) => void;

export function useRealtimeSubscription<T>(
  table: string,
  callback: SubscriptionCallback<T>,
  event: 'INSERT' | 'UPDATE' | 'DELETE' = 'UPDATE',
  filter?: { column: string; value: string }
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_BASE_DELAY = 2000; // Start with 2 seconds

  // Create a function to setup the subscription that can be called for reconnection
  const setupSubscription = useCallback(() => {
    // Create the channel name
    let channelName = `public:${table}`;
    if (filter) {
      channelName += `:${filter.column}=eq.${filter.value}`;
    }
    
    // Try to unsubscribe from any existing channel first
    if (channel) {
      channel.unsubscribe();
    }

    const newChannel = supabase.channel(channelName);

    // Set up the subscription
    newChannel
      .on(
        'postgres_changes', 
        {
          event: event,
          schema: 'public',
          table: table,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
        } as any, 
        (payload) => {
          console.log('Real-time update received:', payload);
          callback(payload.new as T);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setStatus('connected');
          reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        } else if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setStatus('disconnected');
          // Start reconnection attempts
          attemptReconnect();
        } else {
          setStatus('connecting');
        }
      });

    setChannel(newChannel);
    
    return newChannel;
  }, [table, event, filter, channel, callback]);

  // Function to attempt reconnection with exponential backoff
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log('Max reconnection attempts reached. Giving up.');
      return;
    }

    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Calculate delay with exponential backoff
    const delay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttemptsRef.current);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);

    reconnectTimeoutRef.current = setTimeout(async () => {
      reconnectAttemptsRef.current += 1;
      setStatus('connecting');

      // Check if Supabase is reachable
      const isConnected = await checkRealtimeConnection();
      
      if (isConnected) {
        console.log('Supabase is reachable, attempting to reconnect subscription');
        setupSubscription();
      } else {
        console.log('Supabase is not reachable, will try again');
        setStatus('disconnected');
        attemptReconnect();
      }
    }, delay);
  }, [setupSubscription]);

  // Set up the initial subscription
  useEffect(() => {
    const newChannel = setupSubscription();
    
    // Clean up the subscription and any pending reconnection attempts when the component unmounts
    return () => {
      if (newChannel) {
        console.log('Unsubscribing from real-time channel');
        newChannel.unsubscribe();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [setupSubscription]);

  // Function to manually trigger reconnection
  const reconnect = useCallback(() => {
    setStatus('connecting');
    reconnectAttemptsRef.current = 0; // Reset attempts on manual reconnection
    setupSubscription();
  }, [setupSubscription]);

  return { status, reconnect };
}
