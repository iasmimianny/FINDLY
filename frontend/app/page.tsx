"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Search,
  Bell,
  QrCode,
  Phone,
  MessageCircle,
  Mail,
} from "lucide-react";

const features = [
  {
    eyebrow: "Praticidade",
    title: "Uma interface simples de usar",
    description:
      "Encontre as informações principais sem complicação. O Findly foi pensado para facilitar o cadastro e a busca por objetos.",
    image: "/images/interface-inteligente.png",
    alt: "Representação da interface do Findly",
    icon: Search,
  },
  {
    eyebrow: "Localização",
    title: "Mais facilidade para encontrar",
    description:
      "As informações de localização ajudam a identificar onde um objeto foi perdido ou encontrado.",
    image: "/images/geolocalizacao.png",
    alt: "Representação do recurso de geolocalização",
    icon: MapPin,
  },
  {
    eyebrow: "Confiança",
    title: "Mais segurança na devolução",
    description:
      "O sistema aproxima quem perdeu um objeto de quem o encontrou, apoiando uma devolução mais organizada.",
    image: "/images/seguranca-devolucao.png",
    alt: "Representação de segurança na devolução de objetos",
    icon: ShieldCheck,
  },
  {
    eyebrow: "Acessibilidade",
    title: "Navegação descomplicada",
    description:
      "Informações organizadas e uma experiência direta para que qualquer pessoa consiga utilizar a plataforma.",
    image: "/images/acessibilidade.png",
    alt: "Representação de acessibilidade no Findly",
    icon: Bell,
  },
  {
    eyebrow: "Disponibilidade",
    title: "Acesse quando precisar",
    description:
      "Os registros ficam organizados na plataforma, permitindo consultar as informações sem depender de anotações soltas.",
    image: "/images/plataforma-online.png",
    alt: "Representação da plataforma online",
    icon: QrCode,
  },
  {
    eyebrow: "Colaboração",
    title: "Pessoas ajudando pessoas",
    description:
      "Cada registro contribui para uma comunidade mais colaborativa e aumenta as possibilidades de um objeto voltar ao dono.",
    image: "/images/rede-colaborativa.png",
    alt: "Representação de uma rede colaborativa",
    icon: MessageCircle,
  },
];

