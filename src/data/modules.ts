import { BellRing, LayoutGrid, Megaphone, Package, Settings, Sparkles, TrendingUp, User } from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type ModuleSlug =
  | "estoque"
  | "anuncios"
  | "vendas"
  | "promocoes"
  | "vitrine"
  | "perfil"
  | "configuracoes"
  | "avisos";

export interface ModuleDescriptor {
  slug: ModuleSlug;
  name: string;
  summary: string;
  href: `/app/${string}`;
  icon: LucideIcon;
  highlight?: string;
}

export const coreModules: ModuleDescriptor[] = [
  {
    slug: "estoque",
    name: "Gestão de estoque",
    summary: "Cadastre veículos, acompanhe status e mantenha visibilidade sobre a disponibilidade.",
    href: "/app/estoque",
    icon: Package,
    highlight: "Coloque sua operação em ordem com fluxos claros."
  },
  {
    slug: "anuncios",
    name: "Gestão de anúncios",
    summary: "Centralize a publicação em marketplaces, monitore erros e acompanhe desempenho.",
    href: "/app/anuncios",
    icon: Megaphone,
    highlight: "Sincronize portais sem perder governança."
  },
  {
    slug: "vendas",
    name: "Gestão de vendas",
    summary: "Controle pipeline, acompanhe negociações e acelere fechamento de contratos.",
    href: "/app/vendas",
    icon: TrendingUp,
    highlight: "Transforme oportunidades em receita previsível."
  },
  {
    slug: "promocoes",
    name: "Campanhas e promoções",
    summary: "Planeje incentivos comerciais e alinhe marketing e vendas.",
    href: "/app/promocoes",
    icon: Sparkles,
    highlight: "Ajuste estímulos com base em dados reais."
  },
  {
    slug: "vitrine",
    name: "Vitrine",
    summary: "Controle quais veículos aparecem em cada loja e mantenha a vitrine atualizada.",
    href: "/app/vitrine",
    icon: LayoutGrid,
    highlight: "Personalize vitrines respeitando o estoque único."
  },
  {
    slug: "perfil",
    name: "Perfil pessoal",
    summary: "Gerencie informações pessoais, preferências e segurança em um só lugar.",
    href: "/app/perfil",
    icon: User,
    highlight: "Simplifique ajustes individuais sem atravessar toda a operação."
  },
  {
    slug: "configuracoes",
    name: "Cadastros operacionais",
    summary: "Gerencie lojas, características, plataformas, locais e modelos em um só lugar.",
    href: "/app/configuracoes",
    icon: Settings,
    highlight: "Centralize dados mestres para acelerar integrações."
  },
  {
    slug: "avisos",
    name: "Avisos",
    summary: "Monitore pendências operacionais e aponte correções prioritárias.",
    href: "/app/avisos",
    icon: BellRing,
    highlight: "Resolva gargalos antes que impactem vendas."
  }
];

export const operationalHighlights = [
  {
    title: "Visão holística",
    description: "Acompanhe estoque, anúncios e vendas em um cockpit único, com métricas alinhadas ao negócio."
  },
  {
    title: "Ações orientadas",
    description: "Cada botão traz comentários action para conectar sistemas e automatizar fluxos críticos."
  },
  {
    title: "Governança desde o início",
    description: "Layouts e módulos foram desenhados para suportar aprovação dupla, auditoria e rastreabilidade."
  }
];

export const quantitativeProofPoints = [
  {
    label: "Tempo para insights",
    value: "< 5 min",
    description: "Paineis prontos para conectar às suas fontes de dados."
  },
  {
    label: "Módulos operacionais",
    value: "6",
    description: "Cobertura dos principais fluxos do negócio automotivo."
  },
  {
    label: "Ações mapeadas",
    value: "25+",
    description: "Comentários `action` orientam integrações futuras."
  }
];
