// All editable copy lives here. Only facts supplied by Mowatek are stated as facts:
// incorporated in Nigeria in 1983 as a limited liability company; mandate spanning mechanical, electrical,
// civil and marine works; strong focus on water and wastewater treatment; five service areas.
// Capability lists describe service scope in neutral terms and must be confirmed by Mowatek (see LAUNCH-CHECKLIST.md).

// Photo focal points (object-position) and visual-only alt text. Confirm project context before adding captions.
export const photos = {
  '01': { alt: 'Worker in a hard hat and blue overalls beside a blue container on site', pos: '35% 40%' },
  '02': { alt: 'Site personnel in safety gear gathered for a briefing beside a tank', pos: '50% 45%' },
  '04': { alt: 'Technician in a hard hat and gloves working on a blue valve and pipework', pos: '40% 55%' },
  '09': { alt: 'Two technicians working in a fenced wet area on site', pos: '55% 50%' },
  '13': { alt: 'Site yard with storage tanks, a container and a technician working at ground level', pos: '50% 60%' },
  '16': { alt: 'Technicians in orange overalls working on a pump unit at an equipment enclosure', pos: '60% 35%' },
  '18': { alt: 'Personnel in safety gear gathered around a green tank at a treatment site', pos: '40% 55%' },
  '20': { alt: 'Technician in a hard hat inspecting equipment beside a blue container', pos: '55% 40%' },
  '29': { alt: 'Blue filtration vessels and pipework in a treatment room', pos: '35% 50%' },
  '41': { alt: 'Blue pressure vessels beside a reverse-osmosis skid with a control panel', pos: '55% 50%' },
  '43': { alt: 'Compact treatment skid with blue vessels and membrane housings installed on site', pos: '55% 45%' },
  '45': { alt: 'Personnel in protective coveralls lined up on site', pos: '50% 55%' },
  '46': { alt: 'Orange safety barriers around a work area at an industrial site', pos: '45% 55%' },
  '49': { alt: 'Orange safety barriers and a caution sign at a site work area', pos: '45% 60%' },
  '56': { alt: 'Three team members in blue coveralls reviewing documents on site', pos: '40% 40%' },
  '58': { alt: 'Open concrete tank seen from above', pos: '50% 45%' },
  '67': { alt: 'Team in coveralls and hard hats beside a tanker vehicle', pos: '55% 50%' },
  '71': { alt: 'Technician in a white protective suit handling a hose at a treatment area', pos: '35% 40%' },
  '82': { alt: 'Technicians working at the edge of an open concrete chamber', pos: '50% 55%' },
  '84': { alt: 'Two colleagues in blue coveralls reviewing paperwork beside orange barriers', pos: '55% 35%' },
  '91': { alt: 'Site meeting between personnel in hard hats and high-visibility vests', pos: '50% 50%' },
  '92': { alt: 'Colleagues in hard hats and safety vests at a building site', pos: '50% 40%' },
};

