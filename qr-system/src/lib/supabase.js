import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://osvqlxpjlrovcwhzwsal.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdnFseHBqbHJvdmN3aHp3c2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDk2MTcsImV4cCI6MjA4MTA4NTYxN30.3mjun77EXxvqbJlqC5b2CG-WMnO4N9JlnCqChEf4mtA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
