import { supabase } from './supabaseClient'

export const gradoService = {
  async getAll() {
    const { data, error } = await supabase
      .from('grados')
      .select('*')
      .order('nivel', { ascending: true })
    return { data, error }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('grados')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async create(nombre, nivel) {
    const { data, error } = await supabase
      .from('grados')
      .insert([{ nombre, nivel }])
      .select()
    return { data, error }
  },

  async update(id, nombre, nivel) {
    const { data, error } = await supabase
      .from('grados')
      .update({ nombre, nivel })
      .eq('id', id)
      .select()
    return { data, error }
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('grados')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}
