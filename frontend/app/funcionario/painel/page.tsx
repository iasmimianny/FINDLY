
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PackagePlus,
  Package,
  CheckCircle2,
  Clock3,
  Search,
  ArrowRight,
  MapPin,
  ClipboardList,
} from "lucide-react";

import CardEstatistica from "../../../components/funcionario/CardEstatistica";

type StatusItem = "Armazenado" | "Devolvido" | "Pendente";

interface Item {
  id: number;
  nome: string;
  categoria: string;
  data: string;
  local: string;
  status: StatusItem;
}

const itens: Item[] = [
  {
    id: 1,
    nome: "Celular Samsung",
    categoria: "Eletrônicos",
    data: "09/11/2026",
    local: "Armário A - Prateleira 3",
    status: "Armazenado",
  },
  {
    id: 2,
    nome: "Carteira Preta",
    categoria: "Acessórios",
    data: "08/11/2026",
    local: "Armário B - Prateleira 1",
    status: "Devolvido",
  },
  {
    id: 3,
    nome: "Chave com Chaveiro",
    categoria: "Chaves",
    data: "07/11/2026",
    local: "Armário A - Prateleira 2",
    status: "Pendente",
  },
  {
    id: 4,
    nome: "Fone Bluetooth",
    categoria: "Eletrônicos",
    data: "06/11/2026",
    local: "Armário C - Prateleira 1",
    status: "Armazenado",
  },
];

const statusClasses: Record<StatusItem, string> = {
  Armazenado: "bg-blue-50 text-blue-700",
  Devolvido: "bg-green-50 text-green-700",
  Pendente: "bg-amber-50 text-amber-700",
};

export default function PainelFuncionario() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => {
      const correspondeBusca =
        `${item.nome} ${item.categoria} ${item.local}`
          .toLowerCase()
          .includes(busca.toLowerCase());

      const correspondeStatus =
        filtro === "Todos" || item.status === filtro;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, filtro]);

  const armazenados = itens.filter(
    (item) => item.status === "Armazenado"
  ).length;

  const devolvidos = itens.filter(
    (item) => item.status === "Devolvido"
  ).length;

  const pendentes = itens.filter(
    (item) => item.status === "Pendente"
  ).length;

  return (
    <div className="space-y-8">
      {/* Título e ação principal */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black italic text-black">
            Visão Geral
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Gerencie os objetos do seu ponto de coleta.
          </p>
        </div>

        <Link
          href="/funcionario/recebimento"
          className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
        >
          <PackagePlus size={19} />
          Receber Item
        </Link>
      </div>

      {/* Identificação do ponto */}
      <section className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="rounded-2xl bg-blue-50 p-3">
          <MapPin size={25} className="text-blue-500" />
        </div>

        <div>
          <h2 className="text-lg font-black italic">
            Ponto de Coleta - Bloco H
          </h2>
          <p className="text-sm text-gray-500">
            Centro Universitário UNIFIP · Patos, PB
          </p>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <CardEstatistica
          titulo="Itens Recebidos"
          valor={itens.length}
          icone={PackagePlus}
          cor="text-cyan-500"
        />

        <CardEstatistica
          titulo="Armazenados"
          valor={armazenados}
          icone={Package}
          cor="text-purple-500"
        />

        <CardEstatistica
          titulo="Devolvidos"
          valor={devolvidos}
          icone={CheckCircle2}
          cor="text-green-500"
        />

        <CardEstatistica
          titulo="Pendentes"
          valor={pendentes}
          icone={Clock3}
          cor="text-amber-500"
        />
      </section>

      {/* Tabela de itens */}
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList
                size={23}
                className="text-blue-500"
              />
              <h2 className="text-xl font-black italic">
                Itens Recentes
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Objetos registrados no ponto de coleta.
            </p>
          </div>

          <Link
            href="/funcionario/inventario"
            className="flex items-center gap-2 text-xs font-bold text-gray-600 transition hover:text-black"
          >
            Ver inventário
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Pesquisa e filtro */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar objeto..."
              aria-label="Pesquisar objeto"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-black outline-none transition focus:border-blue-400"
            />
          </div>

          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            aria-label="Filtrar por status"
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-black outline-none focus:border-blue-400"
          >
            <option value="Todos">Todos os status</option>
            <option value="Armazenado">Armazenados</option>
            <option value="Devolvido">Devolvidos</option>
            <option value="Pendente">Pendentes</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-3 py-4 font-bold">
                  Objeto
                </th>
                <th className="px-3 py-4 font-bold">
                  Data
                </th>
                <th className="px-3 py-4 font-bold">
                  Localização
                </th>
                <th className="px-3 py-4 font-bold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {itensFiltrados.map((item) => (
                <tr
                  key={item.id}
                  className="transition hover:bg-gray-50"
                >
                  <td className="px-3 py-4">
                    <p className="text-sm font-bold text-black">
                      {item.nome}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.categoria}
                    </p>
                  </td>

                  <td className="px-3 py-4 text-sm text-gray-600">
                    {item.data}
                  </td>

                  <td className="px-3 py-4 text-sm text-gray-600">
                    {item.local}
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClasses[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {itensFiltrados.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-500">
              Nenhum objeto encontrado.
            </p>
          )}
        </div>
      </section>

      <p className="text-center text-xs text-gray-400">
        Dados demonstrativos · Integração com a API pendente
      </p>
    </div>
  );
}
