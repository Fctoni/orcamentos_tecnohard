'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Processo } from '@/lib/types/app'

export function useProcessos() {
  const supabase = createClient()
  const [processos, setProcessos] = useState<Processo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('processos')
        .select('*')
        .eq('ativo', true)
        .order('ordem')
      
      setProcessos(data || [])
      setLoading(false)
    }
    fetch()
  }, [supabase])

  return { processos, loading }
}

