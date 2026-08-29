import { supabase } from '../lib/supabase';

export const eventService = {
  async fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) {
        console.warn('Events table info:', error.message);
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  },

  async insertEvent(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();
    
    if (error) {
      console.error('Error inserting event:', error);
      throw error;
    }
    return data;
  },

  async updateEvent(id, eventData) {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }
    return data;
  },

  async deleteEvent(id) {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
    return data;
  },

  async uploadImage(file) {
    const fileExt = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const filePath = `events/${uniqueId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('event_images')
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('event_images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
