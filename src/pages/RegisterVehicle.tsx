// src/pages/RegisterVehicle.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabelas } from "../types";
import { useVehicles } from "../hooks/useVehicles";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "../store/authStore";

type VeiculoUpload = Tabelas.VeiculoUpload;

interface Modelo {
    id: string;
    nome: string;
    marca: string;
    combustivel: string;
    tipo_cambio: string;
    carroceria: string;
}

const RegisterVehicle: React.FC = () => {
    const navigate = useNavigate();
    const { createVehicle } = useVehicles();
    const [loading, setLoading] = useState(false);
    const [modelos, setModelos] = useState<Modelo[]>([]);

    const [form, setForm] = useState<VeiculoUpload>({
        placa: "",
        modelo_id: null,
        local: "",
        hodometro: 0,
        estagio_documentacao: null,
        estado_venda: "disponivel",
        estado_veiculo: null,
        cor: "",
        preco_venda: null,
        chassi: null,
        ano_modelo: null,
        ano_fabricacao: null,
        repetido_id: null,
        observacao: null,
    });

    const [showNewModelForm, setShowNewModelForm] = useState(false);
    const [newModel, setNewModel] = useState<Partial<Modelo>>({
        nome: "",
        marca: "",
        combustivel: "gasolina",
        tipo_cambio: "manual",
        carroceria: "hatch",
    });
    const [savingModel, setSavingModel] = useState(false);

    // carregar locais disponíveis
    const [locais, setLocais] = useState<{ id: string; nome: string }[]>([]);

    const fetchLocais = async () => {
        const { data, error } = await supabase
            .from("locais")
            .select("id,nome")
            .order("nome", { ascending: true });

        if (error) {
            console.error(error);
            return;
        }

        setLocais(data ?? []);
    };

    useEffect(() => {
        fetchLocais();
    }, []);


    // Carregar modelos disponíveis
    const fetchModelos = async () => {
        const { data, error } = await supabase
            .from("modelo")
            .select("id,nome,marca,combustivel,tipo_cambio,carroceria")
            .order("nome", { ascending: true });

        if (error) {
            console.error(error);
            return;
        }

        setModelos(data ?? []);
    };

    useEffect(() => {
        fetchModelos();
    }, []);

    const handleSaveVehicle = async () => {
        try {
            setLoading(true);

            const payload = Object.fromEntries(
                Object.entries(form).map(([k, v]) => [k, v === "" ? null : v])
            ) as VeiculoUpload;

            await createVehicle(payload);
            toast.success("Veículo registrado com sucesso!");
            navigate("/app/estoque");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao registrar veículo!");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveModel = async () => {
        try {
            setSavingModel(true);

            // Inserir novo modelo no Supabase
            const { data, error } = await supabase.from("modelo").insert([newModel]).select();

            if (error || !data) {
                console.error(error);
                toast.error("Erro ao cadastrar modelo!");
                return;
            }

            toast.success("Modelo cadastrado com sucesso!");
            setShowNewModelForm(false);
            setNewModel({
                nome: "",
                marca: "",
                combustivel: "gasolina",
                tipo_cambio: "manual",
                carroceria: "hatch",
            });

            fetchModelos(); // Atualiza lista de modelos
        } finally {
            setSavingModel(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-4">
                <button
                    onClick={() => useAuthStore.getState().logout()}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                    X Log out ( )
                </button>
                <h1 className="text-2xl font-bold mb-4">Registrar Novo Veículo</h1>

                <Input
                    label="Placa"
                    value={form.placa}
                    onChange={(v) => setForm({ ...form, placa: v.toUpperCase() })}
                    required
                />

                {/* Select de Modelo */}
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Modelo</label>
                    <div className="flex gap-2 items-center">
                        <select
                            value={form.modelo_id ?? ""}
                            onChange={(e) =>
                                setForm({ ...form, modelo_id: e.target.value || null })
                            }
                            className="border text-gray-700 rounded p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">-- Selecione um modelo --</option>
                            {modelos.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.marca} - {m.nome}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => setShowNewModelForm(!showNewModelForm)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                            + Novo Modelo
                        </button>
                    </div>
                </div>

                {/* Formulário de novo modelo */}
                {showNewModelForm && (
                    <div className="bg-gray-50 p-4 rounded shadow space-y-2 mt-2">
                        <Input
                            label="Marca"
                            value={newModel.marca ?? ""}
                            onChange={(v) => setNewModel({ ...newModel, marca: v })}
                        />
                        <Input
                            label="Nome"
                            value={newModel.nome ?? ""}
                            onChange={(v) => setNewModel({ ...newModel, nome: v })}
                        />
                        <Input
                            label="Combustível"
                            value={newModel.combustivel ?? ""}
                            onChange={(v) => setNewModel({ ...newModel, combustivel: v })}
                        />
                        <Input
                            label="Câmbio"
                            value={newModel.tipo_cambio ?? ""}
                            onChange={(v) => setNewModel({ ...newModel, tipo_cambio: v })}
                        />
                        <Input
                            label="Carroceria"
                            value={newModel.carroceria ?? ""}
                            onChange={(v) => setNewModel({ ...newModel, carroceria: v })}
                        />
                        <button
                            onClick={handleSaveModel}
                            disabled={savingModel}
                            className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                        >
                            {savingModel ? "Salvando..." : "Salvar Modelo"}
                        </button>
                    </div>
                )}

                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Local</label>
                    <select
                        value={form.local ?? ""}
                        onChange={(e) => setForm({ ...form, local: e.target.value })}
                        className="border text-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">-- Selecione um local --</option>
                        {locais.map((l) => (
                            <option key={l.id} value={l.id}>
                                {l.nome}
                            </option>
                        ))}
                    </select>
                </div>


                <Input
                    label="Hodômetro"
                    type="number"
                    value={form.hodometro}
                    onChange={(v) => setForm({ ...form, hodometro: Number(v) })}
                />

                <Input
                    label="Cor"
                    value={form.cor}
                    onChange={(v) => setForm({ ...form, cor: v })}
                />

                <Input
                    label="Preço de Venda"
                    type="number"
                    value={form.preco_venda ?? ""}
                    onChange={(v) =>
                        setForm({ ...form, preco_venda: v ? Number(v) : null })
                    }
                />

                <Input
                    label="Ano do Modelo"
                    type="number"
                    value={form.ano_modelo ?? ""}
                    onChange={(v) =>
                        setForm({ ...form, ano_modelo: v ? Number(v) : null })
                    }
                />

                <Input
                    label="Ano de Fabricação"
                    type="number"
                    value={form.ano_fabricacao ?? ""}
                    onChange={(v) =>
                        setForm({ ...form, ano_fabricacao: v ? Number(v) : null })
                    }
                />

                <Textarea
                    label="Observação"
                    value={form.observacao ?? ""}
                    onChange={(v) => setForm({ ...form, observacao: v || null })}
                />

                <button
                    onClick={handleSaveVehicle}
                    disabled={loading}
                    className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                    {loading ? "Salvando..." : "Registrar Veículo"}
                </button>
            </div>
        </div>
    );
};

export default RegisterVehicle;

/* ===== COMPONENTES AUXILIARES ===== */
const Input = ({
    label,
    value,
    onChange,
    type = "text",
    required = false,
}: {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    type?: string;
    required?: boolean;
}) => (
    <div className="flex flex-col">
        <label className="text-gray-700 font-medium mb-1">{label}</label>
        <input
            type={type}
            value={value}
            required={required}
            onChange={(e) => onChange(e.target.value)}
            className="border text-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
    </div>
);

const Textarea = ({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) => (
    <div className="flex flex-col">
        <label className="text-gray-700 font-medium mb-1">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border text-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
        />
    </div>
);
