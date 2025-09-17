// src/pages/EditVehicle.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Store } from "lucide-react";
import { toast } from "sonner";

import { useVehicles } from "../hooks/useVehicles";
import { useCurrentStore, type Loja } from "../hooks/useCurrentStore"; // ✅ hook corrigido
import { Tabelas } from "./../types";
import { GalleryManager } from "../components/editVehicle/GalleryManager";

type VeiculoUpload = Tabelas.VeiculoUpload;

const EditVehicle: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  const { getVehicle, updateVehicle, deleteVehicle, isLoading } = useVehicles();
  const { lojas, lojaId, lojaNome, setSelectedLoja, loading: lojaLoading } =
    useCurrentStore();

  const [activeTab, setActiveTab] = useState<"details" | "gallery">("details");
  const [showTransferModal, setShowTransferModal] = useState(false);

  const canEdit = true;
  const canDelete = true;

  const vehicle = getVehicle(vehicleId || "");
  const [form, setForm] = useState<Partial<VeiculoUpload>>({});

  if (isLoading || lojaLoading) return <LoadingPlaceholder />;

  if (!vehicle)
    return (
      <div className="p-6 max-w-5xl mx-auto text-center text-slate-700">
        Veículo não encontrado
      </div>
    );

  const handleSave = async (updatedData: Partial<VeiculoUpload>) => {
    if (!canEdit)
      return toast.error("Você não tem permissão para editar este veículo.");
    await updateVehicle({ id: vehicle.id, payload: updatedData });
    toast.success("Veículo atualizado com sucesso!");
    navigate(`/app/veiculos/${vehicle.id}`);
  };

  const handleDelete = async () => {
    if (!canDelete)
      return toast.error("Você não tem permissão para excluir este veículo.");
    if (!window.confirm("Deseja realmente excluir este veículo?")) return;
    await deleteVehicle(vehicle.id);
    toast.success("Veículo excluído com sucesso!");
    navigate("/app/estoque");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      {/* Header */}
      <Header
        vehicle={vehicle}
        navigate={navigate}
        setShowTransferModal={setShowTransferModal}
        canDelete={canDelete}
        handleDelete={handleDelete}
        lojaNome={lojaNome ?? "Nenhuma loja selecionada"}
      />

      {/* Seletor de Loja */}
      <StoreSelector
        lojas={lojas}
        lojaId={lojaId ?? null}
        lojaNome={lojaNome}
        setSelectedLoja={setSelectedLoja}
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        {["details", "gallery"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "details" | "gallery")}
            className={`py-2 px-6 font-semibold transition ${activeTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-700"
                : "text-gray-600 hover:text-gray-800"
              }`}
          >
            {tab === "details" ? "Detalhes do Veículo" : "Galeria de Fotos"}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {activeTab === "details" ? (
        <DetailsForm
          vehicle={vehicle}
          form={form}
          setForm={setForm}
          handleSave={handleSave}
        />
      ) : (
        <GalleryManager vehicleId={vehicleId ?? ""} />
      )}

      {showTransferModal && (
        <TransferModal close={() => setShowTransferModal(false)} />
      )}
    </div>
  );
};

export default EditVehicle;

/* ======= NOVO COMPONENTE: SELETOR DE LOJA ======= */
const StoreSelector = ({
  lojas,
  lojaId,
  lojaNome,
  setSelectedLoja,
}: {
  lojas: { id: string; nome: string }[];
  lojaId: string | null;
  lojaNome: string | null;
  setSelectedLoja: (loja: Loja | null) => void;
}) => {
  return (
    <div className="bg-white shadow rounded-md p-4 mb-6 max-w-md mx-auto">
      <label className="flex items-center gap-2 text-slate-800 font-medium mb-2">
        <Store className="w-4 h-4" /> Selecione a Loja
      </label>
      <select
        key={lojaId || null}
        value={lojaNome ?? ""}
        onChange={(e) => setSelectedLoja(lojas.find((l) => l.nome === e.target.value) || null)}
        className="w-full border rounded p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">-- Nenhuma loja selecionada --</option>
        {lojas.map((loja) => (
          <option key={loja.id} value={loja.nome}>
            {loja.nome}
          </option>
        ))}
      </select>
    </div>
  );
};

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
  setShowTransferModal,
  canDelete,
  handleDelete,
  lojaNome,
}: {
  vehicle: VeiculoUpload;
  navigate: (path: string) => void;
  setShowTransferModal: (val: boolean) => void;
  canDelete: boolean;
  handleDelete: () => void;
  lojaNome: string;
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
    <div>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar aos Detalhes
      </button>
      <h1 className="text-3xl font-bold text-slate-900 mt-2">
        {vehicle.modelo_id ?? "Modelo não informado"}
      </h1>
      <p className="text-gray-600">{vehicle.placa}</p>
      <p className="text-sm text-gray-500">Loja: {lojaNome}</p>
    </div>
    <div className="flex items-center gap-2 mt-2 sm:mt-0">
      <button
        onClick={() => setShowTransferModal(true)}
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
  setForm: React.Dispatch<React.SetStateAction<Partial<VeiculoUpload>>>;
  handleSave: (updated: Partial<VeiculoUpload>) => void;
}) => (
  <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto space-y-4">
    <label className="block text-sm font-medium text-gray-700">Placa</label>
    <input
      type="text"
      defaultValue={vehicle.placa}
      onChange={(e) => setForm((f) => ({ ...f, placa: e.target.value }))}
      className="border p-3 rounded w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      placeholder="Placa"
    />

    <label className="block text-sm font-medium text-gray-700">Local</label>
    <input
      type="text"
      defaultValue={vehicle.local}
      onChange={(e) => setForm((f) => ({ ...f, local: e.target.value }))}
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
