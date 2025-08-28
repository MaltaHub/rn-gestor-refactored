import { useVehicles, useCreateVehicle, useDeleteVehicle } from '../hooks/useVehicles'
import { useState } from 'react'
import type { Vehicle } from '../types'

export function Dashboard() {
  const { data, isLoading, error } = useVehicles()
  const create = useCreateVehicle()
  const remove = useDeleteVehicle()
  const [name, setName] = useState('')

  if (isLoading) return <div>Carregando veículos...</div>
  if (error) return <div>Erro ao carregar</div>

  console.log('Dados dos veículos:', data)

  return (
    <div>
      <h2>Veículos</h2>
      <ul>
        {data?.vehicles?.map((v : Vehicle) => (
          <li key={v.id}>
            {v.name}
            <button onClick={() => remove.mutate(v.id)}>Excluir</button>
          </li>
        ))}
      </ul>

      <form onSubmit={(e) => { e.preventDefault(); create.mutate({ name }); setName('') }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do veículo" />
        <button type="submit">Criar</button>
      </form>
    </div>
  )
}