const SUPABASE_URL = 'https://aoomudynybikamxpcpoa.supabase.co';

/**
 * Insert history records to Supabase
 * @param {Array} records - History records to insert
 * @param {string} anonKey - Supabase anon key
 * @returns {Promise<{success: boolean, inserted: number, error?: string}>}
 */
export async function insertHistory(records, anonKey) {
  if (!records || records.length === 0) {
    return { success: true, inserted: 0 };
  }

  // Transform records to Supabase format
  const supabaseRecords = records.map(item => ({
    timestamp: item.timestamp,
    user_name: item.user,
    user_id: item.userId,
    track: item.track,
    artist: item.artist,
    uri: item.uri,
    image_url: item.imageUrl || null
  }));

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/listening_history`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify(supabaseRecords)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase insert error:', error);
      return { success: false, inserted: 0, error };
    }

    return { success: true, inserted: supabaseRecords.length };
  } catch (error) {
    console.error('Supabase insert failed:', error);
    return { success: false, inserted: 0, error: error.message };
  }
}

/**
 * Fetch history records from Supabase with pagination and search
 * @param {string} anonKey - Supabase anon key
 * @param {{ limit?: number, offset?: number, search?: string }} options
 * @returns {Promise<{ data: Array, count: number }>}
 */
export async function fetchHistory(anonKey, { limit = 1000, offset = 0, search } = {}) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/listening_history?select=*&order=timestamp.desc&limit=${limit}&offset=${offset}`;

    if (search) {
      const s = encodeURIComponent(`%${search}%`);
      url += `&or=(track.ilike.${s},artist.ilike.${s},user_name.ilike.${s})`;
    }

    const response = await fetch(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Prefer': 'count=exact'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase fetch error:', error);
      return { data: [], count: 0 };
    }

    const data = await response.json();
    const countHeader = response.headers.get('content-range');
    const count = countHeader ? parseInt(countHeader.split('/')[1], 10) || 0 : data.length;

    return { data, count };
  } catch (error) {
    console.error('Supabase fetch failed:', error);
    return { data: [], count: 0 };
  }
}

/**
 * Get history count from Supabase
 * @param {string} anonKey - Supabase anon key
 * @returns {Promise<number>}
 */
export async function getHistoryCount(anonKey) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/listening_history?select=count`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Prefer': 'count=exact'
      }
    });

    const countHeader = response.headers.get('content-range');
    if (countHeader) {
      const total = countHeader.split('/')[1];
      return parseInt(total, 10) || 0;
    }
    return 0;
  } catch (error) {
    console.error('Supabase count failed:', error);
    return 0;
  }
}
