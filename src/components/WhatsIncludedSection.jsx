const INCLUDED_ITEMS = [
  { icon: '🎪', title: 'Estação Gourmet', desc: 'Levamos mesa decorada no estilo rústico-chique, taças térmicas profissionais e descartáveis de alta qualidade.' },
  { icon: '🍓', title: 'Ingredientes Selecionados', desc: 'Frutas frescas fatiadas no mesmo dia (morango e banana), caldas especiais e mais de 15 toppings premium.' },
  { icon: '🧑‍🍳', title: 'Serviço com Sorriso', desc: 'Operadores uniformizados e treinados para montar os copos com rapidez, simpatia e total higiene.' },
  { icon: '🧹', title: 'Limpeza Impecável', desc: 'Chegamos 1 hora antes para a montagem e, após a festa, deixamos todo o espaço limpo e organizado.' },
];

export default function WhatsIncludedSection() {
  return (
    <section id="whats-included" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-brand-pink font-heading font-black text-xs uppercase tracking-wider">
            EXPERIÊNCIA RECANTO
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-purple-dark mt-2 mb-4">
            Tudo o que Cuidamos para o Seu Evento Brilhar
          </h2>
          <p className="text-brand-muted text-sm font-semibold leading-relaxed">
            Nossa equipe se encarrega de toda a logística e serviço para você focar em curtir cada segundo da festa.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {INCLUDED_ITEMS.map((item, index) => (
            <div key={index} className="card-premium text-left flex flex-col justify-between">
              <div>
                <div className="text-4xl mb-6">{item.icon}</div>
                <h3 className="font-heading font-black text-lg text-brand-purple mb-3">
                  {item.title}
                </h3>
                <p className="text-xs text-brand-muted font-semibold leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
