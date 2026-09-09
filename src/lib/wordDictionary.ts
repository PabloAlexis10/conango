// Motor Lingüístico y Diccionario de Vocabulario ALCPT / Militar / General
// Proporciona traducciones al español y conjugación/aplicación en Pasado, Presente y Futuro

export interface WordGrammarInfo {
  word: string;
  cleanWord: string;
  translation: string;
  partOfSpeech: string;
  phonetic?: string;
  past: {
    form: string;
    exampleEn: string;
    exampleEs: string;
  };
  present: {
    form: string;
    exampleEn: string;
    exampleEs: string;
  };
  future: {
    form: string;
    exampleEn: string;
    exampleEs: string;
  };
}

// Diccionario curado de alta frecuencia en reactivos ALCPT y aviación militar
const DICTIONARY: Record<string, Omit<WordGrammarInfo, "word" | "cleanWord">> = {
  // VERBOS COMUNES E IRREGULARES
  be: {
    translation: "ser / estar",
    partOfSpeech: "Verbo auxiliar",
    phonetic: "/biː/",
    past: { form: "was / were", exampleEn: "He was on duty yesterday.", exampleEs: "Él estuvo de guardia ayer." },
    present: { form: "am / is / are", exampleEn: "He is at the airbase now.", exampleEs: "Él está en la base aérea ahora." },
    future: { form: "will be", exampleEn: "He will be ready tomorrow.", exampleEs: "Él estará listo mañana." },
  },
  is: {
    translation: "es / está",
    partOfSpeech: "Verbo (3ra pers.)",
    phonetic: "/ɪz/",
    past: { form: "was", exampleEn: "The pilot was ready.", exampleEs: "El piloto estaba listo." },
    present: { form: "is", exampleEn: "The runway is clear.", exampleEs: "La pista está despejada." },
    future: { form: "will be", exampleEn: "The weather will be favorable.", exampleEs: "El clima será favorable." },
  },
  are: {
    translation: "son / están",
    partOfSpeech: "Verbo (plural)",
    phonetic: "/ɑːr/",
    past: { form: "were", exampleEn: "They were in the hangar.", exampleEs: "Ellos estaban en el hangar." },
    present: { form: "are", exampleEn: "The officers are in the briefing.", exampleEs: "Los oficiales están en la reunión." },
    future: { form: "will be", exampleEn: "They will be on station.", exampleEs: "Ellos estarán en su puesto." },
  },
  was: {
    translation: "era / fue / estaba",
    partOfSpeech: "Verbo (Pasado)",
    phonetic: "/wɒz/",
    past: { form: "was", exampleEn: "The flight was delayed.", exampleEs: "El vuelo estuvo retrasado." },
    present: { form: "is / am", exampleEn: "The flight is on time.", exampleEs: "El vuelo está a tiempo." },
    future: { form: "will be", exampleEn: "The flight will be inspected.", exampleEs: "El vuelo será inspeccionado." },
  },
  were: {
    translation: "eran / fueron / estaban",
    partOfSpeech: "Verbo (Pasado plural)",
    phonetic: "/wɜːr/",
    past: { form: "were", exampleEn: "The troops were deployed.", exampleEs: "Las tropas fueron desplegadas." },
    present: { form: "are", exampleEn: "The troops are on alert.", exampleEs: "Las tropas están en alerta." },
    future: { form: "will be", exampleEn: "They will be stationed in base.", exampleEs: "Estarán destacados en la base." },
  },
  go: {
    translation: "ir / dirigirse",
    partOfSpeech: "Verbo irregular",
    phonetic: "/ɡoʊ/",
    past: { form: "went", exampleEn: "They went to the flight line.", exampleEs: "Ellos fueron a la línea de vuelo." },
    present: { form: "go / goes", exampleEn: "Pilots go to the simulator daily.", exampleEs: "Los pilotos van al simulador a diario." },
    future: { form: "will go", exampleEn: "We will go to the control tower.", exampleEs: "Iremos a la torre de control." },
  },
  went: {
    translation: "fue / fue (hacia)",
    partOfSpeech: "Verbo (Pasado de go)",
    phonetic: "/wɛnt/",
    past: { form: "went", exampleEn: "The commander went to HQ.", exampleEs: "El comandante fue al cuartel general." },
    present: { form: "go / goes", exampleEn: "The commander goes to HQ.", exampleEs: "El comandante va al cuartel general." },
    future: { form: "will go", exampleEn: "The commander will go tomorrow.", exampleEs: "El comandante irá mañana." },
  },
  fly: {
    translation: "volar / pilotar",
    partOfSpeech: "Verbo irregular",
    phonetic: "/flaɪ/",
    past: { form: "flew", exampleEn: "Captain Davis flew the F-16.", exampleEs: "El Capitán Davis voló el F-16." },
    present: { form: "fly / flies", exampleEn: "They fly tactical training routes.", exampleEs: "Ellos vuelan rutas de entrenamiento táctico." },
    future: { form: "will fly", exampleEn: "She will fly at dawn.", exampleEs: "Ella volará al amanecer." },
  },
  flight: {
    translation: "vuelo / escuadrilla",
    partOfSpeech: "Sustantivo",
    phonetic: "/flaɪt/",
    past: { form: "flight (participó en)", exampleEn: "The flight departed at 0800 hours.", exampleEs: "El vuelo partió a las 0800 horas." },
    present: { form: "flight (está en)", exampleEn: "Flight 104 is inbound for landing.", exampleEs: "El vuelo 104 viene aproximándose para aterrizar." },
    future: { form: "flight (programado)", exampleEn: "The flight will take off tomorrow.", exampleEs: "El vuelo despegará mañana." },
  },
  turn: {
    translation: "girar / virar / turno",
    partOfSpeech: "Verbo / Sustantivo",
    phonetic: "/tɜːrn/",
    past: { form: "turned", exampleEn: "The aircraft turned left heading 270.", exampleEs: "La aeronave viró a la izquierda rumbo 270." },
    present: { form: "turn / turns", exampleEn: "Turn right heading 090 degrees.", exampleEs: "Vire a la derecha con rumbo 090 grados." },
    future: { form: "will turn", exampleEn: "The aircraft will turn at waypoint Alpha.", exampleEs: "La aeronave virará en el punto Alfa." },
  },
  climb: {
    translation: "ascender / subir de altitud",
    partOfSpeech: "Verbo regular",
    phonetic: "/klaɪm/",
    past: { form: "climbed", exampleEn: "The jet climbed to 20,000 feet.", exampleEs: "El avión ascendió a 20.000 pies." },
    present: { form: "climb / climbs", exampleEn: "Climb and maintain flight level 140.", exampleEs: "Ascienda y mantenga nivel de vuelo 140." },
    future: { form: "will climb", exampleEn: "We will climb after passing the storm.", exampleEs: "Ascenderemos tras pasar la tormenta." },
  },
  descend: {
    translation: "descender / bajar de altitud",
    partOfSpeech: "Verbo regular",
    phonetic: "/dɪˈsɛnd/",
    past: { form: "descended", exampleEn: "The transport descended safely.", exampleEs: "El transporte descendió de forma segura." },
    present: { form: "descend / descends", exampleEn: "Descend to three thousand feet.", exampleEs: "Descienda a tres mil pies." },
    future: { form: "will descend", exampleEn: "The pilot will descend upon clearance.", exampleEs: "El piloto descenderá al recibir autorización." },
  },
  heading: {
    translation: "rumbo / dirección magnética",
    partOfSpeech: "Sustantivo aeronáutico",
    phonetic: "/ˈhɛdɪŋ/",
    past: { form: "held heading", exampleEn: "The pilot held heading 180 yesterday.", exampleEs: "El piloto mantuvo el rumbo 180 ayer." },
    present: { form: "heading", exampleEn: "Maintain current heading 270 degrees.", exampleEs: "Mantenga el rumbo actual de 270 grados." },
    future: { form: "will assign heading", exampleEn: "Radar will assign a new heading.", exampleEs: "El radar asignará un nuevo rumbo." },
  },
  altitude: {
    translation: "altitud / altura de vuelo",
    partOfSpeech: "Sustantivo",
    phonetic: "/ˈæltɪtjuːd/",
    past: { form: "altitude maintained", exampleEn: "The jet maintained altitude at 15,000 ft.", exampleEs: "El avión mantuvo la altitud a 15.000 pies." },
    present: { form: "altitude", exampleEn: "Current altitude is ten thousand feet.", exampleEs: "La altitud actual es de diez mil pies." },
    future: { form: "will reach altitude", exampleEn: "The plane will reach cruise altitude soon.", exampleEs: "El avión alcanzará pronto la altitud de crucero." },
  },
  weather: {
    translation: "clima / condiciones meteorológicas",
    partOfSpeech: "Sustantivo",
    phonetic: "/ˈwɛðər/",
    past: { form: "weather was", exampleEn: "The weather was stormy last night.", exampleEs: "El clima estuvo tormentoso anoche." },
    present: { form: "weather is", exampleEn: "The morning weather indicates light haze.", exampleEs: "El clima matutino indica neblina ligera." },
    future: { form: "weather will be", exampleEn: "The weather will clear up by noon.", exampleEs: "El clima se despejará hacia el mediodía." },
  },
  briefing: {
    translation: "sesión informativa / reporte previo",
    partOfSpeech: "Sustantivo militar",
    phonetic: "/ˈbriːfɪŋ/",
    past: { form: "briefed / briefing was held", exampleEn: "The commander gave the briefing at 0600.", exampleEs: "El comandante dio la sesión a las 0600." },
    present: { form: "briefing", exampleEn: "All officers attend the weather briefing.", exampleEs: "Todos los oficiales asisten al reporte meteorológico." },
    future: { form: "will conduct briefing", exampleEn: "They will attend the pre-flight briefing.", exampleEs: "Ellos asistirán a la sesión previa al vuelo." },
  },
  indicates: {
    translation: "indica / señala",
    partOfSpeech: "Verbo (3ra persona)",
    phonetic: "/ˈɪndɪkeɪts/",
    past: { form: "indicated", exampleEn: "The radar indicated incoming traffic.", exampleEs: "El radar indicó tráfico aproximándose." },
    present: { form: "indicates", exampleEn: "The gauge indicates optimal oil pressure.", exampleEs: "El medidor indica presión óptima de aceite." },
    future: { form: "will indicate", exampleEn: "The beacon will indicate runway alignment.", exampleEs: "La baliza indicará la alineación con la pista." },
  },
  indicate: {
    translation: "indicar / señalar",
    partOfSpeech: "Verbo regular",
    phonetic: "/ˈɪndɪkeɪt/",
    past: { form: "indicated", exampleEn: "Instruments indicated low fuel.", exampleEs: "Los instrumentos indicaron combustible bajo." },
    present: { form: "indicate / indicates", exampleEn: "Flashing lights indicate an alert.", exampleEs: "Las luces parpadeantes indican una alerta." },
    future: { form: "will indicate", exampleEn: "The display will indicate the route.", exampleEs: "La pantalla indicará la ruta." },
  },
  delayed: {
    translation: "retrasado / demorado",
    partOfSpeech: "Adjetivo / Verbo (Pasado)",
    phonetic: "/dɪˈleɪd/",
    past: { form: "was delayed", exampleEn: "The convoy was delayed by 45 minutes.", exampleEs: "El convoy se retrasó por 45 minutos." },
    present: { form: "delays / is delayed", exampleEn: "Bad weather delays the mission.", exampleEs: "El mal tiempo demora la misión." },
    future: { form: "will be delayed", exampleEn: "The departure will be delayed if it rains.", exampleEs: "La salida será demorada si llueve." },
  },
  delay: {
    translation: "retraso / demorar",
    partOfSpeech: "Sustantivo / Verbo",
    phonetic: "/dɪˈleɪ/",
    past: { form: "delayed", exampleEn: "The storm delayed the flight.", exampleEs: "La tormenta retrasó el vuelo." },
    present: { form: "delay / delays", exampleEn: "Avoid any unnecessary delay.", exampleEs: "Evite cualquier retraso innecesario." },
    future: { form: "will delay", exampleEn: "Heavy traffic will delay the landing.", exampleEs: "El tráfico denso retrasará el aterrizaje." },
  },
  assemble: {
    translation: "reunirse / formar / ensamblar",
    partOfSpeech: "Verbo regular",
    phonetic: "/əˈsɛmbəl/",
    past: { form: "assembled", exampleEn: "Personnel assembled in Building 4.", exampleEs: "El personal se reunió en el Edificio 4." },
    present: { form: "assemble / assembles", exampleEn: "Soldiers assemble for morning roll call.", exampleEs: "Los soldados forman para el pase de lista matutino." },
    future: { form: "will assemble", exampleEn: "The squad will assemble at the hangar.", exampleEs: "La escuadra se reunirá en el hangar." },
  },
  personnel: {
    translation: "personal / dotación militar",
    partOfSpeech: "Sustantivo colectivo",
    phonetic: "/ˌpɜːrsəˈnɛl/",
    past: { form: "personnel served", exampleEn: "All personnel reported on duty.", exampleEs: "Todo el personal se presentó a su guardia." },
    present: { form: "personnel is/are", exampleEn: "Technical personnel inspect the gear.", exampleEs: "El personal técnico inspecciona el equipo." },
    future: { form: "personnel will arrive", exampleEn: "New personnel will arrive next week.", exampleEs: "Nuevo personal llegará la próxima semana." },
  },
  building: {
    translation: "edificio / instalación",
    partOfSpeech: "Sustantivo",
    phonetic: "/ˈbɪldɪŋ/",
    past: { form: "built / was located in building", exampleEn: "They met at Building 10.", exampleEs: "Se reunieron en el Edificio 10." },
    present: { form: "building", exampleEn: "The command center is in this building.", exampleEs: "El centro de mando está en este edificio." },
    future: { form: "will construct building", exampleEn: "Engineers will inspect the building.", exampleEs: "Los ingenieros inspeccionarán el edificio." },
  },
  report: {
    translation: "presentarse / informar / reporte",
    partOfSpeech: "Verbo / Sustantivo",
    phonetic: "/rɪˈpɔːrt/",
    past: { form: "reported", exampleEn: "The airman reported to the officer.", exampleEs: "El aviador se presentó ante el oficial." },
    present: { form: "report / reports", exampleEn: "Report to the flight line immediately.", exampleEs: "Preséntese en la línea de vuelo de inmediato." },
    future: { form: "will report", exampleEn: "You will report at 0700 hours.", exampleEs: "Usted se presentará a las 0700 horas." },
  },
  maintenance: {
    translation: "mantenimiento / revisión técnica",
    partOfSpeech: "Sustantivo",
    phonetic: "/ˈmeɪntənəns/",
    past: { form: "underwent maintenance", exampleEn: "The bridge underwent maintenance.", exampleEs: "El puente fue sometido a mantenimiento." },
    present: { form: "maintenance is required", exampleEn: "Routine maintenance is required.", exampleEs: "Se requiere mantenimiento rutinario." },
    future: { form: "will perform maintenance", exampleEn: "Crews will perform maintenance tonight.", exampleEs: "Las cuadrillas harán mantenimiento esta noche." },
  },
  fuel: {
    translation: "combustible / carburante",
    partOfSpeech: "Sustantivo",
    phonetic: "/ˈfjuːəl/",
    past: { form: "fueled / had fuel", exampleEn: "The tankers had fuel bladders.", exampleEs: "Los camiones cisterna tenían bolsas de combustible." },
    present: { form: "fuel level", exampleEn: "Check the fuel indicators before taxi.", exampleEs: "Revise los indicadores de combustible antes de rodar." },
    future: { form: "will refuel", exampleEn: "The aircraft will refuel at base.", exampleEs: "La aeronave reabastecerá combustible en la base." },
  },
  runway: {
    translation: "pista de aterrizaje / despegue",
    partOfSpeech: "Sustantivo",
    phonetic: "/ˈrʌnweɪ/",
    past: { form: "runway was closed", exampleEn: "Runway 09 was closed for cleaning.", exampleEs: "La pista 09 estuvo cerrada para limpieza." },
    present: { form: "runway is active", exampleEn: "Runway 27 is active for landings.", exampleEs: "La pista 27 está activa para aterrizajes." },
    future: { form: "will clear runway", exampleEn: "Crews will clear the runway soon.", exampleEs: "El personal despejará la pista pronto." },
  },
  officer: {
    translation: "oficial (militar)",
    partOfSpeech: "Sustantivo",
    phonetic: "/ˈɒfɪsər/",
    past: { form: "officer commanded", exampleEn: "The officer approved the flight plan.", exampleEs: "El oficial aprobó el plan de vuelo." },
    present: { form: "officer", exampleEn: "The commanding officer inspects the squad.", exampleEs: "El oficial al mando inspecciona la escuadra." },
    future: { form: "will promote officer", exampleEn: "The officer will receive new orders.", exampleEs: "El oficial recibirá nuevas órdenes." },
  },
  check: {
    translation: "verificar / revisar / chequeo",
    partOfSpeech: "Verbo / Sustantivo",
    phonetic: "/tʃɛk/",
    past: { form: "checked", exampleEn: "The crew checked all instruments.", exampleEs: "La tripulación verificó todos los instrumentos." },
    present: { form: "check / checks", exampleEn: "Always check the pre-flight checklist.", exampleEs: "Siempre revise la lista de verificación previa al vuelo." },
    future: { form: "will check", exampleEn: "The sergeant will check your gear.", exampleEs: "El sargento revisará tu equipamiento." },
  },
  must: {
    translation: "debe / tiene que (obligación)",
    partOfSpeech: "Verbo modal",
    phonetic: "/mʌst/",
    past: { form: "had to", exampleEn: "Personnel had to evacuate.", exampleEs: "El personal tuvo que evacuar." },
    present: { form: "must", exampleEn: "All aviators must wear helmets.", exampleEs: "Todos los aviadores deben usar cascos." },
    future: { form: "will have to", exampleEn: "They will have to complete the exam.", exampleEs: "Tendrán que completar la evaluación." },
  },
  should: {
    translation: "debería (recomendación/deber)",
    partOfSpeech: "Verbo modal",
    phonetic: "/ʃʊd/",
    past: { form: "should have", exampleEn: "He should have verified the frequency.", exampleEs: "Él debió haber verificado la frecuencia." },
    present: { form: "should", exampleEn: "You should study ALCPT daily.", exampleEs: "Deberías estudiar ALCPT a diario." },
    future: { form: "should", exampleEn: "The package should arrive tomorrow.", exampleEs: "El paquete debería llegar mañana." },
  },
  can: {
    translation: "poder / ser capaz de",
    partOfSpeech: "Verbo modal",
    phonetic: "/kæn/",
    past: { form: "could", exampleEn: "The pilot could not see in the fog.", exampleEs: "El piloto no pudo ver en la niebla." },
    present: { form: "can", exampleEn: "Radar can detect aircraft at 100 miles.", exampleEs: "El radar puede detectar aviones a 100 millas." },
    future: { form: "will be able to", exampleEn: "You will be able to speak fluent English.", exampleEs: "Podrás hablar inglés fluido." },
  },
  have: {
    translation: "tener / haber",
    partOfSpeech: "Verbo irregular",
    phonetic: "/hæv/",
    past: { form: "had", exampleEn: "The aircraft had sufficient fuel.", exampleEs: "La aeronave tuvo combustible suficiente." },
    present: { form: "have / has", exampleEn: "We have clearance for takeoff.", exampleEs: "Tenemos autorización para el despegue." },
    future: { form: "will have", exampleEn: "You will have full control.", exampleEs: "Tendrás el control total." },
  },
  take: {
    translation: "tomar / llevar / realizar",
    partOfSpeech: "Verbo irregular",
    phonetic: "/teɪk/",
    past: { form: "took", exampleEn: "The plane took off on time.", exampleEs: "El avión despegó a tiempo." },
    present: { form: "take / takes", exampleEn: "Take your seats immediately.", exampleEs: "Tomen sus asientos de inmediato." },
    future: { form: "will take", exampleEn: "The flight will take two hours.", exampleEs: "El vuelo tomará dos horas." },
  },
  make: {
    translation: "hacer / fabricar / provocar",
    partOfSpeech: "Verbo irregular",
    phonetic: "/meɪk/",
    past: { form: "made", exampleEn: "The pilot made a smooth landing.", exampleEs: "El piloto hizo un aterrizaje suave." },
    present: { form: "make / makes", exampleEn: "Technicians make regular adjustments.", exampleEs: "Los técnicos hacen ajustes regulares." },
    future: { form: "will make", exampleEn: "We will make an announcement.", exampleEs: "Haremos un anuncio." },
  },
  see: {
    translation: "ver / observar",
    partOfSpeech: "Verbo irregular",
    phonetic: "/siː/",
    past: { form: "saw", exampleEn: "The tower saw the landing lights.", exampleEs: "La torre vio las luces de aterrizaje." },
    present: { form: "see / sees", exampleEn: "I see the horizon clearly.", exampleEs: "Veo el horizonte claramente." },
    future: { form: "will see", exampleEn: "You will see the runway in 2 miles.", exampleEs: "Verás la pista en 2 millas." },
  },
  say: {
    translation: "decir",
    partOfSpeech: "Verbo irregular",
    phonetic: "/seɪ/",
    past: { form: "said", exampleEn: "The controller said to hold position.", exampleEs: "El controlador dijo que mantuviéramos posición." },
    present: { form: "say / says", exampleEn: "What does the instructor say?", exampleEs: "¿Qué dice el instructor?" },
    future: { form: "will say", exampleEn: "He will say the final score.", exampleEs: "Él dirá la puntuación final." },
  },
  know: {
    translation: "saber / conocer",
    partOfSpeech: "Verbo irregular",
    phonetic: "/noʊ/",
    past: { form: "knew", exampleEn: "The navigator knew the coordinates.", exampleEs: "El navegante conocía las coordenadas." },
    present: { form: "know / knows", exampleEn: "They know emergency procedures.", exampleEs: "Ellos conocen los procedimientos de emergencia." },
    future: { form: "will know", exampleEn: "We will know the results shortly.", exampleEs: "Sabremos los resultados en breve." },
  },
  leave: {
    translation: "partir / salir / dejar",
    partOfSpeech: "Verbo irregular",
    phonetic: "/liːv/",
    past: { form: "left", exampleEn: "The helicopter left at 0600.", exampleEs: "El helicóptero partió a las 0600." },
    present: { form: "leave / leaves", exampleEn: "Convoys leave the base at noon.", exampleEs: "Los convoyes salen de la base al mediodía." },
    future: { form: "will leave", exampleEn: "The squad will leave upon command.", exampleEs: "La escuadra saldrá a la orden." },
  },
  hear: {
    translation: "oír / escuchar",
    partOfSpeech: "Verbo irregular",
    phonetic: "/hɪər/",
    past: { form: "heard", exampleEn: "The radio operator heard the SOS.", exampleEs: "El radio operador escuchó el SOS." },
    present: { form: "hear / hears", exampleEn: "Do you hear the transmission clearly?", exampleEs: "¿Escuchas la transmisión claramente?" },
    future: { form: "will hear", exampleEn: "You will hear the siren sound.", exampleEs: "Escucharás sonar la sirena." },
  },
  listen: {
    translation: "escuchar (atentamente)",
    partOfSpeech: "Verbo regular",
    phonetic: "/ˈlɪsən/",
    past: { form: "listened", exampleEn: "The cadets listened to the briefing.", exampleEs: "Los aviadores escucharon la sesión." },
    present: { form: "listen / listens", exampleEn: "Listen carefully to the radio audio.", exampleEs: "Escucha atentamente el audio de la radio." },
    future: { form: "will listen", exampleEn: "We will listen to the ATC recording.", exampleEs: "Escucharemos la grabación del ATC." },
  },
  speak: {
    translation: "hablar",
    partOfSpeech: "Verbo irregular",
    phonetic: "/spiːk/",
    past: { form: "spoke", exampleEn: "The general spoke with confidence.", exampleEs: "El general habló con confianza." },
    present: { form: "speak / speaks", exampleEn: "Pilots speak aviation English globally.", exampleEs: "Los pilotos hablan inglés aeronáutico globalmente." },
    future: { form: "will speak", exampleEn: "The colonel will speak at assembly.", exampleEs: "El coronel hablará en la asamblea." },
  },
  read: {
    translation: "leer",
    partOfSpeech: "Verbo irregular",
    phonetic: "/riːd/ (pasado: /rɛd/)",
    past: { form: "read", exampleEn: "She read the technical manual.", exampleEs: "Ella leyó el manual técnico." },
    present: { form: "read / reads", exampleEn: "Aviators read weather charts.", exampleEs: "Los aviadores leen cartas de tiempo." },
    future: { form: "will read", exampleEn: "You will read the next 40 items.", exampleEs: "Leerás los próximos 40 reactivos." },
  },
  write: {
    translation: "escribir / redactar",
    partOfSpeech: "Verbo irregular",
    phonetic: "/raɪt/",
    past: { form: "wrote", exampleEn: "The sergeant wrote the incident report.", exampleEs: "El sargento escribió el reporte de incidentes." },
    present: { form: "write / writes", exampleEn: "Inspectors write maintenance logs.", exampleEs: "Los inspectores escriben bitácoras de mantenimiento." },
    future: { form: "will write", exampleEn: "The doctor will write a medical waiver.", exampleEs: "El médico redactará una exención médica." },
  },
  what: {
    translation: "¿qué? / ¿cuál?",
    partOfSpeech: "Pronombre interrogativo",
    phonetic: "/wɒt/",
    past: { form: "what was", exampleEn: "What was the reported heading?", exampleEs: "¿Cuál fue el rumbo reportado?" },
    present: { form: "what is", exampleEn: "What is your current altitude?", exampleEs: "¿Cuál es su altitud actual?" },
    future: { form: "what will be", exampleEn: "What will be the mission objective?", exampleEs: "¿Cuál será el objetivo de la misión?" },
  },
  where: {
    translation: "¿dónde? / ¿hacia dónde?",
    partOfSpeech: "Adverbio interrogativo",
    phonetic: "/wɛər/",
    past: { form: "where did / were", exampleEn: "Where did the convoy stop?", exampleEs: "¿Dónde se detuvo el convoy?" },
    present: { form: "where is/are", exampleEn: "Where is the emergency exit?", exampleEs: "¿Dónde está la salida de emergencia?" },
    future: { form: "where will", exampleEn: "Where will the unit deploy?", exampleEs: "¿Dónde se desplegará la unidad?" },
  },
  when: {
    translation: "¿cuándo?",
    partOfSpeech: "Adverbio interrogativo",
    phonetic: "/wɛn/",
    past: { form: "when did", exampleEn: "When did the alert sound?", exampleEs: "¿Cuándo sonó la alerta?" },
    present: { form: "when is", exampleEn: "When is the next inspection?", exampleEs: "¿Cuándo es la próxima inspección?" },
    future: { form: "when will", exampleEn: "When will the storm arrive?", exampleEs: "¿Cuándo llegará la tormenta?" },
  },
  why: {
    translation: "¿por qué?",
    partOfSpeech: "Adverbio interrogativo",
    phonetic: "/waɪ/",
    past: { form: "why was", exampleEn: "Why was the mission aborted?", exampleEs: "¿Por qué fue abortada la misión?" },
    present: { form: "why is", exampleEn: "Why is the engine light flashing?", exampleEs: "¿Por qué está parpadeando la luz de motor?" },
    future: { form: "why will", exampleEn: "Why will they change routes?", exampleEs: "¿Por qué cambiarán de ruta?" },
  },
  who: {
    translation: "¿quién?",
    partOfSpeech: "Pronombre interrogativo",
    phonetic: "/huː/",
    past: { form: "who authorized", exampleEn: "Who authorized the takeoff?", exampleEs: "¿Quién autorizó el despegue?" },
    present: { form: "who is", exampleEn: "Who is the officer in charge?", exampleEs: "¿Quién es el oficial a cargo?" },
    future: { form: "who will", exampleEn: "Who will command the flight?", exampleEs: "¿Quién comandará el vuelo?" },
  },
  which: {
    translation: "¿cuál? / ¿cuáles?",
    partOfSpeech: "Pronombre interrogativo",
    phonetic: "/wɪtʃ/",
    past: { form: "which failed", exampleEn: "Which component failed yesterday?", exampleEs: "¿Cuál componente falló ayer?" },
    present: { form: "which is", exampleEn: "Which option is correct?", exampleEs: "¿Cuál opción es correcta?" },
    future: { form: "which will", exampleEn: "Which runway will open next?", exampleEs: "¿Cuál pista se abrirá a continuación?" },
  },
  how: {
    translation: "¿cómo? / ¿de qué manera?",
    partOfSpeech: "Adverbio interrogativo",
    phonetic: "/haʊ/",
    past: { form: "how was", exampleEn: "How was the fire extinguished?", exampleEs: "¿Cómo fue extinguido el incendio?" },
    present: { form: "how do", exampleEn: "How do you calculate density altitude?", exampleEs: "¿Cómo calcula usted la densidad altitud?" },
    future: { form: "how will", exampleEn: "How will they respond to threats?", exampleEs: "¿Cómo responderán a las amenazas?" },
  },
};

