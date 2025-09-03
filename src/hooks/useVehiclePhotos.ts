// src/hooks/useVehiclePhotos.ts (React)
import { useState, useEffect, useCallback } from "react";
import { listVehiclePhotos, uploadVehiclePhotos, deleteVehiclePhoto, reorderVehiclePhotos } from "../services/veiculos/vehiclePhotos";
import type { PhotoItem } from "../services/veiculos/vehiclePhotos";

export function useVehiclePhotos(vehicleId: string | undefined | null) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!vehicleId) return setPhotos([]);
    setLoading(true);
    try {
      const items = await listVehiclePhotos(vehicleId, { signed: false });
      setPhotos(items);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = useCallback(async (files: File[], opts?: { replaceExisting?: boolean }) => {
    if (!vehicleId) throw new Error("vehicleId missing");
    setLoading(true);
    try {
      const items = await uploadVehiclePhotos(vehicleId, files, { replaceExisting: opts?.replaceExisting ?? true, signed: false });
      setPhotos(items);
      return items;
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  const remove = useCallback(async (filename: string) => {
    if (!vehicleId) throw new Error("vehicleId missing");
    setLoading(true);
    try {
      await deleteVehiclePhoto(vehicleId, filename);
      await load();
    } finally {
      setLoading(false);
    }
  }, [vehicleId, load]);

  const reorder = useCallback(async (orderedNames: string[]) => {
    if (!vehicleId) throw new Error("vehicleId missing");
    setLoading(true);
    try {
      const items = await reorderVehiclePhotos(vehicleId, orderedNames, { signed: false });
      setPhotos(items);
      return items;
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  return { photos, loading, error, reload: load, upload, remove, reorder };
}
