import { api } from "../../lib/axiosClient";
import type { Vehicle } from "../../types";

export class Veiculos {

  static async fetchAll() {
    const { data } = await api.get<{ vehicles: []}>("/vehicles");
    return data;
  }

  static async create(payload: Partial<Vehicle>): Promise<Vehicle> {
    const { data } = await api.post("/vehicles", payload);
    return data as Vehicle;
  }

  static async update(
    id: string,
    payload: Partial<Vehicle>
  ): Promise<Vehicle> {
    const { data } = await api.put(`/vehicles/${id}`, payload);
    return data as Vehicle;
  }

  static async remove(id: string): Promise<{ success: boolean }> {
    const { data } = await api.delete(`/vehicles/${id}`);
    return data as { success: boolean };
  }
}