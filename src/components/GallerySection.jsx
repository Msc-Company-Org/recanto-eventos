const GALLERY_ITEMS = [
  { type: 'video', src: '/luana_servindo.mp4', title: 'Operação em Ação', desc: 'Veja nossa equipe servindo copos fartos e cremosos.' },
  { type: 'video', src: '/sorvete_qualidade.mp4', title: 'Sorvetes Especiais', desc: 'Textura aveludada e cremosidade garantida na festa.' },
  { type: 'image', src: '/acai_de_perto.jpg', alt: 'Açaí cremoso de perto', title: 'Açaí Premium', desc: 'Textura firme que não derrete rápido na pista de dança.' },
  { type: 'image', src: '/sorvete_de_perto.jpg', alt: 'Sorvetes variados', title: 'Combinações Infinitas', desc: 'Mais sabor e frescor com frutas e caldas à sua escolha.' },
  { type: 'video', src: '/festa_kids.mp4', title: 'Festa Infantil', desc: 'Sucesso absoluto com a criançada no Festeja Kids.' },
  { type: 'image', src: '/fila_atendimento.jpg', alt: 'Fila de atendimento rápida', title: 'Operação Sem Fila', desc: 'Serviço dinâmico para garantir fluidez e diversão.' },
];

export default function GallerySection() {
  return (
    <section className="py-24 border-t border-brand-purple/10">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-brand-pink font-heading font-black text-xs uppercase tracking-wider">
            GALERIA REAL
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-purple-dark mt-2 mb-4">
            Açaí e Sorvete de Verdade no Seu Evento
          </h2>
          <p className="text-brand-muted text-sm font-semibold leading-relaxed">
            Confira fotos e vídeos reais do nosso buffet em ação no Rio de Janeiro. Transparência e sabor de verdade!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GALLERY_ITEMS.map((item, index) => (
            <div key={index} className="bg-white border border-brand-purple/15 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
              <div className={`relative aspect-video sm:aspect-square md:aspect-video rounded-2xl overflow-hidden ${item.type === 'video' ? 'bg-black' : 'bg-cream-bg'}`}>
                {item.type === 'video' ? (
                  <video
                    src={item.src}
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                )}
              </div>
              <div className="mt-3 px-2">
                <h4 className="font-heading font-bold text-sm text-brand-purple">{item.title}</h4>
                <p className="text-[10px] text-brand-muted font-semibold mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}

          {/* Photo destacada: Mesa Decorada Real */}
          <div className="bg-white border border-brand-purple/15 rounded-3xl p-3 shadow-sm hover:shadow-md transition-all duration-300 col-span-1 sm:col-span-2 lg:col-span-2">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-cream-bg">
              <img
                src="/imagem_principal.jpg"
                alt="Mesa decorada do Recanto"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="mt-3 px-2">
              <h4 className="font-heading font-bold text-sm text-brand-purple">Estrutura Gourmet Completa</h4>
              <p className="text-[10px] text-brand-muted font-semibold mt-0.5">Visual rústico e sofisticado que se integra perfeitamente à decoração da sua festa.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