const serviceDefinitions = [
  {
    slug: 'water-treatment', nav: 'Water Treatment', title: 'Water Treatment', num: '01', tag: 'Water',
    icon: 'drop', hero: '41', cardPhoto: '41', gallery: ['29', '43', '41'],
    card: 'Water treatment systems and equipment selected to meet project needs and required water quality.',
    meta: 'Water treatment systems and equipment in Nigeria: filtration, reverse osmosis, disinfection, chemical dosing and softening, from Mowatek Nigeria Limited.',
    lead: 'Treatment systems selected around your source water, your application and the quality you need to achieve.',
    intro: [
      'Every water source and every site is different. Mowatek helps clients identify suitable treatment approaches, then supports supply, installation and technical follow-through so the system performs as intended.',
      'Our work in this area sits within a long-standing focus on water and wastewater treatment, built on technical collaboration and practical, fit-for-purpose solutions.',
    ],
    coverTitle: 'Areas we cover',
    covers: [
      ['filter', 'Filtration', 'Media, cartridge and membrane filtration to remove suspended solids and particulates.'],
      ['layers', 'Reverse osmosis', 'Membrane-based treatment where dissolved solids need to be reduced.'],
      ['sun', 'Disinfection', 'Disinfection options matched to the application and the required water quality.'],
      ['flask', 'Chemical dosing', 'Dosing and conditioning for coagulation, pH adjustment and process requirements.'],
      ['drop', 'Softening', 'Treatment to reduce hardness and protect pipework and equipment.'],
      ['search', 'Assessment', 'Support to understand the source water and select an appropriate treatment route.'],
    ],
    appsTitle: 'Typical applications',
    apps: ['Industrial and process water', 'Commercial and institutional buildings', 'Boreholes and other private water sources', 'Equipment protection and feed-water preparation'],
  },
  {
    slug: 'wastewater-effluent-treatment', nav: 'Wastewater/Effluent Treatment', title: 'Wastewater/Effluent Treatment', num: '02', tag: 'Wastewater',
    icon: 'wave', hero: '82', cardPhoto: '16', gallery: ['58', '18', '13'],
    card: 'Engineering support for wastewater and effluent treatment, process systems and site installations.',
    meta: 'Wastewater/effluent treatment engineering in Nigeria: process systems, tanks, pipework and site installations from Mowatek Nigeria Limited.',
    lead: 'Engineering support for wastewater and effluent treatment, from process selection through site installation.',
    intro: [
      'Treating wastewater and effluent responsibly takes sound process design and careful site delivery. Mowatek provides engineering support across treatment systems, tanks, pipework and the installations that connect them.',
      'We work around the realities of each site and bring in technical partners where appropriate to find a dependable way forward.',
    ],
    coverTitle: 'Areas we cover',
    covers: [
      ['filter', 'Preliminary & primary treatment', 'Screening and settling stages that remove larger solids before further treatment.'],
      ['flask', 'Biological treatment', 'Process systems that treat organic load as part of a complete treatment train.'],
      ['layers', 'Tertiary & polishing', 'Additional stages for effluent that must meet a defined quality target.'],
      ['truck', 'Sludge handling', 'Support for the handling and management of sludge produced by treatment.'],
      ['factory', 'Industrial effluent', 'Systems for effluent from industrial and commercial facilities.'],
      ['wrench', 'Site installations', 'Tanks, pumps, pipework and associated installation works.'],
    ],
    appsTitle: 'Typical applications',
    apps: ['Industrial and commercial facilities', 'Residential and mixed-use developments', 'Existing treatment plants needing upgrade or repair', 'Tanks, chambers and pump installations'],
  },
  {
    slug: 'consulting', nav: 'Consulting', title: 'Consulting', num: '04', tag: 'Advisory',
    icon: 'chart', hero: '84', cardPhoto: '04', gallery: ['56', '84', '04'],
    card: 'Technical guidance and problem-solving support informed by operational realities.',
    meta: 'Engineering consulting for water and wastewater projects in Nigeria: feasibility, design review and process optimisation from Mowatek Nigeria Limited.',
    lead: 'Technical guidance and problem-solving support informed by operational realities.',
    intro: [
      'Sound decisions early save cost and time later. Mowatek provides independent-minded technical guidance on water and wastewater projects, grounded in how systems actually operate on site.',
      'Whether you are weighing options, reviewing a design or trying to improve an existing system, we focus on a clear, fit-for-purpose way forward.',
    ],
    coverTitle: 'Areas we cover',
    covers: [
      ['search', 'Feasibility studies', 'Assessing technical and practical viability before a project commits.'],
      ['layers', 'Master planning', 'Longer-term planning for water and wastewater infrastructure.'],
      ['clipboard', 'Design review', 'Technical review of proposed designs and specifications.'],
      ['gear', 'Process optimisation', 'Looking at existing systems for ways to improve performance.'],
      ['shield', 'Regulatory support', 'Help understanding and organising work around regulatory requirements.'],
      ['file', 'Technical due diligence', 'Reviewing the technical condition and suitability of systems and proposals.'],
    ],
    appsTitle: 'Typical applications',
    apps: ['Choosing between treatment options', 'Reviewing contractor or vendor proposals', 'Troubleshooting underperforming systems', 'Planning upgrades and expansions'],
  },
  {
    slug: 'training', nav: 'Training', title: 'Training', num: '05', tag: 'Capability',
    icon: 'cap', hero: '56', cardPhoto: '56', gallery: ['02', '92', '91'],
    card: 'Build practical understanding and support the people responsible for systems and equipment.',
    meta: 'Technical training for water and wastewater treatment teams in Nigeria from Mowatek Nigeria Limited. Enquire about on-site or workshop training.',
    lead: 'Build practical understanding and support the people responsible for systems and equipment.',
    intro: [
      'Systems perform best when the people operating them understand how they work. Mowatek provides technical training and support for teams responsible for water and wastewater treatment equipment.',
      'Training content and format are agreed through an enquiry so that they fit your equipment, your site and your team.',
    ],
    coverTitle: 'Topics',
    covers: [
      ['drop', 'Water treatment operations', 'Operating, monitoring and troubleshooting water treatment equipment.'],
      ['wave', 'Wastewater management', 'Understanding wastewater processes and day-to-day operation.'],
      ['wrench', 'Equipment maintenance', 'Routine checks and maintenance practice for treatment equipment.'],
      ['flask', 'Laboratory & analysis', 'Sampling and testing fundamentals that support operations.'],
      ['shield', 'Safety & compliance', 'Safe working practice around treatment equipment and sites.'],
      ['users', 'Supervision & management', 'Supporting the people who lead operating teams.'],
    ],
    appsTitle: 'Formats',
    apps: ['On-site training at your facility', 'Workshops for groups', 'Support alongside equipment handover', 'Custom content: discuss your requirements'],
  },
  {
    slug: 'procurement-maintenance', nav: 'Procurement & Maintenance', title: 'Procurement & Maintenance', num: '06', tag: 'Delivery',
    icon: 'wrench', hero: '43', cardPhoto: '43', gallery: ['01', '13', '20'],
    card: 'Equipment supply and technical services to help systems perform as intended.',
    meta: 'Water and wastewater equipment supply, installation and maintenance in Nigeria: pumps, filtration, disinfection, controls, tanks and valves from Mowatek Nigeria Limited.',
    lead: 'Equipment supply and technical services to help systems perform as intended.',
    intro: [
      'A well-chosen system still needs to be installed, commissioned and looked after. Mowatek supplies equipment and provides the technical services that keep it performing.',
      'Scope is agreed project by project, from a single item of equipment to a complete installation.',
    ],
    coverTitle: 'Services',
    covers: [
      ['truck', 'Equipment supply', 'Sourcing equipment suited to the project and the site.'],
      ['wrench', 'Installation', 'Mechanical and pipework installation carried out to the project specification.'],
      ['check', 'Commissioning', 'Starting up and checking systems so they operate as designed.'],
      ['gear', 'Preventive maintenance', 'Planned servicing to help avoid unplanned failures.'],
      ['shield', 'Repairs', 'Diagnosing and repairing faults on existing equipment.'],
      ['layers', 'Upgrades', 'Improving or extending existing systems.'],
    ],
    appsTitle: 'Equipment areas',
    apps: ['Pumps and motors', 'Filtration equipment', 'Disinfection systems', 'Control and monitoring', 'Tanks and vessels', 'Valves and piping'],
  },
];

