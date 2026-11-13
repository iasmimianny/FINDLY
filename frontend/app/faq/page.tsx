"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PrivateLayout from "../components/funcionario/PrivateLayout";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  function toggleFAQ(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  const cardClass = "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";

  return (
    <PrivateLayout>
      <main className="min-h-screen w-full bg-white font-sans text-gray-900">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-10">
          {/* Cabeçalho */}
          <div className="mb-8 w-full text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-[#42a5df]">
              CENTRAL DE AJUDA
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Perguntas frequentes
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
              Encontre respostas para as principais dúvidas sobre o
              funcionamento da plataforma FINDLY.
            </p>
          </div>

          {/* Lista de perguntas */}
          <section className={`${cardClass} mx-auto max-w-4xl`}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Dúvidas frequentes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Clique em uma pergunta para visualizar a resposta.
              </p>
            </div>

            <div className="divide-y divide-gray-100">
              {faqList.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => toggleFAQ(index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 text-left transition"
                    >
                      <span className="text-sm font-semibold leading-relaxed text-gray-900 transition hover:text-[#42a5df] md:text-base">
                        {item.pergunta}
                      </span>

                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-[#42a5df]" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="mt-3 rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
                        {item.resposta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Rodapé */}
        <footer className="py-8 text-center text-xs text-gray-400">
          FINDLY — Sistema de Achados e Perdidos UNIFIP
        </footer>
      </main>
    </PrivateLayout>
  );
}