// Verbos irregulares frecuentes y sus 3 formas
const IRREGULAR_VERBS: Record<string, { past: string; pp: string; es: string }> = {
  arise: { past: "arose", pp: "arisen", es: "surgir" },
  awake: { past: "awoke", pp: "awoken", es: "despertar" },
  bear: { past: "bore", pp: "borne", es: "soportar" },
  beat: { past: "beat", pp: "beaten", es: "golpear" },
  become: { past: "became", pp: "become", es: "convertirse" },
  begin: { past: "began", pp: "begun", es: "empezar" },
  bend: { past: "bent", pp: "bent", es: "doblar" },
  bind: { past: "bound", pp: "bound", es: "unir" },
  bite: { past: "bit", pp: "bitten", es: "morder" },
  bleed: { past: "bled", pp: "bled", es: "sangrar" },
  blow: { past: "blew", pp: "blown", es: "soplar" },
  break: { past: "broke", pp: "broken", es: "romper" },
  bring: { past: "brought", pp: "brought", es: "traer" },
  build: { past: "built", pp: "built", es: "construir" },
  burn: { past: "burnt", pp: "burnt", es: "quemar" },
  buy: { past: "bought", pp: "bought", es: "comprar" },
  catch: { past: "caught", pp: "caught", es: "atrapar" },
  choose: { past: "chose", pp: "chosen", es: "elegir" },
  come: { past: "came", pp: "come", es: "venir" },
  cost: { past: "cost", pp: "cost", es: "costar" },
  cut: { past: "cut", pp: "cut", es: "cortar" },
  deal: { past: "dealt", pp: "dealt", es: "tratar" },
  dig: { past: "dug", pp: "dug", es: "cavar" },
  do: { past: "did", pp: "done", es: "hacer" },
  draw: { past: "drew", pp: "drawn", es: "dibujar" },
  drink: { past: "drank", pp: "drunk", es: "beber" },
  drive: { past: "drove", pp: "driven", es: "conducir" },
  eat: { past: "ate", pp: "eaten", es: "comer" },
  fall: { past: "fell", pp: "fallen", es: "caer" },
  feed: { past: "fed", pp: "fed", es: "alimentar" },
  feel: { past: "felt", pp: "felt", es: "sentir" },
  fight: { past: "fought", pp: "fought", es: "luchar" },
  find: { past: "found", pp: "found", es: "encontrar" },
  flee: { past: "fled", pp: "fled", es: "huir" },
  fly: { past: "flew", pp: "flown", es: "volar" },
  forbid: { past: "forbade", pp: "forbidden", es: "prohibir" },
  forget: { past: "forgot", pp: "forgotten", es: "olvidar" },
  forgive: { past: "forgave", pp: "forgiven", es: "perdonar" },
  freeze: { past: "froze", pp: "frozen", es: "congelar" },
  get: { past: "got", pp: "gotten", es: "obtener" },
  give: { past: "gave", pp: "given", es: "dar" },
  go: { past: "went", pp: "gone", es: "ir" },
  grow: { past: "grew", pp: "grown", es: "crecer" },
  hang: { past: "hung", pp: "hung", es: "colgar" },
  have: { past: "had", pp: "had", es: "tener" },
  hear: { past: "heard", pp: "heard", es: "oír" },
  hide: { past: "hid", pp: "hidden", es: "esconder" },
  hit: { past: "hit", pp: "hit", es: "golpear" },
  hold: { past: "held", pp: "held", es: "sostener" },
  hurt: { past: "hurt", pp: "hurt", es: "lastimar" },
  keep: { past: "kept", pp: "kept", es: "mantener" },
  know: { past: "knew", pp: "known", es: "saber" },
  lay: { past: "laid", pp: "laid", es: "poner" },
  lead: { past: "led", pp: "led", es: "liderar" },
  leave: { past: "left", pp: "left", es: "dejar" },
  lend: { past: "lent", pp: "lent", es: "prestar" },
  let: { past: "let", pp: "let", es: "permitir" },
  lose: { past: "lost", pp: "lost", es: "perder" },
  make: { past: "made", pp: "made", es: "hacer" },
  mean: { past: "meant", pp: "meant", es: "significar" },
  meet: { past: "met", pp: "met", es: "conocer" },
  pay: { past: "paid", pp: "paid", es: "pagar" },
  put: { past: "put", pp: "put", es: "poner" },
  read: { past: "read", pp: "read", es: "leer" },
  ride: { past: "rode", pp: "ridden", es: "montar" },
  ring: { past: "rang", pp: "rung", es: "sonar" },
  rise: { past: "rose", pp: "risen", es: "subir" },
  run: { past: "ran", pp: "run", es: "correr" },
  say: { past: "said", pp: "said", es: "decir" },
  see: { past: "saw", pp: "seen", es: "ver" },
  sell: { past: "sold", pp: "sold", es: "vender" },
  send: { past: "sent", pp: "sent", es: "enviar" },
  set: { past: "set", pp: "set", es: "establecer" },
  shake: { past: "shook", pp: "shaken", es: "sacudir" },
  shoot: { past: "shot", pp: "shot", es: "disparar" },
  show: { past: "showed", pp: "shown", es: "mostrar" },
  shut: { past: "shut", pp: "shut", es: "cerrar" },
  sing: { past: "sang", pp: "sung", es: "cantar" },
  sink: { past: "sank", pp: "sunk", es: "hundir" },
  sit: { past: "sat", pp: "sat", es: "sentarse" },
  sleep: { past: "slept", pp: "slept", es: "dormir" },
  speak: { past: "spoke", pp: "spoken", es: "hablar" },
  spend: { past: "spent", pp: "spent", es: "gastar" },
  stand: { past: "stood", pp: "stood", es: "estar de pie" },
  steal: { past: "stole", pp: "stolen", es: "robar" },
  stick: { past: "stuck", pp: "stuck", es: "pegar" },
  strike: { past: "struck", pp: "struck", es: "golpear" },
  swim: { past: "swam", pp: "swum", es: "nadar" },
  take: { past: "took", pp: "taken", es: "tomar" },
  teach: { past: "taught", pp: "taught", es: "enseñar" },
  tell: { past: "told", pp: "told", es: "decir" },
  think: { past: "thought", pp: "thought", es: "pensar" },
  throw: { past: "threw", pp: "thrown", es: "lanzar" },
  understand: { past: "understood", pp: "understood", es: "entender" },
  wear: { past: "wore", pp: "worn", es: "vestir" },
  win: { past: "won", pp: "won", es: "ganar" },
  write: { past: "wrote", pp: "written", es: "escribir" },
};

