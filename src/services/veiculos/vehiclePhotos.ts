import { supabase } from "../../lib/supabaseClient";

/**
 * Tipos de retorno
 */
export type PhotoItem = {
    name: string;       // ex: "1.png"
    path: string;       // ex: "vehicleId/1.png"
    url?: string | null; // public URL or signed URL
    metadata?: any;     // metadata from storage.list
};

/**
 * Helpers
 */

// Converte qualquer File de imagem para PNG (mantendo qualidade 0.9)
async function ensurePng(file: File): Promise<File> {
    if (file.type === "image/png") return file;

    // cria imagem no browser via <img> e canvas
    const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        // important: allow crossOrigin if you load remote pre-signed urls
        i.crossOrigin = "anonymous";
        const reader = new FileReader();
        reader.onload = () => {
            i.src = reader.result as string;
        };
        reader.onerror = rej;
        reader.readAsDataURL(file);
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b as Blob), "image/png", 0.9)
    );

    return new File([blob], file.name.replace(/\.[^.]+$/, ".png"), {
        type: "image/png",
    });
}

// extrai índice numérico do nome do arquivo (1.png -> 1). retorna Infinity se nao achar
function extractIndex(name: string): number {
    const matched = name.match(/^(\d+)(\.[^.]+)?$/);
    if (!matched) return Infinity;
    return Number(matched[1]);
}

// ordena pela indexação numérica do filename. nomes não numéricos vão pro final
function sortByNumericName(a: PhotoItem, b: PhotoItem) {
    const ai = extractIndex(a.name);
    const bi = extractIndex(b.name);
    if (ai === bi) return a.name.localeCompare(b.name);
    return ai - bi;
}

/**
 * Lista as fotos de um veículo (ordenadas por nome)
 * - vehicleId: id do veículo (pasta)
 * - opts.signed: se true retorna signed URL com expirySeconds (por padrão false -> usa public URL quando disponível)
 */
export async function listVehiclePhotos(
    vehicleId: string,
    opts?: { signed?: boolean; expiresInSeconds?: number }
): Promise<PhotoItem[]> {
    const bucket = "veiculos";
    // lista a "pasta" vehicleId/
    const { data, error } = await supabase.storage.from(bucket).list(vehicleId, {
        limit: 1000,
        offset: 0,
        sortBy: { column: "name", order: "asc" }, // não garante ordem numérica, por isso será ordenado abaixo
    });

    if (error) throw error;

    const basePath = (name: string) => `${vehicleId}/${name}`;

    const items: PhotoItem[] = await Promise.all(
        (data ?? []).map(async (f) => {
            const item: PhotoItem = { name: f.name, path: basePath(f.name), metadata: f };
            if (opts?.signed) {
                // signed (tempo limitado)
                const { data: signedData, error: signedErr } = await supabase.storage
                    .from(bucket)
                    .createSignedUrl(item.path, opts.expiresInSeconds ?? 60);
                if (!signedErr && signedData) item.url = signedData.signedUrl;
            } else {
                const publicURL = supabase.storage.from(bucket).getPublicUrl(item.path);
                item.url ? publicURL ?? null : null;
            }
            return item;
        })
    );

    // ordena por nome numericamente (1.png, 2.png, ...)
    items.sort(sortByNumericName);
    return items;
}

/**
 * Upload de fotos para um veículo
 * - files: File[] do input
 * - replaceExisting: se true, apaga existentes antes e grava 1..N; se false, faz append depois do maior index
 * - returns PhotoItem[] com urls (public ou signed dependendo do opts)
 */
