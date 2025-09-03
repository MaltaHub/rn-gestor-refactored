import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useVehicles } from "../hooks/useVehicles";
import { useVehiclePhotos } from "../hooks/useVehiclePhotos";
import { Tabelas } from "./../types";

type VeiculoUpload = Tabelas.VeiculoUpload;

const EditVehicle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVehicle, updateVehicle, deleteVehicle, isLoading } = useVehicles();
  const [activeTab, setActiveTab] = useState<"details" | "gallery">("details");
  const [isTransferring, setIsTransferring] = useState(false);

  const canEdit = true;
  const canDelete = true;

  const vehicle = getVehicle(id || "");
  const [form, setForm] = useState<Partial<VeiculoUpload>>({});

  const { photos, loading: photosLoading, upload, remove, reorder, reload } =
    useVehiclePhotos(vehicle?.id || undefined);
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (isLoading) return <LoadingPlaceholder />; // componente separado para animação

  if (!vehicle)
    return (
      <div className="p-6 max-w-5xl mx-auto text-center text-gray-600">
        Veículo não encontrado
      </div>
    );

  const handleSave = async (updatedData: Partial<VeiculoUpload>) => {
    if (!canEdit) return toast.error("Você não tem permissão para editar este veículo.");
    await updateVehicle({ id: vehicle.id, payload: updatedData });
    toast.success("Veículo atualizado com sucesso!");
    navigate(`/vehicle/${vehicle.id}`);
  };

  const handleDelete = async () => {
    if (!canDelete) return toast.error("Você não tem permissão para excluir este veículo.");
    if (!window.confirm("Deseja realmente excluir este veículo?")) return;
    await deleteVehicle(vehicle.id);
    toast.success("Veículo excluído com sucesso!");
    navigate("/inventory");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <Header
        vehicle={vehicle}
        navigate={navigate}
        setIsTransferring={setIsTransferring}
        canDelete={canDelete}
        handleDelete={handleDelete}
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {["details", "gallery"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "details" | "gallery")}
            className={`py-2 px-6 font-semibold transition ${
              activeTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "details" ? "Detalhes do Veículo" : "Galeria de Fotos"}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {activeTab === "details" ? (
        <DetailsForm vehicle={vehicle} form={form} setForm={setForm} handleSave={handleSave} />
      ) : (
        <GalleryManager
          photos={photos}
          photosLoading={photosLoading}
          inputRef={inputRef}
          upload={upload}
          remove={remove}
          reorder={reorder}
          reload={reload}
        />
      )}

      {/* Modal Transferência */}
      {isTransferring && <TransferModal close={() => setIsTransferring(false)} />}
    </div>
  );
};

export default EditVehicle;

/* ===== COMPONENTES AUXILIARES ===== */

const LoadingPlaceholder = () => (
  <div className="p-6 max-w-5xl mx-auto space-y-6">
    <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
    <div className="h-96 w-full bg-gray-200 animate-pulse rounded" />
  </div>
);

const Header = ({
  vehicle,
  navigate,
  setIsTransferring,
  canDelete,
  handleDelete,
}: {
  vehicle: VeiculoUpload;
  navigate: any;
  setIsTransferring: (val: boolean) => void;
  canDelete: boolean;
  handleDelete: () => void;
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
    <div>
      <button
        onClick={() => navigate(`/vehicle/${id}`)}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar aos Detalhes
      </button>
      <h1 className="text-3xl font-bold text-slate-900 mt-2">{vehicle.modelo_id ?? "Modelo não informado"}</h1>
      <p className="text-gray-600">{vehicle.placa}</p>
    </div>
    <div className="flex items-center gap-2 mt-2 sm:mt-0">
      <button
        onClick={() => setIsTransferring(true)}
        disabled={vehicle.estado_venda === "vendido"}
        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 transition"
      >
        Transferir Loja
      </button>
      {canDelete && (
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" /> Excluir
        </button>
      )}
    </div>
  </div>
);

const DetailsForm = ({
  vehicle,
  form,
  setForm,
  handleSave,
}: {
  vehicle: VeiculoUpload;
  form: Partial<VeiculoUpload>;
  setForm: any;
  handleSave: any;
}) => (
  <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto space-y-4">
    <label className="block text-sm font-medium text-gray-700">Placa</label>
    <input
      type="text"
      defaultValue={vehicle.placa}
      onChange={(e) => setForm((f: any) => ({ ...f, placa: e.target.value }))}
      className="border p-3 rounded w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      placeholder="Placa"
    />

    <label className="block text-sm font-medium text-gray-700">Local</label>
    <input
      type="text"
      defaultValue={vehicle.local}
      onChange={(e) => setForm((f: any) => ({ ...f, local: e.target.value }))}
      className="border p-3 rounded w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      placeholder="Local"
    />

    <button
      onClick={() => handleSave(form)}
      className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition w-full"
    >
      Salvar Alterações
    </button>
  </div>
);

const GalleryManager = ({
  photos,
  photosLoading,
  inputRef,
  upload,
  remove,
  reorder,
  reload,
}: any) => (
  <div className="bg-white shadow-md rounded-lg p-6 max-w-5xl mx-auto space-y-4">
    <div className="flex items-center gap-2 mb-4 text-gray-700 font-medium">
      <Camera className="w-5 h-5" /> Galeria de Fotos
    </div>

    {/* Upload */}
    <div className="mb-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="border rounded p-2"
        onChange={async (e) => {
          if (!e.target.files) return;
          await upload(Array.from(e.target.files), { replaceExisting: false });
          reload();
        }}
      />
    </div>

    {/* Lista */}
    {photosLoading ? (
      <p>Carregando fotos...</p>
    ) : photos.length === 0 ? (
      <p className="text-gray-400">Nenhuma foto disponível</p>
    ) : (
      <div className="grid grid-cols-4 gap-4">
        {photos.map((p: any) => (
          <div key={p.path} className="relative group rounded overflow-hidden shadow hover:shadow-lg transition">
            <img src={p.url ?? ""} alt={p.name} className="w-full h-32 object-cover" />
            <button
              onClick={() => remove(p.name)}
              className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    )}

    {/* Reorder rápido */}
    {photos.length > 1 && (
      <button
        onClick={async () => {
          const order = prompt("Digite nomes das fotos na ordem desejada separados por vírgula");
          if (!order) return;
          const arr = order.split(",").map((s) => s.trim());
          await reorder(arr);
          reload();
        }}
        className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
      >
        Reordenar Fotos
      </button>
    )}
  </div>
);

const TransferModal = ({ close }: { close: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fadeIn">
      <h2 className="font-bold text-xl mb-4">Transferir Veículo</h2>
      <p>Funcionalidade de transferência aqui</p>
      <button
        onClick={close}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition w-full"
      >
        Fechar
      </button>
    </div>
  </div>
);