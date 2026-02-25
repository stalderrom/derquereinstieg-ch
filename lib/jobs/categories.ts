// Gemeinsame Kategorisierungs-Logik für Analytics + Debug-Endpoint.
// Reihenfolge ist relevant: erste Übereinstimmung gewinnt.
// Spezifische Kategorien stehen weiter oben, Catch-alls weiter unten.

export const CATEGORIES: { label: string; keywords: string[] }[] = [
  { label: 'Pflege & Gesundheit', keywords: [
    'pflege', 'pflegefach', 'pflegehelfer', 'pflegeassist',
    'fachfrau gesundheit', 'fachmann gesundheit', 'fage', 'okp',
    'spital', 'klinik', 'arzt', 'ärztin', 'therapeut', 'physiother', 'ergother', 'psycholog',
    'sanität', 'sanitäter', 'rettungssanit', 'apotheke', 'zahnarzt', 'hebamme',
    'medizin', 'psychiatrie', 'pflegedienst', 'onkolog', 'kardiolog', 'radiolog',
    'dental', 'prophylaxe', 'patientenbetreuer', 'patientenbetreu',
    'nursing', 'caregiver', 'care worker',
  ]},
  { label: 'IT & Technik', keywords: [
    'software', 'developer', 'informatik', ' it-', 'ict ',
    'programmier', 'netzwerk', 'cyber', 'applikation',
    'devops', 'fullstack', 'full stack', 'frontend', 'front end', 'backend', 'back end', 'cloud',
    'helpdesk', 'systemadmin', 'system administrator', 'datenbankadmin',
    'java ', 'python', '.net', 'sap ', 'wordpress', 'webmaster',
    'data engineer', 'data scientist', 'data analyst',
    'ict-', 'it support', 'it-support', 'it specialist', 'it consultant',
    'network engineer', 'network administrator',
    'systems engineer', 'system engineer',
    'machine learning', 'artificial intelligence', 'ki-',
  ]},
  { label: 'Ingenieurwesen & Produktion', keywords: [
    'ingenieur', 'konstrukt', 'maschinenbau', 'fertigungs',
    'produktionsleiter', 'produktionsmitar', 'produktionsoperator', 'produktionsarbeit',
    'anlagenführer', 'anlagenbediener', 'anlagentechnik', 'schichtleiter', 'schichtführer',
    'polymechan', 'mechatronik', 'elektrotechnik', 'elektroniker', 'elektronik',
    'automation', 'automatisier', 'steuerungstechnik',
    'qualitätsmanag', 'qualitätsingenieur', 'quality manager', 'quality engineer',
    'cnc', 'prozessingenieur', 'verfahrenstechnik',
    'process engineer', 'production manager', 'plant manager', 'manufacturing',
  ]},
  { label: 'Kundenservice', keywords: [
    'kundendienst', 'kundenservice', 'kundenbetreuer', 'kundenbetreu',
    'kundensupport', 'kundenmanager', 'kundenkommunikat',
    'call center', 'callcenter', 'contact center',
    'customer service', 'customer support', 'customer care', 'customer success', 'customer experience',
    'kundenkorrespond', 'telefonist', 'inbound', 'outbound agent',
    'serviceberater', 'service agent', 'support agent', 'supportmitar',
  ]},
  { label: 'Marketing & Kommunikation', keywords: [
    'marketing', 'kommunikation', 'werbung', 'social media', 'online marketing',
    'content manager', 'content creator', 'redakteur', 'redaktion', 'texter',
    ' pr ', 'pr-', 'öffentlichkeitsarbeit', 'brand manager', 'campaign',
    'seo', ' sem ', 'community manager', 'eventmanag', 'digitalmarketing',
    'mediaplanung', 'werbetexter', 'copywriter', 'influencer',
  ]},
  { label: 'HR & Personal', keywords: [
    'hr manager', 'hr specialist', 'hr generalist', 'hr business', 'hr-',
    'human resources', 'human ressources',
    'recruiting', 'talentmanag', 'talent acquisition',
    'personalfach', 'personalleiter', 'personalberater', 'personaladmin',
    'lohnbuchhalt', 'payroll', 'people manager', 'people & culture', 'people and culture',
  ]},
  { label: 'Design & Medien', keywords: [
    'designer', 'grafikdesign', 'grafik', 'fotograf', 'kameramann', 'video editor',
    'gestalter', 'journalist', 'mediengestalter', 'illustrat',
    ' ux ', ' ui ', 'motion design', 'printmedien', 'typograf',
    'medienprodukt', 'bildbearbeit', 'cutter', 'creative director',
  ]},
  { label: 'Wissenschaft & Labor', keywords: [
    'laborant', 'laborassist', 'labormitar', 'laborleiter',
    'wissenschaft', 'forschung', 'forscher', 'chemik', 'biolog',
    'pharma', 'medizinisch-technisch', 'mikrobiolog', 'biochem',
    'analytik', 'qualitätskontroll', 'pcr ', 'probenvorbereitung',
    'researcher', 'scientist',
  ]},
  { label: 'Verkauf & Handel', keywords: [
    'verkauf', 'verkäufer', 'retail', 'detailhandel', 'kasse', 'kassierer',
    'kundenberat', 'kundenberater', 'filialleiter', 'filialmitar',
    'aussendienstmitar', 'account manager', 'account executive', 'vertrieb',
    'handelsvertreter', 'verkaufsleiter', 'einkäufer', 'einkaufsleiter',
    'sales manager', 'sales representative', 'sales consultant', 'sales agent', 'inside sales',
    'key account', 'category manager', 'trade marketing',
    // Supermarkt-Frischetheke (Migros/Coop)
    'bedienungstheke', 'frischetheke', 'käsetheke', 'fleischtheke',
    'abteilungsleitung food', 'abteilungsleitung frische', 'abteilungsleitung fleisch',
    'mitarbeiter fleisch', 'mitarbeiter:in fleisch', 'mitarbeiter/in fleisch',
  ]},
  { label: 'Gastronomie & Hotel', keywords: [
    'restaurant', 'hotel', 'küche', 'köch', 'gastronomie', 'barkeeper', 'bartender',
    'catering', 'bäcker', 'konditor', 'metzger',
    'kellner', 'servierfachmann', 'servicefachmann', 'servicemitar',
    'rezeptionist', 'concierge', 'sommelier', 'hausdame',
    'chef de cuisine', 'sous chef', 'commis de cuisine', 'küchenmitar',
    'réception', 'réceptionniste', 'käser', 'käserei',
  ]},
  { label: 'Handwerk & Bau', keywords: [
    'schreiner', 'elektriker', 'elektroinstall', 'sanitärinstall', 'handwerk',
    'maurer', 'maler', 'monteur', 'mechaniker', 'schlosser', 'metallbau',
    'dachdecker', 'heizungstechnik', 'lüftungstechnik',
    'gebäudetechnik', 'zimmermann', 'polier', 'gerüstbauer', 'gleisbauer',
    'tiefbau', 'hochbau', 'baufach', 'bauleitung', 'bauprojekt', 'bauarbeit', 'bauführer',
    'haustechnik', 'sanitärfachmann', 'rohrleger', 'bodenleger', 'gipser',
    'strassenbauer', 'strassenbau',
    'kanaltechnik', 'kältetechnik', 'kältemonteur', 'servicetechnik', 'servicetechniker',
    'zeichner', 'technischer zeichner', 'bautechnik',
  ]},
  { label: 'Transport & Logistik', keywords: [
    'chauffeur', 'logistik', 'lager', 'lagermitar', 'transport',
    'lieferung', 'fahrer', 'kurier', 'spedition', 'zolldeklarant',
    'staplerfahrer', 'magaziner', 'postbot', 'zustellmitar', 'güterverk',
    'supply chain', 'warehouse', 'logistics manager', 'freight',
    'versandmitar', 'kommissionier', 'disponent',
    'rangier', 'lokführer', 'trampilot', 'tramführer', 'trolleybus',
    'kat. c', 'frühzustellung', 'nachtzustellung',
  ]},
  { label: 'Büro & Administration', keywords: [
    'sachbearbeiter', 'sekretariat', 'kaufmänn', 'buchhaltung',
    'personalassist', 'office manager', 'backoffice', 'projektassist',
    'empfangsmitar', 'korrespondenz', 'administrat', 'bürokaufm',
    'sachbearb', 'fibu', 'debitoren', 'kreditoren',
    'office coordinator', 'executive assistant', 'management assistant',
    'assistent der geschäftsleitung', 'teamassistent', 'büroangestellt',
  ]},
  { label: 'Soziales & Bildung', keywords: [
    'sozial', 'kinder', 'jugend', 'betreuung', 'pädagog', 'lehrer', 'lehrerin',
    'schule', 'erziehung', 'sozialpädagog', 'sozialarbeit',
    'coach', 'ausbilder', 'dozent', 'lernbetreuer',
    'schulsozialarbeit', 'heilpädagog', 'kindergärtner', 'hortner',
    'alltagsbegleitung', 'notwohnen', 'wohnbegleitung',
    'eingliederung', 'fallführung', 'fallbegleitung',
    'berufsberater', 'berufsberatung', 'berufsmaturität', 'berufsschule',
  ]},
  { label: 'Reinigung & Facility', keywords: [
    'reinig', 'hauswart', 'hausmeister', 'facility',
    'unterhaltsreinig', 'gebäudereinig', 'hauswirtschaft',
    'wäscherei', 'reinigungskraft', 'gebäudedienst', 'objektbetreuer',
  ]},
  { label: 'Sicherheit & Schutz', keywords: [
    'sicherheit', 'polizei', 'feuerwehr', 'bewachung', 'securitas',
    'sicherheitsdienst', 'objektschutz', 'werkschutz', 'detektiv',
    'security guard', 'security officer',
  ]},
  { label: 'Finanz & Versicherung', keywords: [
    'finanz', 'versicherung', 'bank', 'treuhand', 'steuerberater', 'buchhalter',
    'immobilien', 'anlage', 'controlling', 'treasurer', 'revisor',
    'compliance', 'risikomanag', 'finanzberatung', 'vermögensberat',
    'controller', 'financial analyst', 'finance manager', 'auditor', 'accountant',
    'wirtschaftsprüfer', 'hypothek', 'kreditberater',
    'vorsorge', 'vorsorgeberater', 'nachwuchsberater', 'financial advisor',
    'berater privatkunden', 'berater 3a', 'sparplan', 'pensionskasse',
  ]},
  { label: 'Projektmanagement', keywords: [
    'projektleiter', 'projektmanager', 'projektmanagement', 'projektkoordinat',
    'project manager', 'project lead', 'project coordinator', 'program manager', 'pmo',
    'projektingenieur', 'bauprojektleiter',
  ]},
  { label: 'Landwirtschaft & Natur', keywords: [
    'landwirtschaft', 'bauer', 'bäuerin', 'gärtner', 'gärtnerei', 'gartenarbeit', 'garten',
    'forst', 'forstwar', 'umwelt', 'agrar', 'tierarzt', 'tierpfleger',
    'veterinär', 'pferdepfleger', 'tierheil', 'botanik', 'winzer', 'landschaftsgärtner',
  ]},
  // Catch-all: nur erreicht wenn keine andere Kategorie passt
  { label: 'Management & Führung', keywords: [
    'teamleiter', 'teamlead', 'team lead', 'abteilungsleiter', 'abteilungsleitung',
    'bereichsleiter', 'bereichsleitung',
    'geschäftsführer', 'geschäftsleiter', 'filialmanager', 'store manager',
    'niederlassungsleiter', 'standortleiter', 'betriebsleiter', 'werksleiter',
    'gebietsleiter', 'gebietsleitung', 'regionalleiter', 'regionalleitung',
    'operations manager', 'general manager', 'ceo', 'coo', 'cto',
    'head of ', 'director of ', 'vice president', 'vp ',
  ]},
]

export function categorize(title: string): string {
  const lower = title.toLowerCase()
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(k => lower.includes(k))) return cat.label
  }
  return 'Weitere'
}