export async function uploadVehiclePhotos(
    vehicleId: string,
    files: File[],
    opts?: { replaceExisting?: boolean; signed?: boolean; expiresInSeconds?: number }
): Promise<PhotoItem[]> {
    const bucket = "veiculos";
    const replaceExisting = opts?.replaceExisting ?? true;

    // 1) lista existentes
    const existing = await listVehiclePhotos(vehicleId, { signed: false });
    let startIndex = 1;
    if (!replaceExisting && existing.length > 0) {
        // calcular maior índice existente
        const maxIndex = existing.reduce((max, it) => Math.max(max, extractIndex(it.name) || 0), 0);
        startIndex = maxIndex + 1;
    }

    // 2) se replace, apagar todos existentes (para garantir nomes 1..N)
    if (replaceExisting && existing.length > 0) {
        const pathsToDelete = existing.map((it) => it.path);
        const { error: delErr } = await supabase.storage.from(bucket).remove(pathsToDelete);
        if (delErr) {
            // se falhar na remoção, continuar (opcionalmente você pode throw)
            console.warn("Falha ao deletar arquivos existentes:", delErr);
        }
    }

    // 3) converter arquivos para PNG e enviar com nomes sequenciais: 1.png,2.png,...
    const uploadedItems: PhotoItem[] = [];
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const pngFile = await ensurePng(f); // garante extension .png
        const seq = startIndex + i;
        const destName = `${seq}.png`;
        const destPath = `${vehicleId}/${destName}`;

        // upload (overwrite: true para sobrescrever caso exista)
        const { data: uploadData, error: uploadErr } = await supabase.storage
            .from(bucket)
            .upload(destPath, pngFile, { upsert: true });

        if (uploadErr) {
            throw uploadErr;
        }

        // obter URL (public ou signed)
        let url: string | null = null;
        if (opts?.signed) {
            const { data: signed } = await supabase.storage
                .from(bucket)
                .createSignedUrl(destPath, opts.expiresInSeconds ?? 60);
            url = signed?.signedUrl ?? null;
        } else {
            const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(destPath);
            url = publicData?.publicUrl ?? null;
        }


        uploadedItems.push({ name: destName, path: destPath, url, metadata: uploadData });
    }

    // 4) retornar a lista final ordenada (se quiser, re-lista do storage)
    return await listVehiclePhotos(vehicleId, { signed: opts?.signed, expiresInSeconds: opts?.expiresInSeconds });
}

/**
 * Deleta uma foto específica (por name ex: "3.png")
 */
export async function deleteVehiclePhoto(vehicleId: string, filename: string) {
    const bucket = "veiculos";
    const path = `${vehicleId}/${filename}`;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return { success: true };
}

/**
 * Reordena as fotos: recebe um array de nomes existentes (ex: ["3.png","1.png","2.png"]) e escreve 1.png,2.png,3.png na ordem fornecida.
 * Implementação: baixa cada arquivo na ordem desejada e reuploada com nome sequencial. Depois apaga nomes antigos (para evitar duplicidade).
 *
 * Atenção: essa operação carrega os blobs no cliente. Para muitos arquivos/grandes, use um endpoint server-side.
 */
export async function reorderVehiclePhotos(vehicleId: string, orderedNames: string[], opts?: { signed?: boolean; expiresInSeconds?: number }) {
    const bucket = "veiculos";

    // 1) baixar blobs na ordem desejada
    const blobs: { name: string; blob: Blob }[] = [];
    for (const name of orderedNames) {
        const path = `${vehicleId}/${name}`;
        const { data, error } = await supabase.storage.from(bucket).download(path);
        if (error) throw error;
        const blob = data as Blob;
        blobs.push({ name, blob });
    }

    // 2) apagar arquivos antigos (opcional: vamos apagar todos antes de reupload)
    const existingList = await listVehiclePhotos(vehicleId);
    const existingPaths = existingList.map((it) => it.path);
    if (existingPaths.length > 0) {
        const { error: delErr } = await supabase.storage.from(bucket).remove(existingPaths);
        if (delErr) {
            console.warn("Falha ao deletar arquivos existentes antes do reorder:", delErr);
            // não abortamos — ainda tentaremos reuploadar
        }
    }

    // 3) reupload como 1.png,2.png,...
    for (let i = 0; i < blobs.length; i++) {
        const seq = i + 1;
        const destName = `${seq}.png`;
        const destPath = `${vehicleId}/${destName}`;
        const file = new File([blobs[i].blob], destName, { type: "image/png" });

        const { error: upErr } = await supabase.storage.from(bucket).upload(destPath, file, { upsert: true });
        if (upErr) throw upErr;
    }

    // 4) retornar nova lista
    return await listVehiclePhotos(vehicleId, { signed: opts?.signed, expiresInSeconds: opts?.expiresInSeconds });
}