export const services = ['water-treatment', 'wastewater-effluent-treatment', 'procurement-maintenance', 'consulting', 'training'].map((slug, i) => ({ ...serviceDefinitions.find(s => s.slug === slug), num: String(i + 1).padStart(2, '0') }));

export const process = [
  ['Understand', 'We start with your site, your constraints and what you need the system to achieve.'],
  ['Define', 'We help shape a fit-for-purpose approach, with technical partners where appropriate.'],
  ['Deliver', 'Equipment, installation and technical support carried out with attention to site safety.'],
  ['Support', 'Clear communication through delivery, and technical backup as systems go into use.'],
];

export const faqs = [
  ['What does Mowatek do?', 'Mowatek Nigeria Limited provides engineering and technical services across five areas: water treatment, wastewater/effluent treatment, procurement and maintenance, consulting, and training.'],
  ['How long has Mowatek been operating?', 'Mowatek was incorporated in Nigeria in 1983 as a limited liability company, with a mandate spanning mechanical, electrical, civil and marine works. Over the years it has focused strongly on water and wastewater treatment.'],
  ['How do I request a quote?', 'Use the enquiry form and choose the service you are interested in. Tell us about your site and what you need, and the team will follow up to discuss your requirements.'],
  ['What should I include in an enquiry?', 'The more context the better: your location, the type of water or effluent involved, approximate volumes, any existing equipment, your timeline and any quality or regulatory targets you need to meet.'],
  ['Do you supply equipment only, or also install and maintain it?', 'Procurement and maintenance is one of our five service areas, including installation and commissioning support. The scope is agreed per project, so you can ask for a single element or a complete installation.'],
  ['Can you advise before we commit to a solution?', 'Yes. Our consulting service covers areas such as feasibility studies, design review and process optimisation, so that you can make decisions with clearer technical information.'],
  ['Do you work with other companies?', 'We work with technical partners where appropriate, to help clients find a fit-for-purpose way forward.'],
  ['Can you train our operating team?', 'Training and technical support is one of our services. Content and format are discussed through an enquiry so that they suit your equipment and site.'],
];