// Traducciones directas de vocabulario frecuente
const VOCABULARY_TRANSLATIONS: Record<string, string> = {
  the: "el / la / los / las",
  a: "un / una",
  an: "un / una",
  and: "y",
  or: "o",
  but: "pero",
  in: "en / dentro de",
  on: "sobre / en",
  at: "en (lugar/hora específica)",
  to: "a / hacia / para",
  from: "desde / de",
  for: "para / por / durante",
  with: "con",
  without: "sin",
  by: "por / cerca de",
  about: "acerca de / alrededor de",
  after: "después de",
  before: "antes de",
  during: "durante",
  through: "a través de",
  above: "por encima de",
  below: "por debajo de",
  under: "debajo de",
  over: "sobre / por encima",
  between: "entre (dos)",
  among: "entre (varios)",
  around: "alrededor de",
  across: "al otro lado de",
  into: "hacia el interior de",
  out: "fuera",
  off: "apagado / fuera de",
  up: "arriba / hacia arriba",
  down: "abajo / hacia abajo",
  near: "cerca de",
  far: "lejos",
  next: "siguiente / próximo",
  then: "luego / entonces",
  now: "ahora",
  soon: "pronto",
  today: "hoy",
  yesterday: "ayer",
  tomorrow: "mañana",
  tonight: "esta noche",
  always: "siempre",
  never: "nunca",
  often: "frecuentemente",
  sometimes: "a veces",
  seldom: "rara vez",
  rarely: "raramente",
  usually: "usualmente",
  fast: "rápido",
  slow: "lento",
  high: "alto",
  low: "bajo",
  good: "bueno",
  bad: "malo",
  safe: "seguro",
  dangerous: "peligroso",
  clear: "despejado / claro",
  foggy: "con niebla",
  hazy: "con neblina / bruma",
  cloudy: "nublado",
  rainy: "lluvioso",
  windy: "ventoso",
  stormy: "tormentoso",
  cold: "frío",
  hot: "caliente",
  warm: "cálido",
  cool: "fresco",
  mile: "milla (terrestre o náutica)",
  miles: "millas",
  knot: "nudo (milla náutica/h)",
  knots: "nudos",
  foot: "pie (0.3048 m)",
  feet: "pies de altitud",
  ceiling: "techo de nubes",
  visibility: "visibilidad",
  radar: "radar de detección",
  radio: "radio de comunicaciones",
  tower: "torre de control",
  base: "base aérea o militar",
  hangar: "hangar de aeronaves",
  cockpit: "cabina de mando",
  engine: "motor / turbina",
  gear: "tren de aterrizaje / equipo",
  wing: "ala de aeronave",
  tail: "cola / empenaje",
  pilot: "piloto / aviador",
  copilot: "copiloto",
  commander: "comandante",
  sergeant: "sargento",
  captain: "capitán",
  major: "mayor",
  colonel: "coronel",
  general: "general",
  soldier: "soldado",
  airman: "aviador militar",
  squadron: "escuadrón táctico",
  mission: "misión militar",
  target: "blanco / objetivo",
  route: "ruta de vuelo",
  speed: "velocidad",
  heading: "rumbo magnético",
  altitude: "altitud",
  clearance: "autorización de vuelo",
  instructions: "instrucciones",
  orders: "órdenes militares",
  warning: "advertencia / aviso",
  caution: "precaución",
  danger: "peligro",
  emergency: "emergencia",
  accident: "accidente",
  fire: "fuego / incendio",
  delay: "retraso",
  hour: "hora",
  hours: "horas",
  minute: "minuto",
  minutes: "minutos",
  morning: "mañana (parte del día)",
  afternoon: "tarde",
  evening: "noche (temprana)",
  night: "noche",
  noon: "mediodía",
  midnight: "medianoche",
  dawn: "amanecer",
  dusk: "atardecer",
  north: "norte",
  south: "sur",
  east: "este",
  west: "oeste",
  left: "izquierda",
  right: "derecha",
  straight: "recto / derecho",
  first: "primero",
  second: "segundo",
  third: "tercero",
  correct: "correcto / exacto",
  incorrect: "incorrecto",
  true: "verdadero",
  false: "falso",
  question: "pregunta / reactivo",
  answer: "respuesta",
  item: "reactivo / ítem",
  formula: "fórmula oficial",
  score: "puntaje / calificación",
  rank: "rango / grado militar",
};

