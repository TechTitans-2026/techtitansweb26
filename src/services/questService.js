import { supabase } from '../lib/supabase';

export const questService = {
  async fetchActiveQuests() {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .in('status', ['Active', 'Upcoming'])
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Quests table info:', error.message);
        return [];
      }

      return data || [];
    } catch {
      return [];
    }
  },

  // FETCH ALL QUESTS FOR ADMIN MANAGEMENT
  async fetchAllQuests() {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all quests:', error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Failed to fetch quests:', err);
      return [];
    }
  },

  async fetchUserHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('user_quest_history')
        .select(`
          *,
          quests (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('User quest history info:', error.message);
        return [];
      }

      return data || [];
    } catch {
      return [];
    }
  },

  async fetchLeaderboard() {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(5);

      if (error) {
        console.warn('Leaderboard info:', error.message);
        return [];
      }

      return data || [];
    } catch {
      return [];
    }
  },

  async registerForQuest(userId, questId) {
    const { data, error } = await supabase
      .from('user_quest_history')
      .insert({
        user_id: userId,
        quest_id: questId,
        status: 'participated',
        xp_awarded: 0
      })
      .select();

    if (error) {
      console.error('Error registering for quest:', error);
      throw error;
    }

    return data;
  },

  async fetchAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all profiles:', error);
      throw error;
    }

    return data;
  },

  async fetchAllQuestHistory() {
    const { data, error } = await supabase
      .from('user_quest_history')
      .select(`
        *,
        quests (*),
        profiles (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all quest history:', error);
      throw error;
    }

    return data;
  },

  // CREATE QUEST
  async insertQuest(questData) {
    const { data, error } = await supabase
      .from('quests')
      .insert([questData])
      .select();

    if (error) {
      console.error('Error inserting quest:', error);
      throw error;
    }

    return data;
  },

  // UPDATE QUEST
  async updateQuest(id, questData) {
    const { data, error } = await supabase
      .from('quests')
      .update(questData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating quest:', error);
      throw error;
    }

    return data;
  },

  // DELETE QUEST
  async deleteQuest(id) {
    const { data, error } = await supabase
      .from('quests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quest:', error);
      throw error;
    }

    return data;
  }
};
