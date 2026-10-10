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
  {
    id: 'nota-salud-mental',
    titulo: 'Salud mental en atención primaria - Apunte',
    contenido: `La APS es la puerta de entrada para ansiedad y depresión: pesquisar con escucha activa, sin minimizar ni juzgar. Depresión: ánimo bajo o anhedonia por >= 2 semanas más síntomas asociados (sueño, apetito, energía, concentración). Ante riesgo suicida, preguntar directamente y activar red de apoyo y derivación. El seguimiento programado y el plan de cuidado compartido mejoran la adherencia.`,
  },
  {
    id: 'nota-nino-sano',
    titulo: 'Control de niño sano - Apunte de atención primaria',
    contenido: `El control de niño sano evalúa crecimiento (peso, talla, perímetro cefálico en curvas), desarrollo psicomotor, alimentación (lactancia exclusiva hasta los 6 meses) y calendario de vacunación. Frecuencia intensiva el primer año y luego periódica. En cada control se pesquisan signos de alarma, anemia, salud visual, auditiva y bucal. Acompañar a la familia con pautas de crianza y sueño seguro.`,
  },
  {
    id: 'nota-hta-embarazo',
    titulo: 'HTA en el embarazo - Apunte de atención primaria',
    contenido: `La HTA gestacional e hipertensión crónica con preeclampsia sobreagregada exigen control prenatal frecuente de presión arterial y proteinuria. Signos de alarma: cefalea intensa, alteraciones visuales, dolor epigástrico, edema brusco y disminución de movimientos fetales. Derivación urgente ante sospecha de preeclampsia o eclampsia. Aspirina en dosis bajas solo si está indicada y ácido fólico según norma local.`,
  },
  {
    id: 'nota-epoc-tabaco',
    titulo: 'EPOC y tabaquismo - Apunte de atención primaria',
    contenido: `El tabaquismo es la principal causa evitable de EPOC: tos crónica, expectoración y disnea progresiva en fumadores o exfumadores. Diagnóstico con espirometría (FEV1/FVC < 0,70 post-broncodilatador). El consejo breve para dejar de fumar (preguntar, aconsejar, evaluar, ayudar y seguimiento) es efectivo en APS. La cesación enlentece la caída del FEV1, sumada a vacunación, rehabilitación y técnica inhalatoria correcta.`,
  },
  {
    id: 'nota-primeros-auxilios',
    titulo: 'Primeros auxilios básicos - Apunte de atención primaria',
    contenido: `Ante emergencias: asegurar la escena, llamar al número local de emergencias y evaluar conciencia, respiración y pulso. RCP solo con compresiones 100-120/min si no respira; atragantamiento con maniobra de Heimlich; hemorragias con presión directa; quemaduras enfriando con agua, sin hielo ni pastas. Posición lateral de seguridad en inconsciente que respira. Capacitar a la comunidad salva vidas.`,
  },
];

