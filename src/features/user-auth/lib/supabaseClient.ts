import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fqkklvevflnqbdsemapw.supabase.co';
const supabaseKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxa2tsdmV2ZmxucWJkc2VtYXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODE2ODgsImV4cCI6MjA2MTY1NzY4OH0.ahs7hfn2olzCkn0gUw4HG4Q2FQLbFdmLHzkKlW9n-I0';

export const supabase = createClient(supabaseUrl, supabaseKey);
