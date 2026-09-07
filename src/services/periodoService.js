import { supabase } from './supabaseClient'

export const periodoService = {
  async getAll() {
    const { data, error } = await supabase
      .from('periodos')
      .select('*')
      .order('año', { ascending: false })
      .order('numero', { ascending: true })
    return { data, error }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('periodos')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async create(nombre, numero, año, fechaInicio, fechaFin) {
    const { data, error } = await supabase
      .from('periodos')
      .insert([{
        nombre,
        numero,
        año,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      }])
      .select()
    return { data, error }
  },

  async update(id, nombre, numero, año, fechaInicio, fechaFin) {
    const { data, error } = await supabase
      .from('periodos')
      .update({
        nombre,
        numero,
        año,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      })
      .eq('id', id)
      .select()
    return { data, error }
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('periodos')
      .delete()
      .eq('id', id)
    return { data, error }
  }
}
