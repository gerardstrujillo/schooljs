import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ohofjvljqhyysnyzemuo.supabase.co"
const supabaseAnonKey = "sb_publishable_EUgJF566Kh0hY5DRotM2EA_Fw5VSCI3"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
