"use client";

import { useState } from "react";
import { Share2, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ShareImagesButtonProps {
  fotos: Array<{ url: string }>;
  vehicleDisplay: string;
}

export function ShareImagesButton({ fotos, vehicleDisplay }: ShareImagesButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAll = async () => {
    if (!fotos.length) return;
    
    setIsDownloading(true);
    try {
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i];
        const response = await fetch(foto.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${vehicleDisplay.replace(/\s+/g, '_')}_foto_${i + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        if (i < fotos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    } catch (error) {
      console.error('Erro ao baixar imagens:', error);
      alert('Erro ao baixar algumas imagens. Tente novamente.');
    } finally {
      setIsDownloading(false);
      setShowMenu(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!fotos.length) return;

    const mensagem = `🚗 ${vehicleDisplay}\n\n📸 Confira as fotos deste veículo:\n\n${fotos.map((foto, i) => `Foto ${i + 1}: ${foto.url}`).join('\n\n')}`;
    
    const mensagemCodificada = encodeURIComponent(mensagem);
    
    const whatsappUrl = `https://wa.me/?text=${mensagemCodificada}`;
    window.open(whatsappUrl, '_blank');
    setShowMenu(false);
  };

  if (!fotos.length) return null;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="md"
        leftIcon={<Share2 className="h-4 w-4" />}
        onClick={() => setShowMenu(!showMenu)}
      >
        Compartilhar fotos
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <Card
            variant="elevated"
            className="absolute right-0 top-full mt-2 z-50 w-64"
          >
            <Card.Body className="p-2">
              <button
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloading ? 'Baixando...' : `Baixar todas (${fotos.length})`}</span>
              </button>
              
              <button
                onClick={handleShareWhatsApp}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Compartilhar no WhatsApp</span>
              </button>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