export default function FindlyLandingPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#171717] antialiased">
      {/* Cabeçalho e apresentação */}
      <header className="bg-black text-white">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Findly - início"
          >
            <Image
              src="/logo-findly.jpg"
              alt="Logo Findly"
              width={46}
              height={46}
              priority
              className="rounded-full object-cover"
            />
            <span className="text-xl font-extrabold tracking-[0.18em]">
              FINDLY
            </span>
          </Link>

          <div className="hidden items-center gap-9 text-sm font-medium text-white/75 md:flex">
            <a className="transition hover:text-white" href="#como-funciona">
              Como Funciona
            </a>
            <a className="transition hover:text-white" href="#recursos">
              Recursos
            </a>
            <a className="transition hover:text-white" href="#sobre">
              Sobre o Findly
            </a>
          </div>

          <Link
            href="/perfil"
            className="rounded-full border border-white/35 px-5 py-2.5 text-sm font-semibold transition hover:bg-white hover:text-black"
          >
            Minha Conta
          </Link>
        </nav>

        {/* Hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-12 md:grid-cols-[1.05fr_0.95fr] md:pb-28 md:pt-20 lg:px-10">
          <div className="max-w-2xl">
            <span className="mb-6 inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              Encontre. Conecte. Devolva.
            </span>

            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.7rem]">
              Perdeu algo?{" "}
              <span className="text-[#BACBD8]">O Findly</span> pode ajudar você
              a encontrar.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/65 sm:text-lg">
              Uma plataforma para cadastrar objetos perdidos e encontrados,
              facilitar a busca e aproximar pessoas para tornar a devolução mais
              simples.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/cadastro-itens-perdidos"
                className="inline-flex items-center gap-3 rounded-full bg-[#DCDCDC] px-7 py-4 text-sm font-bold text-black shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white"
              >
                Cadastrar um item
                <ArrowRight size={18} />
              </Link>

              <a
                href="#como-funciona"
                className="rounded-full px-5 py-4 text-sm font-semibold text-white/80 transition hover:text-white"
              >
                Conhecer a plataforma
              </a>
            </div>

            <p className="mt-8 text-xs leading-6 text-white/40">
              Menos tempo procurando. Mais chances de encontrar.
            </p>
          </div>

          <div className="relative mx-auto flex min-h-[300px] w-full max-w-xl items-center justify-center overflow-hidden rounded-[2rem] bg-[#DCEBF2] p-7 sm:min-h-[390px] sm:p-10">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/40 blur-2xl" />

            <Image
              src="/images/hero-illustration.png"
              alt="Ilustração de apresentação do Findly"
              width={600}
              height={480}
              priority
              className="relative z-10 h-auto max-h-[340px] w-full object-contain"
            />
          </div>
        </section>
      </header>

      {/* Sobre */}
      <section
        id="sobre"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#5B50A1]">
            Sobre o Findly
          </span>

          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Encontrar um objeto perdido não precisa ser complicado.
          </h2>

          <p className="mt-5 text-base leading-8 text-gray-600">
            O Findly reúne em um só lugar os registros de itens perdidos e
            encontrados. Assim, as informações ficam mais organizadas e a
            comunicação entre as pessoas se torna mais fácil.
          </p>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="bg-[#F5F8FA] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#5B50A1]">
              É simples assim
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Como funciona?
            </h2>

            <p className="mt-4 leading-7 text-gray-600">
              Três passos para deixar a busca por um objeto mais organizada.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Cadastre",
                description:
                  "Informe os dados do objeto, adicione uma descrição e, se possível, uma foto.",
              },
              {
                number: "02",
                title: "Consulte",
                description:
                  "Explore os registros e procure por informações que correspondam ao item.",
              },
              {
                number: "03",
                title: "Conecte-se",
                description:
                  "Com as informações organizadas, fica mais fácil aproximar quem perdeu de quem encontrou.",
              },
            ].map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-[#E5E9ED] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-sm font-bold tracking-widest text-[#5B50A1]">
                  {step.number}
                </span>

                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>

                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section
        id="recursos"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#5B50A1]">
            Recursos
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo para facilitar a sua busca
          </h2>

          <p className="mt-5 leading-7 text-gray-600">
            Conheça os recursos que tornam a experiência no Findly mais prática,
            organizada e colaborativa.
          </p>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const imageFirst = index % 2 === 1;

            return (
              <article
                key={feature.title}
                className={`group grid overflow-hidden rounded-3xl border border-[#E8EDF0] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  imageFirst
                    ? "md:grid-cols-[0.9fr_1.1fr]"
                    : "md:grid-cols-[1.1fr_0.9fr]"
                }`}
              >
                <div
                  className={`flex min-h-[220px] items-center justify-center p-7 ${
                    imageFirst ? "md:order-2" : ""
                  } ${
                    index === 0 || index === 1
                      ? "bg-[#E4F1F7]"
                      : index === 2
                        ? "bg-[#F2F8FC]"
                        : index === 3
                          ? "bg-gradient-to-br from-[#BACBD8] to-[#8FA8BD]"
                          : "bg-gradient-to-br from-[#B5C9D7] to-[#8FA4B5]"
                  }`}
                >
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    width={440}
                    height={320}
                    className="h-auto max-h-[220px] w-full object-contain transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                <div
                  className={`flex flex-col justify-center p-7 sm:p-8 ${
                    imageFirst ? "md:order-1" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 text-[#5B50A1]">
                    <Icon size={17} strokeWidth={2} />

                    <span className="text-xs font-bold uppercase tracking-[0.14em]">
                      {feature.eyebrow}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold leading-snug tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Chamada final */}
      <section className="px-6 pb-20 lg:px-10 lg:pb-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-black px-8 py-12 text-white sm:px-12 lg:flex-row lg:items-center lg:px-16 lg:py-14">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#BACBD8]">
              Faça parte dessa rede
            </span>

            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Vamos ajudar esse objeto a encontrar o caminho de volta?
            </h2>

            <p className="mt-4 leading-7 text-white/65">
              Registre um item e contribua para uma comunidade mais
              colaborativa.
            </p>
          </div>

          <Link
            href="/cadastro-itens-perdidos"
            className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#DCDCDC] px-7 py-4 text-sm font-bold text-black transition hover:bg-white"
          >
            Começar agora
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-9 border-b border-white/10 pb-9 md:flex-row">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="Findly - início"
            >
              <Image
                src="/logo-findly.jpg"
                alt="Logo Findly"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />

              <span className="text-lg font-extrabold tracking-[0.18em]">
                FINDLY
              </span>
            </Link>

            <div className="flex flex-col items-center gap-4 text-sm text-white/65 sm:flex-row sm:gap-8">
              <a
                href="tel:+5583999999999"
                className="flex items-center gap-2 transition hover:text-white"
              >
                <Phone size={16} />
                (83) 99999-9999
              </a>

              <a
                href="https://wa.me/5583999999999"
                className="flex items-center gap-2 transition hover:text-white"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>

              <a
                href="mailto:contato@findly.com"
                className="flex items-center gap-2 transition hover:text-white"
              >
                <Mail size={16} />
                contato@findly.com
              </a>
            </div>
          </div>

          <p className="pt-7 text-center text-xs text-white/40">
            © {new Date().getFullYear()} Findly. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}