export const gallery = [
  ['41', 'water', 'Treatment vessels and reverse-osmosis skid'],
  ['43', 'water', 'Compact treatment skid installed on site'],
  ['29', 'water', 'Filtration vessels and pipework'],
  ['58', 'wastewater', 'Open concrete tank'],
  ['82', 'wastewater', 'Work at an open chamber'],
  ['18', 'wastewater', 'Team gathered at a treatment tank'],
  ['16', 'field', 'Technicians working on a pump unit'],
  ['13', 'field', 'Site yard with tanks and container'],
  ['04', 'field', 'Technician working on valve and pipework'],
  ['01', 'field', 'Worker beside a site container'],
  ['20', 'field', 'Equipment inspection on site'],
  ['09', 'field', 'Technicians in a fenced wet area'],
  ['45', 'environment', 'Personnel in protective coveralls'],
  ['71', 'environment', 'Technician in protective suit handling a hose'],
  ['67', 'environment', 'Team beside a tanker vehicle'],
  ['46', 'environment', 'Safety barriers around a work area'],
  ['49', 'environment', 'Barriers and caution signage'],
  ['56', 'teams', 'Team reviewing documents on site'],
  ['84', 'teams', 'Colleagues reviewing paperwork'],
  ['02', 'teams', 'Safety briefing on site'],
  ['91', 'teams', 'Site meeting'],
  ['92', 'teams', 'Colleagues on a building site'],
];
export const galleryFilters = [['all', 'All'], ['water', 'Water'], ['wastewater', 'Wastewater'], ['environment', 'Environment'], ['field', 'Field work'], ['teams', 'Teams & meetings']];

export const company = {
  values: [
    ['Dependable solutions', 'Engineering built around what works reliably on real sites.'],
    ['Technical collaboration', 'Working with clients and technical partners to find the right fit.'],
    ['Long-term relationships', 'Communication, innovation and service that clients can build on.'],
  ],
};
