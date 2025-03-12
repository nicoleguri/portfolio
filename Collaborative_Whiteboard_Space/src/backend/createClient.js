import { createClient } from '@supabase/supabase-js'

// Retrieve Supabase URL from environment variable
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
// Retrieve Supabase API key from environment variable
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY
/**
 * Supabase client object.
 * 
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(supabaseUrl, supabaseKey)