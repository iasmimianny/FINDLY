"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Settings, ChevronDown } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Lista de perguntas e respostas adaptadas para o FINDLY / UNIFIP
  const faqList = [
    {
      pergunta: "Como funciona o cadastro e busca de pertences?",
      resposta:
        "Qualquer aluno ou colaborador da UNIFIP pode cadastrar um item perdido ou encontrado. Ao registrar a ocorrência com foto e descrição, o sistema cruza as informações para ajudar a identificar o proprietário.",
    },
    {
      pergunta: "Onde devo entregar um item que encontrei no campus?",
      resposta:
        "Itens encontrados devem ser entregues na Recepção Central ou no Setor de Achados e Perdidos do campus UNIFIP para que fiquem armazenados em local seguro até a retirada.",
    },
    {
      pergunta: "Como comprovo que o item encontrado é meu?",
      resposta:
        "No momento do resgate, você precisará apresentar um documento com foto (ou carteira estudantil) e detalhar características específicas do objeto que confirmem sua posse.",
    },
    {
      pergunta: "Existe algum custo para utilizar a plataforma FINDLY?",
      resposta:
        "Não, o FINDLY é uma ferramenta totalmente gratuita oferecida para a comunidade acadêmica da UNIFIP.",
    },
    {
      pergunta: "Como entro em contato com o suporte?",
      resposta:
        "Você pode entrar em contato com nossa equipe enviando um e-mail para suporte@unifip.edu.br ou se dirigindo diretamente ao setor de atendimento no campus.",
    },
    {
      pergunta: "Por quanto tempo os itens ficam guardados?",
      resposta:
        "Os itens permanecem guardados no setor responsável da UNIFIP por até 90 dias. Após esse prazo, itens não reclamados serão destinados a doações ou órgãos competentes.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      <div>
        {/* --- CABEÇALHO / HEADER --- */}
        <header className="flex h-[74px] items-center justify-between bg-black px-8 text-white">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
                src="/logo-findly.jpg"
                alt="Findly"
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            </Link>
            <span className="text-lg font-medium tracking-wide">FINDLY</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 font-bold italic hover:opacity-70 transition"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              Voltar
            </button>

            <Link
              href="/configuracao"
              className="hover:opacity-70 transition"
              title="Configurações"
            >
              <Settings className="w-6 h-6 text-white" />
            </Link>
          </div>
        </header>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <div className="mx-auto max-w-5xl px-6 py-10">
          
          {/* Títulos da Página */}
          <div className="mb-8">
            <h1 className="text-5xl font-black italic tracking-tight">
              FAQ:
            </h1>

            <p className="mt-3 text-2xl font-bold italic text-[#59558a]">
              Perguntas <span className="font-normal text-gray-400">frequentes:</span>
            </p>
          </div>

          {/* CARD PRINCIPAL COM A LISTA DE PERGUNTAS */}
          <div className="rounded-3xl bg-[#f8f8f8] p-6 md:p-10 shadow-sm border border-gray-100 max-w-3xl mx-auto">
            <div className="divide-y divide-gray-200">
              {faqList.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => toggleFAQ(index)}
                      className="flex w-full items-center justify-between text-left focus:outline-none group"
                    >
                      <span className="text-lg font-black italic text-black group-hover:text-gray-700 transition pr-4">
                        {item.pergunta}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-black shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Resposta expandível */}
                    {isOpen && (
                      <div className="mt-3 text-sm md:text-base text-gray-600 font-medium leading-relaxed animate-fadeIn pl-1">
                        {item.resposta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Espaçador de Rodapé */}
      <footer className="py-8 text-center text-sm text-gray-400 font-medium">
        FINDLY — Sistema de Achados e Perdidos UNIFIP
      </footer>
    </main>
  );
}