// Limpieza de caracteres de puntuación
export function sanitizeWord(raw: string): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .replace(/[.,!?"'`:;()[\]{}<>\/\\~*#+—–-]/g, "")
    .trim();
}

// Analizador morfológico algorítmico y generador de tiempos
export function getWordGrammarInfo(rawWord: string): WordGrammarInfo {
  const clean = sanitizeWord(rawWord);
  if (!clean) {
    return {
      word: rawWord,
      cleanWord: "",
      translation: rawWord,
      partOfSpeech: "Término",
      past: { form: rawWord, exampleEn: `In the past, ${rawWord} was noted.`, exampleEs: `En el pasado, se anotó ${rawWord}.` },
      present: { form: rawWord, exampleEn: `At present, ${rawWord} is active.`, exampleEs: `En el presente, ${rawWord} está activo.` },
      future: { form: rawWord, exampleEn: `In the future, ${rawWord} will apply.`, exampleEs: `En el futuro, aplicará ${rawWord}.` },
    };
  }

  // 1. Chequeo en diccionario curado exacto
  if (DICTIONARY[clean]) {
    const entry = DICTIONARY[clean];
    return {
      word: rawWord,
      cleanWord: clean,
      ...entry,
    };
  }

  // 2. Chequeo de verbos irregulares
  if (IRREGULAR_VERBS[clean]) {
    const irr = IRREGULAR_VERBS[clean];
    const trans = irr.es;
    return {
      word: rawWord,
      cleanWord: clean,
      translation: trans,
      partOfSpeech: "Verbo irregular",
      past: {
        form: irr.past,
        exampleEn: `The crew ${irr.past} the operational checklist yesterday.`,
        exampleEs: `La tripulación completó (${irr.past} - ${trans}) la lista ayer.`,
      },
      present: {
        form: `${clean} / ${clean}s`,
        exampleEn: `Aviators ${clean} their equipment regularly.`,
        exampleEs: `Los aviadores practican (${clean} - ${trans}) con su equipo regularmente.`,
      },
      future: {
        form: `will ${clean}`,
        exampleEn: `The team will ${clean} the assigned objectives tomorrow.`,
        exampleEs: `El equipo procederá a (${trans}) los objetivos asignados mañana.`,
      },
    };
  }

  // Buscar si la palabra es el pasado de un verbo irregular
  for (const [baseVerb, irr] of Object.entries(IRREGULAR_VERBS)) {
    if (clean === irr.past || clean === irr.pp) {
      const trans = irr.es;
      return {
        word: rawWord,
        cleanWord: clean,
        translation: `${trans} (Forma en pasado de ${baseVerb})`,
        partOfSpeech: "Verbo (Pasado)",
        past: {
          form: irr.past,
          exampleEn: `Yesterday, they ${irr.past} according to orders.`,
          exampleEs: `Ayer, ellos procedieron con (${irr.past}) según las órdenes.`,
        },
        present: {
          form: `${baseVerb} / ${baseVerb}s`,
          exampleEn: `Today, pilots ${baseVerb} under standard protocol.`,
          exampleEs: `Hoy, los pilotos aplican (${baseVerb}) bajo el protocolo estándar.`,
        },
        future: {
          form: `will ${baseVerb}`,
          exampleEn: `Tomorrow, we will ${baseVerb} to complete the test.`,
          exampleEs: `Mañana, procederemos a (${trans}) para completar la prueba.`,
        },
      };
    }
  }

  // 3. Traducción directa en vocabulario
  const directTrans = VOCABULARY_TRANSLATIONS[clean];

  // 4. Heurísticas morfológicas
  // Verbos terminados en -ed (pasado regular)
  if (clean.endsWith("ed") && clean.length > 3) {
    let base = clean.slice(0, -2);
    if (clean.endsWith("ied")) base = clean.slice(0, -3) + "y";
    else if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
      base = base.slice(0, -1);
    }
    const transGuess = directTrans || `acción de ${base} (pasado/participio)`;
    return {
      word: rawWord,
      cleanWord: clean,
      translation: transGuess,
      partOfSpeech: "Verbo / Adjetivo (-ed)",
      past: {
        form: clean,
        exampleEn: `The squadron ${clean} the area yesterday.`,
        exampleEs: `El escuadrón procedió en pasado (${clean}) ayer.`,
      },
      present: {
        form: `${base} / ${base}s`,
        exampleEn: `Personnel ${base} the instructions in daily operations.`,
        exampleEs: `El personal aplica (${base}) en las operaciones diarias.`,
      },
      future: {
        form: `will ${base}`,
        exampleEn: `The team will ${base} all coordinates tomorrow.`,
        exampleEs: `El equipo aplicará (${base}) a todas las coordenadas mañana.`,
      },
    };
  }

  // Verbos terminados en -ing (gerundio / continuo)
  if (clean.endsWith("ing") && clean.length > 4) {
    let base = clean.slice(0, -3);
    if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
      base = base.slice(0, -1);
    }
    return {
      word: rawWord,
      cleanWord: clean,
      translation: directTrans || `proceso continuo de ${base}`,
      partOfSpeech: "Verbo en progreso (-ing)",
      past: {
        form: `was/were ${clean}`,
        exampleEn: `The pilot was ${clean} when the signal arrived.`,
        exampleEs: `El piloto estaba en proceso (${clean}) cuando llegó la señal.`,
      },
      present: {
        form: `is/are ${clean} // ${base}`,
        exampleEn: `Currently, the aircraft is ${clean} toward target.`,
        exampleEs: `Actualmente, la aeronave está en curso (${clean}) al blanco.`,
      },
      future: {
        form: `will be ${clean}`,
        exampleEn: `The unit will be ${clean} during tomorrow's patrol.`,
        exampleEs: `La unidad estará en proceso (${clean}) en la patrulla de mañana.`,
      },
    };
  }

  // Adverbios en -ly
  if (clean.endsWith("ly") && clean.length > 3) {
    const root = clean.slice(0, -2);
    return {
      word: rawWord,
      cleanWord: clean,
      translation: directTrans || `de manera ${root} (-mente)`,
      partOfSpeech: "Adverbio de modo",
      past: {
        form: clean,
        exampleEn: `The system operated ${clean} during past trials.`,
        exampleEs: `El sistema operó de manera ${clean} en pruebas pasadas.`,
      },
      present: {
        form: clean,
        exampleEn: `Instruments function ${clean} in current conditions.`,
        exampleEs: `Los instrumentos funcionan de manera ${clean} actualmente.`,
      },
      future: {
        form: clean,
        exampleEn: `The procedure will execute ${clean} in future tests.`,
        exampleEs: `El procedimiento se ejecutará de manera ${clean} en futuras pruebas.`,
      },
    };
  }

  // Sustantivos / Palabras generales
  const generalTrans = directTrans || clean;
  return {
    word: rawWord,
    cleanWord: clean,
    translation: generalTrans,
    partOfSpeech: "Vocabulario táctico",
    past: {
      form: `en pasado (${clean})`,
      exampleEn: `In past evaluations, "${clean}" appeared in official items.`,
      exampleEs: `En evaluaciones pasadas, "${clean}" figuraba en reactivos oficiales.`,
    },
    present: {
      form: `en presente (${clean})`,
      exampleEn: `The current context uses "${clean}" for precise communication.`,
      exampleEs: `El contexto actual emplea "${clean}" para comunicación precisa.`,
    },
    future: {
      form: `en futuro (${clean})`,
      exampleEn: `You will see "${clean}" in upcoming advanced USAF exams.`,
      exampleEs: `Verás "${clean}" en futuros exámenes avanzados de la USAF.`,
    },
  };
}
