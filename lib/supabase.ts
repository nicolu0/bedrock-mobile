import "react-native-url-polyfill/auto"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://gfchomyeorzhbybfsqxf.supabase.co"
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmY2hvbXllb3J6aGJ5YmZzcXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NzgwNTUsImV4cCI6MjA4NTU1NDA1NX0.HlaklMMPe4uY-E2vRJutoC_nO2_FbJR-6r78pcxx5y8"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
