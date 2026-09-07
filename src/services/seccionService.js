import { supabase } from './supabaseClient'

export const seccionService = {
  async getAll() {
    const { data, error } = await supabase
      .from('secciones')
      .select('*, grados(nombre)')
      .order('nombre', { ascending: true })
    return { data, error }
  },

  async getByGrado(gradoId) {
    const { data, error } = await supabase
      .from('secciones')
      .select('*')
      .eq('grado_id', gradoId)
      .order('nombre', { ascending: true })
    return { data, error }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('secciones')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async create(nombre, gradoId) {
    const { data, error } = await supabase
      .from('secciones')
      .insert([{ nombre, grado_id: gradoId }])
      .select()
    return { data, error }
  },

  async update(id, nombre, gradoId) {
    const { data, error } = await supabase
      .from('secciones')
      .update({ nombre, grado_id: gradoId })
      .eq('id', id)
      .select()
    return { data, error }
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('secciones')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}
