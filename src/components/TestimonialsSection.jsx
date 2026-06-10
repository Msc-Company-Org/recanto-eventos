const TESTIMONIALS = [
  { text: '"Contratei o buffet de 3 horas para o aniversário de 8 anos da minha filha. As crianças e os adultos piraram! O açaí estava super cremoso e os acompanhamentos eram fresquinhos. O atendente foi super atencioso. Recomendo muito!"', author: 'Mariana Costa', role: 'Aniversário Infantil' },
  { text: '"Colocamos o carrinho de açaí e sorvete na pista de dança do nosso casamento (pacote de 4 horas). Foi a melhor decisão que tomamos! Deu uma energia enorme nos convidados e a mesa ficou linda, super combinou com a decoração rústica do local."', author: 'Juliana & Thiago', role: 'Casamento no Campo' },
  { text: '"Excelente serviço para o nosso evento corporativo de fim de ano. Foram muito pontuais, a estrutura é bonita e organizada, e o atendimento foi rápido mesmo com mais de 100 colaboradores. Aprovado!"', author: 'Ricardo Santos', role: 'Diretor de RH - Tech Solutions' },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-brand-blue/10 border-y border-brand-purple/10">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-brand-purple font-heading font-black text-xs uppercase tracking-wider">
            QUEM JÁ ADOÇOU A FESTA
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-purple-dark mt-2 mb-4">
            O que os Cariocas dizem sobre o Recanto
          </h2>
          <p className="text-brand-muted text-sm font-semibold">
            Histórias reais de noivos, pais e diretores de empresas que contrataram nossa equipe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white border border-brand-purple/15 p-8 rounded-2xl shadow-sm flex flex-col justify-between">
              <p className="text-sm italic font-medium leading-relaxed text-brand-text mb-6">
                {t.text}
              </p>
              <div className="border-t border-brand-purple/10 pt-4 flex flex-col">
                <span className="font-heading font-bold text-sm text-brand-purple">{t.author}</span>
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
