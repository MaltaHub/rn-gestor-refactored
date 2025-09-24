import { readClient, scopeFromLoja, setGlobalLoja, writeClient } from "../core";
import type { LojaDisponivel, UsuarioPerfil, UsuarioPreferencias } from "@/types/domain";

export async function listarLojasDisponiveis(): Promise<LojaDisponivel[]> {
  return readClient.fetch("usuarios.lojasDisponiveis");
}

export async function obterPerfilUsuario(): Promise<UsuarioPerfil> {
  return readClient.fetch("usuarios.perfil");
}

export async function obterPreferenciasUsuario(): Promise<UsuarioPreferencias> {
  return readClient.fetch("usuarios.preferencias");
}

export async function atualizarPerfilUsuario(dados: Partial<UsuarioPerfil>) {
  return writeClient.execute("usuarios.atualizarPerfil", { dados });
}

export async function atualizarCamposUsuario(dados: Partial<UsuarioPerfil>) {
  return writeClient.execute("usuarios.atualizarCampos", { dados });
}

export async function atualizarPreferenciasUsuario(preferencias: Partial<UsuarioPreferencias>) {
  return writeClient.execute("usuarios.atualizarPreferencias", { preferencias });
}

export async function alterarSenhaUsuario(senhaAtual: string, novaSenha: string) {
  return writeClient.execute("usuarios.alterarSenha", { senhaAtual, novaSenha });
}

export async function ativarMfaUsuario(metodo: "sms" | "app") {
  return writeClient.execute("usuarios.ativarMFA", { metodo });
}

export async function definirLojaAtual(lojaId: string) {
  setGlobalLoja(lojaId);
  return writeClient.execute("usuarios.definirLojaAtual", { lojaId }, scopeFromLoja(lojaId));
}
