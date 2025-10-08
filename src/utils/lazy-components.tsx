/**
 * Lazy Loading de Componentes
 * Carrega componentes pesados sob demanda para melhor performance inicial
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Skeleton className="h-32 w-full" />
  </div>
);

export const LazyPhotoGallery = dynamic(
  () => import('@/components/PhotoGallery').then((mod) => ({ default: mod.PhotoGallery })),
  {
    loading: LoadingFallback,
    ssr: false,
  }
);

export const LazyGallery = dynamic(
  () => import('@/components/Gallery').then((mod) => ({ default: mod.PhotoGallery })),
  {
    loading: LoadingFallback,
    ssr: false,
  }
);

export const LazyAdminClient = dynamic(
  () => import('@/app/(app)/admin/AdminClient').then((mod) => mod.default || mod),
  {
    loading: LoadingFallback,
    ssr: false,
  }
);

export const LazyEstoqueCliente = dynamic(
  () => import('@/app/(app)/estoque/EstoqueCliente').then((mod) => mod.default || mod),
  {
    loading: LoadingFallback,
    ssr: false,
  }
);