export const DEMO_RESOURCES = [
  { id: 'r1', tipo: 'pdf', titulo: 'Guía HTA - Resumen didáctico', descripcion: 'Criterios diagnósticos y tratamiento escalonado.', url: '#' },
  { id: 'r2', tipo: 'video', titulo: 'Toma correcta de presión arterial', descripcion: 'Técnica de medición en 5 minutos.', url: '#' },
  { id: 'r3', tipo: 'articulo', titulo: 'Dieta DASH explicada', descripcion: 'Qué recomendar en consultorio.', url: '#' },
  { id: 'r4', tipo: 'imagen', titulo: 'Algoritmo de pesquisa DBT2', descripcion: 'Flujograma de diagnóstico.', url: 'https://placehold.co/600x400?text=Algoritmo+DBT2' },
  { id: 'r5', tipo: 'video', titulo: 'Técnica de glucemia capilar paso a paso', descripcion: 'Higiene, punción y lectura correcta del glucómetro.', url: '#' },
  { id: 'r6', tipo: 'video', titulo: 'Calendario de vacunación del adulto', descripcion: 'Qué vacuna indicar según edad y riesgo.', url: '#' },
  { id: 'r7', tipo: 'video', titulo: 'RCP básica en adultos', descripcion: 'Compresiones, ritmo y cuándo pedir ayuda.', url: '#' },
  { id: 'r8', tipo: 'video', titulo: 'Consejo breve para dejar de fumar', descripcion: 'Modelo de 5 pasos aplicable en 3 minutos.', url: '#' },
  { id: 'r9', tipo: 'video', titulo: 'Control de niño sano: qué evaluar', descripcion: 'Crecimiento, desarrollo y pautas a la familia.', url: '#' },
  { id: 'r10', tipo: 'video', titulo: 'Primera escucha en salud mental', descripcion: 'Cómo abordar ansiedad y depresión en APS.', url: '#' },
  { id: 'r11', tipo: 'video', titulo: 'Uso correcto del inhalador', descripcion: 'Errores frecuentes y técnica con cámara espaciadora.', url: '#' },
  { id: 'r13', tipo: 'pdf', titulo: 'Guía diabetes tipo 2 en APS', descripcion: 'Diagnóstico, metformina y pesquisa de complicaciones.', url: '#' },
  { id: 'r14', tipo: 'pdf', titulo: 'Calendario de vacunación y registro', descripcion: 'Esquemas del adulto y cómo registrar lote y fecha.', url: '#' },
  { id: 'r15', tipo: 'pdf', titulo: 'Guía EPOC y cesación tabáquica', descripcion: 'Espirometría, tratamiento y seguimiento.', url: '#' },
  { id: 'r16', tipo: 'pdf', titulo: 'Guía de primeros auxilios en APS', descripcion: 'RCP, Heimlich, hemorragias y quemaduras.', url: '#' },
  { id: 'r17', tipo: 'pdf', titulo: 'Guía de salud mental en APS', descripcion: 'Pesquisa de depresión, ansiedad y riesgo suicida.', url: '#' },
  { id: 'r18', tipo: 'imagen', titulo: 'Plato saludable y dieta DASH', descripcion: 'Infografía para entregar en consultorio.', url: 'https://placehold.co/600x400?text=Plato+saludable' },
  { id: 'r19', tipo: 'imagen', titulo: 'Técnica de lavado de manos', descripcion: 'Los 5 momentos y pasos ilustrados.', url: 'https://placehold.co/600x400?text=Lavado+de+manos' },
  { id: 'r20', tipo: 'imagen', titulo: 'Maniobra de Heimlich', descripcion: 'Pasos ilustrados en adultos y niños.', url: 'https://placehold.co/600x400?text=Heimlich' },
  { id: 'r21', tipo: 'imagen', titulo: 'Curvas de crecimiento infantil', descripcion: 'Cómo interpretar peso y talla por edad.', url: 'https://placehold.co/600x400?text=Curvas+crecimiento' },
  { id: 'r22', tipo: 'imagen', titulo: 'FAST: reconoce un ACV', descripcion: 'Cara, brazo, habla y tiempo de llamada.', url: 'https://placehold.co/600x400?text=FAST+ACV' },
  { id: 'r23', tipo: 'articulo', titulo: 'HTA en el embarazo: claves para APS', descripcion: 'Preeclampsia, controles y derivación oportuna.', url: '#' },
  { id: 'r24', tipo: 'articulo', titulo: 'Prevención del pie diabético', descripcion: 'Revisión de pies y calzado en cada visita.', url: '#' },
  { id: 'r25', tipo: 'articulo', titulo: 'Depresión y ansiedad en APS', descripcion: 'Detección, seguimiento y red de apoyo.', url: '#' },
];

