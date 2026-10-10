// Contrato central del MODO DEMO.
// La app funciona sin base de datos ni API keys de IA.
// Para modo real: NEXT_PUBLIC_DEMO_MODE=false + keys en .env.local.

export function isDemoMode(): boolean {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DEMO_MODE === 'false') return false;
  return true;
}

export const DEMO_ADMIN = { email: 'admin@demo.local', password: 'demo1234', name: 'Admin Demo' };

export const DEMO_NOTES = [
  {
    id: 'nota-hta',
    titulo: 'Hipertensión arterial - Apunte de atención primaria',
    contenido: `La hipertensión arterial (HTA) se define como presión sistólica >= 140 mmHg y/o diastólica >= 90 mmHg en consultorio. Factores de riesgo: edad, sobrepeso, sedentarismo, consumo excesivo de sodio, alcohol y tabaquismo. Tratamiento: cambios de estilo de vida (dieta DASH, actividad física, reducción de sodio) y fármacos (IECA, ARA II, calcioantagonistas, diuréticos tiazídicos) según guías. Control periódico y adherencia son claves.`,
  },
  {
    id: 'nota-db2',
    titulo: 'Diabetes tipo 2 - Apunte de atención primaria',
    contenido: `La diabetes tipo 2 se diagnostica con glucemia en ayunas >= 126 mg/dl, HbA1c >= 6.5% o prueba de tolerancia alterada. Pilares: alimentación saludable, actividad física 150 min/semana, control de peso, metformina como primera línea farmacológica y pesquisa de complicaciones (retinopatía, nefropatía, pie diabético). Educación diabetológica en cada consulta.`,
  },
  {
    id: 'nota-vac',
    titulo: 'Vacunación del adulto - Apunte de atención primaria',
    contenido: `Calendario básico del adulto: antigripal anual, refuerzo antitetánica cada 10 años, COVID-19 según normativa vigente, neumococo en mayores de 65 o con comorbilidades, y hepatitis B en grupos de riesgo. Registrar siempre lote y fecha. Aprovechar toda consulta para revisar carnet.`,
  },
];

export const DEMO_RESOURCES = [
  { id: 'r1', tipo: 'pdf', titulo: 'Guía HTA - Resumen didáctico', descripcion: 'Criterios diagnósticos y tratamiento escalonado.', url: '#' },
  { id: 'r2', tipo: 'video', titulo: 'Toma correcta de presión arterial', descripcion: 'Técnica de medición en 5 minutos.', url: '#' },
  { id: 'r3', tipo: 'articulo', titulo: 'Dieta DASH explicada', descripcion: 'Qué recomendar en consultorio.', url: '#' },
  { id: 'r4', tipo: 'imagen', titulo: 'Algoritmo de pesquisa DBT2', descripcion: 'Flujograma de diagnóstico.', url: '#' },
];

export const DEMO_QUIZ = [
  { id: 'q1', pregunta: '¿Cuál es el umbral diagnóstico de HTA en consultorio?', opciones: ['120/80', '130/85', '140/90', '160/100'], respuesta: 2 },
  { id: 'q2', pregunta: '¿Primera línea farmacológica en diabetes tipo 2?', opciones: ['Insulina', 'Metformina', 'Glibenclamida', 'Sitagliptina'], respuesta: 1 },
  { id: 'q3', pregunta: '¿Cada cuánto el refuerzo antitetánico en adultos?', opciones: ['1 año', '5 años', '10 años', 'Una sola vez'], respuesta: 2 },
  { id: 'q4', pregunta: '¿Actividad física semanal recomendada?', opciones: ['30 min', '75 min', '150 min', '300 min'], respuesta: 2 },
  { id: 'q5', pregunta: '¿HbA1c diagnóstica de diabetes?', opciones: ['5.7%', '6.0%', '6.5%', '7.0%'], respuesta: 2 },
];

const DISCLAIMER = '\n\n_Respuesta generada en modo demo con fines educativos. No reemplaza el criterio médico profesional._';

export function demoChatReply(pregunta: string): string {
  const q = (pregunta || '').toLowerCase();
  const nota = (id: string) => DEMO_NOTES.find((n) => n.id === id)?.contenido ?? '';
  if (/hipertens|presi[oó]n|hta|tensi/.test(q))
    return `**Hipertensión arterial (apunte demo)**\n\n${nota('nota-hta')}${DISCLAIMER}`;
  if (/diabet|glucem|az[uú]car|hba1c|metformina/.test(q))
    return `**Diabetes tipo 2 (apunte demo)**\n\n${nota('nota-db2')}${DISCLAIMER}`;
  if (/vacun|inmuniz|gripe|tetan/.test(q))
    return `**Vacunación del adulto (apunte demo)**\n\n${nota('nota-vac')}${DISCLAIMER}`;
  if (/fiebre|dolor|tos|síntoma|sintoma/.test(q))
    return `En modo demo no evalúo síntomas individuales. Te sugiero consultar los apuntes precargados (HTA, diabetes, vacunación) o el material de autoevaluación. Si hay signos de alarma (dolor torácico, disnea, fiebre alta persistente), corresponde atención médica presencial.${DISCLAIMER}`;
  return `Estoy en **modo demo**: respondo solo con los apuntes precargados (hipertensión, diabetes tipo 2 y vacunación del adulto). Probá preguntando por alguno de esos temas.${DISCLAIMER}`;
}
