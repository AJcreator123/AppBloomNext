// src/lib/supabase.ts

import 'react-native-url-polyfill/auto';  // <-- REQUIRED FOR REACT NATIVE
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nepohvfehtgyydsaknjn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcG9odmZlaHRneXlkc2FrbmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MjYwNDUsImV4cCI6MjA3ODIwMjA0NX0.L51yGKouLxfbdZPBQ65cbv9Ub8P9VhDj-7b5CVXYGNU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
