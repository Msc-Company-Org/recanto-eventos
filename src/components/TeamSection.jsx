const TEAM_MEMBERS = [
  {
    img: '/equipe_completa.jpg',
    alt: 'Moisés - Dono do Recanto',
    name: 'Moisés',
    role: 'Fundador & Dono',
    roleClass: 'bg-brand-purple/10 text-brand-purple',
    bio: 'Responsável direto por toda a logística operacional, transporte e pela excelência do açaí e sorvete gourmet servidos no seu grande dia.',
  },
  {
    img: '/naiara_equipe.webp',
    alt: 'Naiara - Sócia e Comercial',
    name: 'Naiara',
    role: 'Sócia & Comercial',
    roleClass: 'bg-brand-pink/10 text-brand-pink',
    bio: 'Sua parceira desde o primeiro contato. Cuida do atendimento no WhatsApp, elabora os orçamentos e planeja cada detalhe para o buffet ser perfeito.',
  },
];

export default function TeamSection() {
  return (
    <section className="py-24 bg-white border-t border-brand-purple/10">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-brand-pink font-heading font-black text-xs uppercase tracking-wider">
            NOSSA EQUIPE
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-purple-dark mt-2 mb-4">
            Quem Faz a Magia Acontecer ✨
          </h2>
          <p className="text-brand-muted text-sm font-semibold leading-relaxed">
            Conheça as pessoas dedicadas a fazer do seu evento um momento doce, inesquecível e livre de preocupações.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {TEAM_MEMBERS.map((member, index) => (
            <div key={index} className="card-premium text-center">
              <img
                src={member.img}
                alt={member.alt}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-md mb-4"
              />
              <h3 className="font-heading font-bold text-lg text-brand-purple">{member.name}</h3>
              <span className={`inline-block ${member.roleClass} font-extrabold text-[9px] uppercase tracking-wider px-3 py-1 rounded-full mt-1 mb-3`}>{member.role}</span>
              <p className="text-xs text-brand-muted font-semibold leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
