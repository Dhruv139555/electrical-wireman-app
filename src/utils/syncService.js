/**
 * Supabase Cloud Sync Service using standard REST API (fetch)
 * Avoids Supabase JS library dependency for bundle optimization.
 */

// Helper to format Supabase REST URL
function getRestUrl(supabaseUrl) {
  // Ensure no trailing slash
  const url = supabaseUrl.replace(/\/$/, '');
  return `${url}/rest/v1/wireman_sync`;
}

// Helper to get standard headers
function getHeaders(supabaseKey, isUpsert = false) {
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  };
  
  if (isUpsert) {
    headers['Content-Type'] = 'application/json';
    headers['Prefer'] = 'resolution=merge-duplicates';
  }
  
  return headers;
}

/**
 * Test the connection to the Supabase database.
 * Verifies if the table exists and credentials are correct.
 */
export async function testSyncConnection(supabaseUrl, supabaseKey) {
  try {
    const url = `${getRestUrl(supabaseUrl)}?select=id&limit=1`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(supabaseKey)
    });
    
    if (response.status === 404) {
      throw new Error('Table "wireman_sync" not found. Please run the SQL script in your Supabase SQL Editor first.');
    }
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Connection failed: ${response.status} ${response.statusText} - ${errText}`);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Pull all collections from the Supabase sync table
 */
export async function pullSyncData(supabaseUrl, supabaseKey, userId = null) {
  try {
    let url = `${getRestUrl(supabaseUrl)}?select=*`;
    
    if (userId) {
      const collections = ['companyProfile', 'materials', 'clients', 'invoices', 'quotations', 'estimates'];
      const targetIds = collections.map(col => `${userId}_${col}`);
      const inFilter = `id=in.(${targetIds.map(id => `"${id}"`).join(',')})`;
      url = `${getRestUrl(supabaseUrl)}?${inFilter}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(supabaseKey)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sync data: ${response.statusText}`);
    }
    
    const rows = await response.json();
    // Convert array of rows [{ id, data, updated_at }] to an object keyed by id
    const result = {};
    rows.forEach(row => {
      let key = row.id;
      if (userId && key.startsWith(`${userId}_`)) {
        key = key.substring(userId.length + 1);
      }
      result[key] = {
        data: row.data,
        updatedAt: row.updated_at
      };
    });
    return { success: true, collections: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Push a single collection to Supabase (upsert)
 */
export async function pushSyncData(supabaseUrl, supabaseKey, id, data, userId = null) {
  try {
    const url = getRestUrl(supabaseUrl);
    const dbId = userId ? `${userId}_${id}` : id;
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(supabaseKey, true),
      body: JSON.stringify({
        id: dbId,
        data: data,
        updated_at: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to push sync data for ${dbId}: ${errText}`);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign up a new user with email and password
 */
export async function signUpUser(supabaseUrl, supabaseKey, email, password) {
  try {
    const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/signup`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || data.error_description || data.error || 'Failed to sign up');
    }
    
    return { success: true, user: data.user, session: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign in a user with email and password
 */
export async function signInUser(supabaseUrl, supabaseKey, email, password) {
  try {
    const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/token?grant_type=password`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error_description || data.error || 'Failed to sign in');
    }
    
    return { success: true, user: data.user, session: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user information using the access token
 */
export async function getUser(supabaseUrl, supabaseKey, accessToken) {
  try {
    const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error_description || data.error || 'Failed to fetch user');
    }
    
    return { success: true, user: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Sign out a user
 */
export async function signOutUser(supabaseUrl, supabaseKey, accessToken) {
  try {
    const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/logout`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      let errText = 'Failed to sign out';
      try {
        const data = await response.json();
        errText = data.error_description || data.error || errText;
      } catch (_) {}
      throw new Error(errText);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


/**
 * Merges local and remote collections by item ID to prevent data loss.
 * If an item ID exists in both, the latest one is kept (comparing timestamps if available, otherwise preferring local).
 */
export function mergeCollection(local, remote) {
  if (!Array.isArray(local)) return remote || [];
  if (!Array.isArray(remote)) return local || [];
  
  const mergedMap = new Map();
  
  // Load remote items
  remote.forEach(item => {
    if (item && item.id) {
      mergedMap.set(item.id, item);
    }
  });
  
  // Load local items, merging intelligently
  local.forEach(localItem => {
    if (localItem && localItem.id) {
      const remoteItem = mergedMap.get(localItem.id);
      if (remoteItem) {
        // Compare dates if they exist (e.g. for invoices/quotations)
        const localTime = localItem.timestamp ? new Date(localItem.timestamp).getTime() : 0;
        const remoteTime = remoteItem.timestamp ? new Date(remoteItem.timestamp).getTime() : 0;
        
        if (localTime >= remoteTime) {
          mergedMap.set(localItem.id, localItem);
        }
      } else {
        mergedMap.set(localItem.id, localItem);
      }
    }
  });
  
  return Array.from(mergedMap.values());
}
