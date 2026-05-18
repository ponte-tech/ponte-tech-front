export type Trilha = {
  title: string;
  level: string;
  iconKind: "react" | "devops" | "python" | "arch";
};

export const trilhas: Trilha[] = [
  { title: "React Avançado", level: "Avançado", iconKind: "react" },
  { title: "DevOps com AWS", level: "Intermediário", iconKind: "devops" },
  { title: "Python para IA", level: "Avançado", iconKind: "python" },
  { title: "Arquitetura de Software", level: "Intermediário", iconKind: "arch" },
];

export type TestimonialItem = {
  initials: string;
  grad: "g1" | "g2" | "g3" | "g4" | "g5" | "g6";
  image: string;
  name: string;
  role: string;
  quote: string;
};

export const testimonialsRow1: TestimonialItem[] = [
  {
    initials: "RM",
    grad: "g1",
    image: "/assets/rodigo-menezes.png",
    name: "Rodrigo Menezes",
    role: "@rodrigo.menezes · CTO, Nexora Soluções",
    quote:
      "A Ponte Tech entregou nosso CRM imobiliário do zero em menos de 90 dias. Escopo fechado, transparência total nas sprints e zero surpresas no orçamento.",
  },
  {
    initials: "FA",
    grad: "g2",
    image: "/assets/felipe-assuncao.png",
    name: "Felipe Assunção",
    role: "@fassuncao · CEO, Orbitech",
    quote:
      "Contratamos o MAGUS para qualificar nossos leads e a taxa de conversão subiu 40% no primeiro trimestre. O produto é sólido, o suporte é ágil e a equipe técnica sabe exatamente do que está falando.",
  },
  {
    initials: "CD",
    grad: "g3",
    image: "/assets/camila-duarte.png",
    name: "Camila Duarte",
    role: "@camiladuarte · Head of Product, Stratix",
    quote:
      "Alocamos dois seniores da Ponte Tech para o nosso squad de plataforma. A diferença foi imediata — nível técnico alto, comunicação direta e integração rápida com o time. Não entregam horas; entregam resultado.",
  },
];

export const testimonialsRow2: TestimonialItem[] = [
  {
    initials: "LF",
    grad: "g4",
    image: "/assets/lucas-fontes.png",
    name: "Lucas Fontes",
    role: "@lucasfontes · Gerente de Projetos, Lumena Digital",
    quote:
      "O que mais me impressionou foi a transparência. Cada sprint tinha entregáveis claros, acesso ao board e comunicação proativa quando algo mudava. Parecia uma extensão do nosso próprio time,",
  },
  {
    initials: "BC",
    grad: "g5",
    image: "/assets/bruno-cavalcante.png",
    name: "Bruno Cavalcanti",
    role: "@bcavalcanti · Gerente de Engenharia, Prisma Tech",
    quote:
      "A Ponte Tech assumiu um projeto que estava emperrado há seis meses. Em oito semanas reorganizaram a arquitetura, estabilizaram o ambiente e entregaram tudo que estava em atraso.",
  },
  {
    initials: "TK",
    grad: "g6",
    image: "/assets/thiago-kato.png",
    name: "Thiago Kato",
    role: "@thiagokato · Diretor de TI, Vaultex Group",
    quote:
      "Já passamos por três fornecedores de outsourcing antes da Ponte Tech. A diferença está no Ponte Academy — os profissionais chegam validados, sem precisar ensinar boas práticas do zero. Isso é diferencial real.",
  },
];

export const empresas = ["NEXORA", "STRATIX", "ORBITECH", "VAULTEX", "PRISMA", "AXIOM"];