export const DEMO_QUIZ = [
  { id: 'q1', pregunta: '¿Cuál es el umbral diagnóstico de HTA en consultorio?', opciones: ['120/80', '130/85', '140/90', '160/100'], respuesta: 2 },
  { id: 'q2', pregunta: '¿Primera línea farmacológica en diabetes tipo 2?', opciones: ['Insulina', 'Metformina', 'Glibenclamida', 'Sitagliptina'], respuesta: 1 },
  { id: 'q3', pregunta: '¿Cada cuánto el refuerzo antitetánico en adultos?', opciones: ['1 año', '5 años', '10 años', 'Una sola vez'], respuesta: 2 },
  { id: 'q4', pregunta: '¿Actividad física semanal recomendada?', opciones: ['30 min', '75 min', '150 min', '300 min'], respuesta: 2 },
  { id: 'q5', pregunta: '¿HbA1c diagnóstica de diabetes?', opciones: ['5.7%', '6.0%', '6.5%', '7.0%'], respuesta: 2 },
];

export const DEMO_ASSESSMENTS: {
  id: string;
  titulo: string;
  descripcion: string;
  tema: string;
  nivel: 'básico' | 'intermedio' | 'avanzado';
  preguntas: { id: string; pregunta: string; opciones: string[]; respuesta: number; explicacion: string }[];
}[] = [
  {
    id: 'eval-hta',
    titulo: 'Hipertensión arterial',
    descripcion: 'Diagnóstico, medición, estilo de vida y tratamiento de la HTA en APS.',
    tema: 'HTA',
    nivel: 'básico',
    preguntas: [
      {
        id: 'eval-hta-p1',
        pregunta: '¿Cuál es el umbral diagnóstico de HTA en consultorio?',
        opciones: ['120/80 mmHg', '130/85 mmHg', '140/90 mmHg', '160/100 mmHg'],
        respuesta: 2,
        explicacion: 'Se considera HTA la presión sistólica >= 140 mmHg y/o diastólica >= 90 mmHg en consultorio, confirmada con mediciones adecuadas.',
      },
      {
        id: 'eval-hta-p2',
        pregunta: '¿Qué condición es correcta para medir la presión arterial?',
        opciones: [
          'Medir justo después de subir escaleras',
          'Reposo de 3-5 minutos, vejiga vacía y sin café ni tabaco previos',
          'Con el brazo en alto y ropa ajustada',
          'Una sola toma basta siempre',
        ],
        respuesta: 1,
        explicacion: 'Se recomienda reposo previo, vejiga vacía, evitar café y tabaco, manguito adecuado y promediar al menos 2 tomas.',
      },
      {
        id: 'eval-hta-p3',
        pregunta: '¿Qué cambio de estilo de vida tiene mayor evidencia en HTA?',
        opciones: [
          'Dieta DASH, reducción de sodio, actividad física y control de peso',
          'Eliminar solo el agua de la dieta',
          'Reposo absoluto permanente',
          'Aumentar el consumo de alcohol',
        ],
        respuesta: 0,
        explicacion: 'La dieta DASH, menos sodio, 150 min/semana de actividad, control de peso y no fumar reducen la presión y el riesgo cardiovascular.',
      },
      {
        id: 'eval-hta-p4',
        pregunta: '¿Qué grupos farmacológicos son de primera línea en HTA no complicada?',
        opciones: [
          'IECA o ARA II, calcioantagonistas y tiazidas',
          'Antibióticos y corticoides',
          'Ansiolíticos y analgésicos',
          'Solo suplementos vitamínicos',
        ],
        respuesta: 0,
        explicacion: 'Las guías recomiendan IECA o ARA II, calcioantagonistas y diuréticos tiazídicos, solos o combinados según el paciente.',
      },
      {
        id: 'eval-hta-p5',
        pregunta: 'Un paciente abandona su antihipertensivo porque "ya se siente bien". ¿Qué corresponde?',
        opciones: [
          'Felicitarlo y suspender controles',
          'Reforzar adherencia: la HTA suele ser asintomática y el control debe mantenerse',
          'Duplicar la dosis sin control',
          'Cambiar a remedios sin evidencia',
        ],
        respuesta: 1,
        explicacion: 'Sentirse bien no significa estar controlado. La adherencia sostenida y los controles periódicos previenen infarto, ACV y daño renal.',
      },
    ],
  },
  {
    id: 'eval-diabetes',
    titulo: 'Diabetes tipo 2',
    descripcion: 'Diagnóstico, tratamiento, actividad física y prevención de complicaciones.',
    tema: 'Diabetes',
    nivel: 'básico',
    preguntas: [
      {
        id: 'eval-diabetes-p1',
        pregunta: '¿Qué valor confirma diabetes tipo 2?',
        opciones: ['Glucemia en ayunas de 100 mg/dl', 'HbA1c de 6.5% o más', 'HbA1c de 5.6%', 'Glucemia casual de 110 mg/dl sin síntomas'],
        respuesta: 1,
        explicacion: 'Diabetes: ayunas >= 126 mg/dl, HbA1c >= 6.5% o glucemia >= 200 mg/dl con síntomas clásicos, confirmados según protocolo.',
      },
      {
        id: 'eval-diabetes-p2',
        pregunta: '¿Cuál es el fármaco de primera línea en diabetes tipo 2?',
        opciones: ['Insulina de inicio en todos', 'Metformina', 'Ibuprofeno', 'Levotiroxina'],
        respuesta: 1,
        explicacion: 'La metformina es la primera línea habitual junto a estilo de vida, salvo contraindicación o intolerancia.',
      },
      {
        id: 'eval-diabetes-p3',
        pregunta: '¿Cuánta actividad física aeróbica se recomienda por semana?',
        opciones: ['30 minutos', '75 minutos', '150 minutos', 'No se recomienda actividad'],
        respuesta: 2,
        explicacion: 'Se recomiendan al menos 150 minutos semanales de actividad moderada, más fortalecimiento muscular.',
      },
      {
        id: 'eval-diabetes-p4',
        pregunta: '¿Qué complicación debe pesquisarse en cada control?',
        opciones: [
          'Pie diabético, retina, riñón y riesgo cardiovascular',
          'Solo el color de ojos',
          'Solo la estatura',
          'Ninguna, si no hay síntomas',
        ],
        respuesta: 0,
        explicacion: 'En APS se revisan pies, fondo de ojo, función renal, presión, lípidos y tabaquismo para prevenir complicaciones.',
      },
      {
        id: 'eval-diabetes-p5',
        pregunta: '¿Cuáles son síntomas típicos de hipoglucemia?',
        opciones: [
          'Sudoración, temblor, palpitaciones y confusión',
          'Fiebre alta y tos con flema',
          'Dolor articular aislado',
          'Pérdida auditiva súbita',
        ],
        respuesta: 0,
        explicacion: 'La hipoglucemia da síntomas adrenérgicos y neuroglucopénicos. Requiere azúcar de acción rápida y revisión del tratamiento.',
      },
    ],
  },
  {
    id: 'eval-vacunacion',
    titulo: 'Vacunación del adulto',
    descripcion: 'Esquemas básicos, grupos de riesgo y registro en APS.',
    tema: 'Vacunación',
    nivel: 'básico',
    preguntas: [
      {
        id: 'eval-vacunacion-p1',
        pregunta: '¿Cada cuánto se aplica la vacuna antigripal en grupos de riesgo?',
        opciones: ['Cada mes', 'Cada año', 'Cada 10 años', 'Una sola vez en la vida'],
        respuesta: 1,
        explicacion: 'La antigripal es anual por el cambio de cepas y la caída de la inmunidad.',
      },
      {
        id: 'eval-vacunacion-p2',
        pregunta: '¿Cada cuánto el refuerzo antitetánico (dT) en adultos?',
        opciones: ['Cada año', 'Cada 5 años', 'Cada 10 años', 'Nunca se refuerza'],
        respuesta: 2,
        explicacion: 'El refuerzo con toxoide tetánico-diftérico se indica cada 10 años, y antes ante heridas de riesgo.',
      },
      {
        id: 'eval-vacunacion-p3',
        pregunta: '¿A quién se recomienda especialmente la vacuna antineumocócica?',
        opciones: [
          'Mayores de 65 años y personas con comorbilidades',
          'Solo a recién nacidos',
          'Solo a deportistas jóvenes',
          'A nadie en APS',
        ],
        respuesta: 0,
        explicacion: 'Neumococo se prioriza en mayores de 65 años, inmunocomprometidos y enfermedades crónicas por riesgo de neumonía grave.',
      },
      {
        id: 'eval-vacunacion-p4',
        pregunta: '¿Qué dato nunca debe faltar al registrar una vacuna?',
        opciones: [
          'Lote, fecha, vacuna aplicada y firma del vacunador',
          'Solo el nombre del paciente',
          'Solo el día de la semana',
          'Ningún registro es necesario',
        ],
        respuesta: 0,
        explicacion: 'El registro con lote y fecha permite trazabilidad, certificar esquemas y vigilar eventos adversos.',
      },
      {
        id: 'eval-vacunacion-p5',
        pregunta: '¿Cuál es una buena práctica en APS respecto a vacunación?',
        opciones: [
          'Revisar el carnet en toda consulta y aprovechar oportunidades',
          'Preguntar solo una vez en la vida',
          'Vacunar sin interrogar antecedentes',
          'Evitar registrar para ahorrar tiempo',
        ],
        respuesta: 0,
        explicacion: 'Toda consulta es oportunidad para actualizar esquemas, ya que muchos adultos tienen calendarios incompletos.',
      },
    ],
  },
  {
    id: 'eval-salud-mental',
    titulo: 'Salud mental en APS',
    descripcion: 'Detección de depresión y ansiedad, escucha y derivación oportuna.',
    tema: 'Salud mental',
    nivel: 'intermedio',
    preguntas: [
      {
        id: 'eval-salud-mental-p1',
        pregunta: '¿Qué criterio temporal orienta a depresión?',
        opciones: [
          'Ánimo bajo o anhedonia por 2 o más semanas con otros síntomas',
          'Un mal día aislado',
          'Solo cansancio de una tarde',
          'Alegria excesiva de un día',
        ],
        respuesta: 0,
        explicacion: 'La depresión requiere ánimo deprimido o pérdida de interés por al menos 2 semanas más cambios en sueño, apetito, energía o concentración.',
      },
      {
        id: 'eval-salud-mental-p2',
        pregunta: '¿Cuál es la primera actitud correcta ante un relato de angustia?',
        opciones: [
          'Escucha activa, sin juzgar ni minimizar',
          'Decir "eso no es nada"',
          'Interrumpir y cambiar de tema',
          'Prometer confidencialidad absoluta aun con riesgo vital',
        ],
        respuesta: 0,
        explicacion: 'Validar, escuchar y explorar con preguntas abiertas genera confianza y permite evaluar gravedad y red de apoyo.',
      },
      {
        id: 'eval-salud-mental-p3',
        pregunta: 'Si detectas posible riesgo suicida, ¿qué debes hacer?',
        opciones: [
          'Preguntar directamente por ideas de daño y activar protocolo de derivación',
          'Evitar el tema para no "dar ideas"',
          'Dejarlo para el próximo año',
          'Recomendar solo dormir más',
        ],
        respuesta: 0,
        explicacion: 'Preguntar directamente no induce el acto y permite proteger: no dejar sola a la persona y derivar urgente según protocolo local.',
      },
      {
        id: 'eval-salud-mental-p4',
        pregunta: '¿Qué síntoma es típico del trastorno de ansiedad generalizada?',
        opciones: [
          'Preocupación excesiva y difícil de controlar por meses, con tensión y sueño alterado',
          'Fiebre de 40 grados',
          'Fractura ósea',
          'Sordera total súbita',
        ],
        respuesta: 0,
        explicacion: 'La ansiedad generalizada cursa con preocupación persistente, inquietud, fatiga, tensión muscular y alteraciones del sueño.',
      },
      {
        id: 'eval-salud-mental-p5',
        pregunta: '¿Qué incluye un buen seguimiento en APS?',
        opciones: [
          'Plan de cuidado, visitas programadas, red familiar y criterios de derivación',
          'Alta sin seguimiento',
          'Solo un folleto sin explicación',
          'Suspender todo contacto',
        ],
        respuesta: 0,
        explicacion: 'El seguimiento programado, la psicoeducación y la articulación con salud mental mejoran la evolución y la adherencia.',
      },
    ],
  },
  {
    id: 'eval-nino-sano',
    titulo: 'Control de niño sano',
    descripcion: 'Crecimiento, desarrollo, lactancia y calendario infantil.',
    tema: 'Niño sano',
    nivel: 'intermedio',
    preguntas: [
      {
        id: 'eval-nino-sano-p1',
        pregunta: '¿Hasta cuándo se recomienda lactancia materna exclusiva?',
        opciones: ['1 mes', '3 meses', '6 meses', '2 años como única alimentación'],
        respuesta: 2,
        explicacion: 'Se recomienda lactancia exclusiva hasta los 6 meses y luego complementaria hasta los 2 años o más.',
      },
      {
        id: 'eval-nino-sano-p2',
        pregunta: '¿Qué se evalúa con las curvas de crecimiento?',
        opciones: [
          'Peso, talla y perímetro cefálico según edad y sexo',
          'Solo el grupo sanguíneo',
          'Solo la presión arterial del adulto',
          'El coeficiente intelectual exacto',
        ],
        respuesta: 0,
        explicacion: 'Las curvas permiten detectar desnutrición, sobrepeso o macro/microcefalia y actuar precozmente.',
      },
      {
        id: 'eval-nino-sano-p3',
        pregunta: '¿Cuándo son más frecuentes los controles de niño sano?',
        opciones: [
          'El primer año de vida',
          'Solo a los 18 años',
          'Cada 10 años',
          'Nunca son necesarios',
        ],
        respuesta: 0,
        explicacion: 'El primer año concentra controles por el rápido crecimiento, vacunación y pesquisa de alteraciones del desarrollo.',
      },
      {
        id: 'eval-nino-sano-p4',
        pregunta: '¿Qué hito del desarrollo es esperable hacia los 12 meses?',
        opciones: [
          'Primeras palabras, señalar y marcha con apoyo o independiente',
          'Leer textos largos',
          'Resolver ecuaciones',
          'Conducir un vehículo',
        ],
        respuesta: 0,
        explicacion: 'Al año se espera balbuceo con sentido, gestos, pinza y marcha asistida o libre; los desvíos requieren evaluación.',
      },
      {
        id: 'eval-nino-sano-p5',
        pregunta: 'Un lactante menor de 3 meses con fiebre, ¿qué conducta es correcta?',
        opciones: [
          'Derivación urgente: todo lactante febril pequeño es de alto riesgo',
          'Esperar una semana en casa sin consultar',
          'Solo baños fríos prolongados',
          'Automedicar con antibiótico adulto',
        ],
        respuesta: 0,
        explicacion: 'La fiebre en menores de 3 meses obliga a evaluación urgente por riesgo de infección bacteriana grave.',
      },
    ],
  },
  {
    id: 'eval-primeros-auxilios',
    titulo: 'Primeros auxilios básicos',
    descripcion: 'RCP, atragantamiento, hemorragias y quemaduras.',
    tema: 'Primeros auxilios',
    nivel: 'básico',
    preguntas: [
      {
        id: 'eval-primeros-auxilios-p1',
        pregunta: 'Un adulto no responde y no respira normalmente. ¿Qué haces primero?',
        opciones: [
          'Llamar a emergencias e iniciar compresiones torácicas 100-120/min',
          'Darle agua y sacudirlo fuerte',
          'Esperar a que despierte solo',
          'Trasladarlo sentado en moto',
        ],
        respuesta: 0,
        explicacion: 'Activar emergencias e iniciar RCP precoz con compresiones firmes y rápidas aumenta la supervivencia.',
      },
      {
        id: 'eval-primeros-auxilios-p2',
        pregunta: 'Adulto consciente que se atraganta y no puede hablar ni toser. ¿Qué maniobra aplicas?',
        opciones: ['Maniobra de Heimlich (compresiones abdominales)', 'Darle leche', 'Golpear la cabeza', 'Acostarlo boca abajo sin hacer nada'],
        respuesta: 0,
        explicacion: 'La Heimlich con compresiones abdominales puede expulsar el cuerpo extraño en la obstrucción grave.',
      },
      {
        id: 'eval-primeros-auxilios-p3',
        pregunta: '¿Cómo controlas una hemorragia externa en una extremidad?',
        opciones: [
          'Presión directa con apósito y elevar si es posible',
          'Chupar la herida',
          'Aplicar tierra o café',
          'Aflojar y dejar sangrar libremente',
        ],
        respuesta: 0,
        explicacion: 'La presión directa es la primera medida; el torniquete solo en casos graves con técnica adecuada.',
      },
      {
        id: 'eval-primeros-auxilios-p4',
        pregunta: '¿Qué haces ante una quemadura leve?',
        opciones: [
          'Enfriar con agua corriente 10-20 minutos y cubrir con apósito limpio',
          'Aplicar hielo directo y pasta dental',
          'Romper todas las ampollas',
          'Exponer al sol para secar',
        ],
        respuesta: 0,
        explicacion: 'El agua corriente alivia y limita el daño; el hielo quema y las pastas infectan. No romper ampollas.',
      },
      {
        id: 'eval-primeros-auxilios-p5',
        pregunta: 'Persona inconsciente que respira normalmente y sin trauma. ¿Qué posición usas mientras llega ayuda?',
        opciones: [
          'Posición lateral de seguridad',
          'Boca abajo con la cara tapada',
          'Sentada al volante',
          'Colgada de los pies',
        ],
        respuesta: 0,
        explicacion: 'La posición lateral mantiene la vía aérea permeable y evita la aspiración en caso de vómitos.',
      },
    ],
  },
  {
    id: 'eval-tabaquismo-epoc',
    titulo: 'Tabaquismo y EPOC',
    descripcion: 'Cesación, diagnóstico espirométrico y manejo en APS.',
    tema: 'Tabaquismo / EPOC',
    nivel: 'intermedio',
    preguntas: [
      {
        id: 'eval-tabaquismo-epoc-p1',
        pregunta: '¿Cuál es la principal causa de EPOC?',
        opciones: ['Tabaquismo', 'Beber agua', 'Hacer ejercicio', 'Dormir 8 horas'],
        respuesta: 0,
        explicacion: 'El humo del tabaco es el principal factor de riesgo evitable de EPOC y de muchas otras enfermedades.',
      },
      {
        id: 'eval-tabaquismo-epoc-p2',
        pregunta: '¿Cómo se confirma la EPOC?',
        opciones: [
          'Espirometría con FEV1/FVC < 0,70 post-broncodilatador',
          'Solo con una radiografía de mano',
          'Solo preguntando la edad',
          'Con un análisis de orina',
        ],
        respuesta: 0,
        explicacion: 'La espirometría demuestra la obstrucción persistente al flujo aéreo característica de la EPOC.',
      },
      {
        id: 'eval-tabaquismo-epoc-p3',
        pregunta: '¿Qué incluye el consejo breve para dejar de fumar?',
        opciones: [
          'Preguntar, aconsejar, evaluar disposición, ayudar y programar seguimiento',
          'Retar y avergonzar al paciente',
          'Decir que es imposible dejarlo',
          'Recomendar fumar más para acostumbrarse',
        ],
        respuesta: 0,
        explicacion: 'El modelo breve de APS es efectivo: consejo claro, apoyo farmacológico si corresponde y seguimiento.',
      },
      {
        id: 'eval-tabaquismo-epoc-p4',
        pregunta: '¿Qué beneficio ocurre a las pocas semanas de dejar de fumar?',
        opciones: [
          'Mejoran la tos, la respiración y la circulación',
          'Empeora irreversiblemente todo',
          'No cambia nada',
          'Aumenta el riesgo de EPOC',
        ],
        respuesta: 0,
        explicacion: 'Dejar de fumar enlentece la caída del FEV1 y mejora síntomas, además de reducir riesgo cardiovascular y cáncer.',
      },
      {
        id: 'eval-tabaquismo-epoc-p5',
        pregunta: '¿Qué error es frecuente con el inhalador?',
        opciones: [
          'No agitar, no exhalar antes ni contener la respiración después',
          'Usar cámara espaciadora cuando está indicada',
          'Enjuagar la boca tras corticoides',
          'Revisar la fecha de caducidad',
        ],
        respuesta: 0,
        explicacion: 'La mala técnica reduce el depósito pulmonar. Enseñar y reevaluar la técnica con espaciador mejora el control.',
      },
    ],
  },
  {
    id: 'eval-signos-alarma',
    titulo: 'Signos de alarma',
    descripcion: 'Cuándo derivar urgente: tórax, ACV, fiebre, embarazo y sepsis.',
    tema: 'Signos de alarma',
    nivel: 'avanzado',
    preguntas: [
      {
        id: 'eval-signos-alarma-p1',
        pregunta: 'Dolor torácico opresivo con sudoración y disnea. ¿Qué corresponde?',
        opciones: [
          'Activar emergencias de inmediato por posible síndrome coronario',
          'Enviar a casa con un té',
          'Esperar 3 días a ver si pasa',
          'Solo masajear el pecho',
        ],
        respuesta: 0,
        explicacion: 'El dolor torácico típico con síntomas asociados es emergencia: ECG y atención inmediata salvan miocardio.',
      },
      {
        id: 'eval-signos-alarma-p2',
        pregunta: '¿Qué significa FAST en sospecha de ACV?',
        opciones: [
          'Cara, brazo, habla y tiempo para llamar a emergencias',
          'Fiebre, apetito, sueño y tos',
          'Solo medir la fiebre',
          'Ayuno, sed y trabajo',
        ],
        respuesta: 0,
        explicacion: 'Asimetría facial, caída de un brazo o habla alterada obligan a llamar a emergencias sin demora.',
      },
      {
        id: 'eval-signos-alarma-p3',
        pregunta: 'Niño con fiebre alta persistente, decaimiento y mala hidratación. ¿Qué haces?',
        opciones: [
          'Derivación urgente y reevaluación de hidratación',
          'Abrigarlo en exceso y esperar',
          'Baños con agua helada prolongados',
          'Ignorar los signos',
        ],
        respuesta: 0,
        explicacion: 'Fiebre con compromiso general o deshidratación es signo de alarma que exige evaluación urgente.',
      },
      {
        id: 'eval-signos-alarma-p4',
        pregunta: 'Embarazada con cefalea intensa, visión borrosa y edema brusco. ¿Qué sospechas?',
        opciones: ['Preeclampsia: derivación urgente', 'Resfrío común', 'Alergia estacional leve', 'Cansancio normal sin control'],
        respuesta: 0,
        explicacion: 'Son signos clásicos de preeclampsia, con riesgo materno-fetal. Requiere control de presión, proteinuria y derivación.',
      },
      {
        id: 'eval-signos-alarma-p5',
        pregunta: '¿Qué combinación sugiere sepsis y exige acción inmediata?',
        opciones: [
          'Fiebre o hipotermia más taquicardia, taquipnea, hipotensión o confusión',
          'Solo estornudos aislados',
          'Solo dolor de muelas leve',
          'Solo picazón de piel sin fiebre',
        ],
        respuesta: 0,
        explicacion: 'La sepsis es disfunción orgánica por infección. La detección precoz, cultivos, antibiótico y fluidos salvan vidas.',
      },
    ],
  },
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
