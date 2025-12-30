import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { ShopSettings, ShopSettingsUpdate } from '@/types';

interface UseShopSettingsReturn {
  settings: ShopSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: ShopSettingsUpdate) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useShopSettings(): UseShopSettingsReturn {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('shop_settings')
        .select('*')
        .limit(1)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setSettings(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar configuración';
      setError(message);
      console.error('Error fetching shop settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: ShopSettingsUpdate): Promise<boolean> => {
    if (!settings?.id) {
      setError('No hay configuración para actualizar');
      return false;
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('shop_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw new Error(updateError.message || 'Error al actualizar en la base de datos');
      }

      setSettings(data);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado al actualizar';
      setError(message);
      console.error('Error updating shop settings:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}
