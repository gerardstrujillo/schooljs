import { supabase } from './supabaseClient'

export const cursoService = {
  async getAll() {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .order('nombre', { ascending: true })
    return { data, error }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async create(nombre, codigo) {
    const { data, error } = await supabase
      .from('cursos')
      .insert([{ nombre, codigo }])
      .select()
    return { data, error }
  },

  async update(id, nombre, codigo) {
    const { data, error } = await supabase
      .from('cursos')
      .update({ nombre, codigo })
      .eq('id', id)
      .select()
    return { data, error }
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('cursos')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}
