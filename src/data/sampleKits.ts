import { DidacticKit } from '../types/didactic';

export const SAMPLE_KITS: DidacticKit[] = [
  {
    id: 'sample-fotosintesis',
    sourceFileName: 'Guia_Transporte_Vegetal_y_Fotosintesis.pdf',
    sourceType: 'ejemplo',
    sourceTextContext:
      'Las plantas son organismos autótrofos que fabrican su propio alimento mediante la fotosíntesis en los cloroplastos. La raíz absorbe agua y sales minerales (savia bruta) que suben por el xilema gracias a la cohesión-tensión generada por la transpiración en los estomas. Los estomas están rodeados por células oclusivas que regulan la entrada de dióxido de carbono (CO2) y la salida de oxígeno y vapor de agua. En la fase luminosa (tilacoides), la clorofila capta luz solar, rompe moléculas de agua (fotólisis), libera O2 y produce ATP y NADPH. En la fase oscura o Ciclo de Calvin (estroma), la enzima RuBisCO fija el CO2 usando ATP y NADPH para sintetizar glucosa. Luego, la glucosa se convierte en sacarosa y viaja en dos direcciones por el floema (savia elaborada) hacia frutos, flores, tallos y raíces, donde se almacena como almidón. Además, las plantas realizan respiración celular en sus mitocondrias las 24 horas del día.',
    subjectTitle: 'Fotosíntesis y Transporte Vascular en Plantas',
    discipline: 'Biología',
    level: 'secundaria',
    focus: 'ambos',
    estimatedStudyMinutes: 25,
    executiveSummary:
      'Las plantas funcionan como fábricas solares autosuficientes: absorben agua y minerales por las raíces mediante el xilema, capturan luz solar y CO₂ en las hojas para producir glucosa y oxígeno, y distribuyen esa energía por todo el organismo gracias al floema.',
    bigIdea:
      'Una planta no come tierra: fabrica su propio alimento con luz, agua y aire, usando dos autopistas internas (xilema y floema).',
    stages: [
      {
        stageNumber: 1,
        title: 'Captación de Materia Prima',
        summary: 'Las raíces absorben agua y sales minerales del suelo mientras los estomas dejan entrar CO₂.',
        keyTakeaway: 'Sin agua ni CO₂ no hay materia prima para fabricar alimento.',
      },
      {
        stageNumber: 2,
        title: 'Transporte Ascendente (Xilema)',
        summary: 'El agua sube desde la raíz hasta las hojas impulsada por la transpiración foliar.',
        keyTakeaway: 'El xilema actúa como una tubería de una sola dirección hacia arriba.',
      },
      {
        stageNumber: 3,
        title: 'Fábrica Solar (Fase Luminosa y Calvin)',
        summary: 'La clorofila captura luz para romper agua y luego el ciclo de Calvin fabrica glucosa con el CO₂.',
        keyTakeaway: 'La luz genera energía química que luego arma los azúcares.',
      },
      {
        stageNumber: 4,
        title: 'Reparto y Reserva (Floema y Respiración)',
        summary: 'Los azúcares viajan hacia arriba y abajo para alimentar toda la planta y alimentar sus mitocondrias.',
        keyTakeaway: 'El floema reparte en dos direcciones y la planta también respira de día y de noche.',
      },
    ],
    concepts: [
      {
        id: 'c1',
        title: 'Absorción Radicular (Pelos Absorbentes)',
        shortLabel: 'Raíz y Agua',
        stage: 1,
        simpleExplanation:
          'Los pelos microscópicos de la raíz absorben agua por ósmosis y sales minerales del suelo para iniciar el circuito.',
        everydayAnalogy:
          'Son como miles de esponjas finísimas conectadas a la base de una bomba de agua.',
        documentExample:
          'Cuanto mayor es la superficie de pelos radiculares, más agua y nutrientes capta la planta sin gastar energía excesiva.',
        teachingTip:
          'Muestra una germinación en algodón con lupa para que vean la pelusa blanca de los pelos absorbentes.',
        commonMisconception:
          'Creer que las raíces absorben "tierra sólida" como comida; solo toman agua y minerales disueltos.',
        keyPoints: [
          'Aumentan el área de contacto con el suelo.',
          'El agua entra principalmente por ósmosis.',
          'Forman la mezcla inicial llamada savia bruta.',
        ],
        connectsTo: ['c3'],
      },
      {
        id: 'c2',
        title: 'Estomas y Células Oclusivas',
        shortLabel: 'Estomas',
        stage: 1,
        simpleExplanation:
          'Son poros microscópicos en el envés de las hojas que se abren para dejar entrar CO₂ y liberan vapor de agua y oxígeno.',
        everydayAnalogy:
          'Son ventanas inteligentes: se abren para ventilar y dejan entrar aire fresco, pero en sequía se cierran para no secarse.',
        documentExample:
          'En días muy secos, las células oclusivas pierden turgencia y cierran el estoma para conservar agua.',
        teachingTip:
          'Haz que los estudiantes junten sus dos palmas curvadas para simular cómo se abren y cierran las células oclusivas.',
        commonMisconception:
          'Pensar que las plantas respiran por toda la corteza o que los estomas solo sirven para botar agua.',
        keyPoints: [
          'Permiten la entrada de CO₂ atmosférico.',
          'Liberan el oxígeno producido y vapor de agua.',
          'Regulan el equilibrio entre hidratación y fotosíntesis.',
        ],
        connectsTo: ['c4', 'c5'],
      },
      {
        id: 'c3',
        title: 'Xilema (Savia Bruta)',
        shortLabel: 'Xilema',
        stage: 2,
        simpleExplanation:
          'Conductos rígidos de células muertas con lignina que suben agua y minerales desde la raíz hasta las hojas en un solo sentido.',
        everydayAnalogy:
          'Funciona igual que la tubería principal de un edificio que sube agua fría del sótano hasta el último piso.',
        documentExample:
          'La columna de agua se mantiene unida por cohesión entre moléculas y sube al ritmo de la evaporación superior.',
        teachingTip:
          'Pon un tallo de apio en agua con colorante azul: en unas horas se observan los puntos del xilema teñidos.',
        commonMisconception:
          'Creer que el tallo empuja el agua desde abajo como un corazón; la fuerza principal jala desde arriba.',
        keyPoints: [
          'Transporte estrictamente unidireccional (hacia arriba).',
          'Conduce agua y sales minerales (savia bruta).',
          'Sus paredes reforzadas con lignina dan soporte al tallo.',
        ],
        connectsTo: ['c5'],
      },
      {
        id: 'c4',
        title: 'Transpiración Foliar',
        shortLabel: 'Transpiración',
        stage: 2,
        simpleExplanation:
          'Es la evaporación de agua desde las hojas hacia el aire, la cual genera la succión continua que jala el agua por el xilema.',
        everydayAnalogy:
          'Funciona exactamente como succionar un refresco con popote: al salir agua arriba, sube más desde el fondo.',
        documentExample:
          'Un árbol grande puede transpirar cientos de litros de agua en un día soleado para mantener el flujo de minerales.',
        teachingTip:
          'Cubre una rama con una bolsa transparente al sol durante 20 minutos para que vean las gotitas de transpiración.',
        commonMisconception:
          'Ver la transpiración como un desperdicio; en realidad es el motor físico del ascenso de agua y refresca la hoja.',
        keyPoints: [
          'Crea tensión negativa que eleva la columna de agua.',
          'Evita el sobrecalentamiento de las hojas al sol.',
          'Depende de humedad, viento y temperatura.',
        ],
        connectsTo: ['c3'],
      },
      {
        id: 'c5',
        title: 'Cloroplasto y Fase Luminosa',
        shortLabel: 'Fase Luminosa',
        stage: 3,
        simpleExplanation:
          'En los tilacoides del cloroplasto, la clorofila atrapa la luz solar para romper moléculas de agua, liberar O₂ y cargar energía química (ATP).',
        everydayAnalogy:
          'Son paneles solares que cargan baterías portátiles (ATP y NADPH) mientras sueltan oxígeno como vapor limpio.',
        documentExample:
          'La fotólisis del agua ocurre exclusivamente cuando hay luz disponible sobre la clorofila.',
        teachingTip:
          'Dibuja una batería recargándose con el sol antes de mencionar las siglas ATP y NADPH.',
        commonMisconception:
          'Creer que el oxígeno liberado por la planta proviene del CO₂; en realidad proviene de romper la molécula de agua (H₂O).',
        keyPoints: [
          'Ocurre en las membranas de los tilacoides.',
          'Rompe agua y libera oxígeno (O₂) al aire.',
          'Carga energía temporal en ATP y NADPH.',
        ],
        connectsTo: ['c6'],
      },
      {
        id: 'c6',
        title: 'Ciclo de Calvin (Glucosa)',
        shortLabel: 'Ciclo de Calvin',
        stage: 3,
        simpleExplanation:
          'En el estroma del cloroplasto, la planta usa las baterías cargadas (ATP) para unir CO₂ y fabricar glucosa sin necesitar luz directa en ese paso.',
        everydayAnalogy:
          'Es la línea de ensamblaje que usa la electricidad ya guardada en la batería para construir bloques de azúcar.',
        documentExample:
          'La enzima RuBisCO captura el carbono del aire y da inicio al armado de azúcares de seis carbonos.',
        teachingTip:
          'Aclara por qué se le llamaba "fase oscura": no ocurre solo de noche, simplemente no requiere fotones directos si ya hay ATP.',
        commonMisconception:
          'Pensar que el Ciclo de Calvin solo pasa de noche; ocurre principalmente de día junto con la fase luminosa.',
        keyPoints: [
          'Fija el carbono del CO₂ del aire.',
          'Consume el ATP y NADPH de la fase luminosa.',
          'Produce glucosa, la base estructural y energética.',
        ],
        connectsTo: ['c7', 'c8'],
      },
      {
        id: 'c7',
        title: 'Floema (Savia Elaborada)',
        shortLabel: 'Floema',
        stage: 4,
        simpleExplanation:
          'Son tubos vivos que reparten sacarosa y nutrientes desde las hojas hacia flores, frutos, tallos y raíces en ambas direcciones.',
        everydayAnalogy:
          'Es el servicio de reparto de comida a domicilio: entrega arriba (flores/frutos) y también en el sótano (raíces).',
        documentExample:
          'En primavera, las reservas de la raíz pueden incluso subir por el floema para alimentar los brotes nuevos.',
        teachingTip:
          'Regla nemotécnica: "Floema = Flujo de Food (comida) en doble vía; Xilema = eXtra agua hacia arriba".',
        commonMisconception:
          'Creer que el floema solo baja; viaja desde cualquier "fuente" hacia cualquier "sumidero" que necesite energía.',
        keyPoints: [
          'Transporte bidireccional según demanda.',
          'Formado por células vivas (tubos cribosos).',
          'Distribuye azúcares hacia órganos de crecimiento y reserva.',
        ],
        connectsTo: ['c8'],
      },
      {
        id: 'c8',
        title: 'Almacenamiento y Respiración Celular',
        shortLabel: 'Reserva y Respiración',
        stage: 4,
        simpleExplanation:
          'La planta guarda glucosa sobrante como almidón (en papas o semillas) y quema glucosa en sus mitocondrias las 24 horas para vivir.',
        everydayAnalogy:
          'Guardar dinero en el banco (almidón) y gastarlo poco a poco todo el día y la noche para mantener encendidas las luces.',
        documentExample:
          'Incluso de noche, las raíces y hojas consumen oxígeno en sus mitocondrias para obtener energía de la glucosa.',
        teachingTip:
          'Conecta este punto con la dieta humana: comemos almidón de papa o maíz porque la planta lo guardó ahí.',
        commonMisconception:
          'Pensar que las plantas no respiran o que solo respiran de noche.',
        keyPoints: [
          'El almidón es la reserva energética a largo plazo.',
          'Las mitocondrias respiran día y noche.',
          'De día la fotosíntesis supera por mucho a la respiración.',
        ],
        connectsTo: [],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: '¿Cuál es la diferencia principal en el sentido de transporte entre xilema y floema?',
        options: [
          'El xilema solo sube agua y minerales; el floema reparte azúcares en dos direcciones.',
          'El floema solo sube agua; el xilema baja oxígeno a la raíz.',
          'Ambos transportan exactamente lo mismo pero a distinta velocidad.',
          'El xilema funciona solo de noche y el floema solo de día.',
        ],
        correctIndex: 0,
        explanation:
          'El xilema lleva savia bruta unidireccionalmente hacia arriba, mientras el floema distribuye savia elaborada hacia cualquier órgano que demande energía.',
        difficulty: 'basico',
      },
      {
        id: 'q2',
        question: '¿De dónde proviene principalmente la masa sólida de carbono que forma el tronco de un árbol?',
        options: [
          'De la tierra que absorben las raíces cada día',
          'Del dióxido de carbono (CO₂) capturado del aire por las hojas',
          'Del nitrógeno líquido del subsuelo',
          'Únicamente del oxígeno disuelto en la lluvia',
        ],
        correctIndex: 1,
        explanation:
          'Durante el Ciclo de Calvin, la planta fija carbono del CO₂ atmosférico para construir glucosa y celulosa.',
        difficulty: 'intermedio',
      },
      {
        id: 'q3',
        question: 'Si una planta cierra sus estomas durante una ola de calor extremo, ¿qué ocurre de inmediato?',
        options: [
          'Aumenta al doble la entrada de CO₂',
          'Conserva agua, pero entra menos CO₂ y baja la velocidad de fotosíntesis',
          'El xilema invierte su flujo hacia el suelo',
          'La clorofila se transforma en raíces',
        ],
        correctIndex: 1,
        explanation:
          'Cerrar los estomas protege contra la deshidratación, pero reduce el ingreso de CO₂ necesario para producir azúcares.',
        difficulty: 'intermedio',
      },
      {
        id: 'q4',
        question: '¿Qué impulsa principalmente el ascenso continuo del agua por el xilema hasta la copa de árboles altos?',
        options: [
          'La succión generada por la evaporación de agua en las hojas (transpiración)',
          'Un corazón muscular escondido en el tallo',
          'La gravedad terrestre empujando hacia arriba',
          'El movimiento de la tierra alrededor de la raíz',
        ],
        correctIndex: 0,
        explanation:
          'La transpiración en los estomas crea una tensión negativa que jala la columna cohesionada de agua desde las raíces.',
        difficulty: 'reto',
      },
      {
        id: 'q5',
        question: '¿De qué molécula proviene el oxígeno (O₂) que las plantas liberan durante la fase luminosa?',
        options: [
          'Del dióxido de carbono (CO₂)',
          'De la ruptura de la molécula de agua (H₂O)',
          'Del nitrógeno del suelo',
          'Del almidón guardado en el tallo',
        ],
        correctIndex: 1,
        explanation:
          'La fotólisis rompe el agua en la fase luminosa liberando O₂, mientras que el CO₂ se utiliza en el Ciclo de Calvin.',
        difficulty: 'reto',
      },
      {
        id: 'q6',
        question: '¿Por qué es falso afirmar que "las plantas solo respiran de noche"?',
        options: [
          'Porque respiran las 24 horas en sus mitocondrias, aunque de día predomina la fotosíntesis',
          'Porque nunca respiran; solo absorben luz',
          'Porque únicamente las raíces respiran',
          'Porque dejan de usar oxígeno en verano',
        ],
        correctIndex: 0,
        explanation:
          'Las células vegetales respiran de día y de noche para mantener sus funciones vitales usando energía de la glucosa.',
        difficulty: 'intermedio',
      },
      {
        id: 'q7',
        question: '¿Qué células rodean cada estoma y regulan su apertura o cierre?',
        options: [
          'Células oclusivas',
          'Células del xilema muerto',
          'Mitocondrias gigantes',
          'Pelos de la corteza',
        ],
        correctIndex: 0,
        explanation:
          'Las células oclusivas cambian de forma según la presión de agua interna para abrir o cerrar el poro estomático.',
        difficulty: 'basico',
      },
      {
        id: 'q8',
        question: '¿En qué parte exacta del cloroplasto ocurre la captura de luz y la producción de ATP?',
        options: [
          'En los tilacoides',
          'En la pared del xilema',
          'En los pelos absorbentes de la raíz',
          'En el núcleo celular',
        ],
        correctIndex: 0,
        explanation:
          'La clorofila se aloja en las membranas de los tilacoides, donde se lleva a cabo la fase luminosa.',
        difficulty: 'intermedio',
      },
      {
        id: 'q9',
        question: '¿Bajo qué forma química suelen almacenar las plantas la glucosa sobrante en papas, raíces o semillas?',
        options: ['Almidón', 'Clorofila', 'Vapor de agua', 'Lignina'],
        correctIndex: 0,
        explanation:
          'El almidón es un polisacárido compacto ideal para guardar grandes cantidades de glucosa sin alterar la presión osmótica.',
        difficulty: 'basico',
      },
      {
        id: 'q10',
        question: '¿Por qué el xilema está compuesto por conductos rígidos con lignina en lugar de tubos blandos?',
        options: [
          'Para resistir la fuerte succión negativa de la transpiración sin colapsar',
          'Para producir glucosa en el tallo oscuro',
          'Para permitir que la savia baje más lento',
          'Para atraer insectos polinizadores',
        ],
        correctIndex: 0,
        explanation:
          'Al succionar agua a gran altura se genera tensión negativa; la lignina evita que los conductos se aplasten hacia adentro.',
        difficulty: 'reto',
      },
    ],
    matchPairs: [
      { id: 'm1', term: 'Xilema', definition: 'Conduce agua y minerales hacia arriba', category: 'Transporte' },
      { id: 'm2', term: 'Floema', definition: 'Distribuye glucosa en ambas direcciones', category: 'Transporte' },
      { id: 'm3', term: 'Estomas', definition: 'Poros que regulan entrada de CO₂ y vapor', category: 'Intercambio' },
      { id: 'm4', term: 'Clorofila', definition: 'Pigmento que captura la energía solar', category: 'Fábrica' },
      { id: 'm5', term: 'Ciclo de Calvin', definition: 'Usa ATP para convertir CO₂ en glucosa', category: 'Síntesis' },
      { id: 'm6', term: 'Almidón', definition: 'Reserva de azúcares en raíces y frutos', category: 'Almacén' },
    ],
    sequenceChallenge: {
      title: 'El Viaje Completo de una Gota hasta Convertirse en Energía',
      instruction: 'Ordena cronológicamente los 5 pasos desde que entra el agua hasta que la planta reparte su alimento.',
      steps: [
        { id: 's1', order: 1, title: 'Absorción radicular', description: 'Los pelos absorbentes de la raíz toman agua y sales del suelo.' },
        { id: 's2', order: 2, title: 'Ascenso por el xilema', description: 'La savia bruta sube por el tallo impulsada por la transpiración.' },
        { id: 's3', order: 3, title: 'Entrada de CO₂ por estomas', description: 'Los poros de la hoja se abren para capturar dióxido de carbono del aire.' },
        { id: 's4', order: 4, title: 'Síntesis en cloroplastos', description: 'Fase luminosa y Ciclo de Calvin producen glucosa y liberan oxígeno.' },
        { id: 's5', order: 5, title: 'Reparto por el floema', description: 'La savia elaborada viaja a frutos, flores y raíces para nutrirlos.' },
      ],
    },
    clozeExercises: [
      {
        id: 'cl1',
        beforeBlank: 'El tejido vascular que sube agua y minerales desde la raíz se llama',
        blankAnswer: 'xilema',
        afterBlank: 'y funciona en una sola dirección.',
        hint: 'Empieza con X y transporta savia bruta.',
      },
      {
        id: 'cl2',
        beforeBlank: 'Las hojas capturan dióxido de carbono del aire a través de poros microscópicos llamados',
        blankAnswer: 'estomas',
        afterBlank: 'que también regulan la pérdida de agua.',
        hint: 'Son como pequeñas ventanas en la hoja.',
      },
      {
        id: 'cl3',
        beforeBlank: 'El azúcar fabricado en la fotosíntesis es la',
        blankAnswer: 'glucosa',
        afterBlank: 'que luego viaja por el floema.',
        hint: 'Es el combustible energético principal de los seres vivos.',
      },
      {
        id: 'cl4',
        beforeBlank: 'El pigmento verde encargado de atrapar la energía de la luz solar se denomina',
        blankAnswer: 'clorofila',
        afterBlank: 'y reside dentro de los tilacoides.',
        hint: 'Da el color verde característico a las hojas.',
      },
    ],
    trueFalseItems: [
      {
        id: 'tf1',
        statement: 'Las plantas obtienen casi todo su alimento sólido comiendo la tierra a través de las raíces.',
        isTrue: false,
        explanation: 'Falso: las raíces toman agua y minerales, pero la masa orgánica proviene del CO₂ del aire convertido en glucosa.',
      },
      {
        id: 'tf2',
        statement: 'El floema puede transportar azúcares tanto hacia arriba como hacia abajo de la planta.',
        isTrue: true,
        explanation: 'Verdadero: el floema es bidireccional según las zonas que necesiten energía (flores, frutos o raíces).',
      },
      {
        id: 'tf3',
        statement: 'El oxígeno que respiramos liberado por las plantas proviene de romper moléculas de agua.',
        isTrue: true,
        explanation: 'Verdadero: en la fase luminosa se divide el H₂O (fotólisis) liberando O₂.',
      },
      {
        id: 'tf4',
        statement: 'Las plantas únicamente realizan respiración celular durante la noche.',
        isTrue: false,
        explanation: 'Falso: sus mitocondrias respiran las 24 horas para sostener las células vivas.',
      },
      {
        id: 'tf5',
        statement: 'Si una planta cierra sus estomas por sequía, también disminuye la entrada de CO₂.',
        isTrue: true,
        explanation: 'Verdadero: al cerrar el poro protege el agua interna, pero frena el intercambio de gases.',
      },
      {
        id: 'tf6',
        statement: 'La transpiración por las hojas ayuda a jalar la columna de agua desde la raíz.',
        isTrue: true,
        explanation: 'Verdadero: crea la tensión ascendente necesaria para vencer la gravedad.',
      },
      {
        id: 'tf7',
        statement: 'El xilema transporta savia elaborada rica en azúcares hacia las raíces.',
        isTrue: false,
        explanation: 'Falso: esa es función del floema; el xilema transporta savia bruta (agua y minerales) hacia arriba.',
      },
      {
        id: 'tf8',
        statement: 'El Ciclo de Calvin requiere el ATP y NADPH producidos en la fase luminosa.',
        isTrue: true,
        explanation: 'Verdadero: usa la energía química recién cargada por la luz para ensamblar glucosa.',
      },
    ],
    categorySortGame: {
      title: 'Clasifica los Componentes del Sistema Vegetal',
      instruction: 'Ubica cada elemento en su categoría: Materia Prima / Entradas, Maquinaria de Transporte y Fábrica, o Productos / Reservas.',
      categories: [
        { id: 'cat1', name: 'Entradas y Materia Prima' },
        { id: 'cat2', name: 'Transporte y Maquinaria' },
        { id: 'cat3', name: 'Productos y Reservas' },
      ],
      items: [
        { id: 'cs1', label: 'Dióxido de carbono (CO₂)', categoryId: 'cat1', hint: 'Entra por los estomas desde el aire.' },
        { id: 'cs2', label: 'Agua y minerales del suelo', categoryId: 'cat1', hint: 'Entran por los pelos absorbentes.' },
        { id: 'cs3', label: 'Energía de luz solar', categoryId: 'cat1', hint: 'Fuente externa captada por hojas.' },
        { id: 'cs4', label: 'Conductos de Xilema', categoryId: 'cat2', hint: 'Autopista ascendente de agua.' },
        { id: 'cs5', label: 'Tilacoides y Clorofila', categoryId: 'cat2', hint: 'Paneles internos del cloroplasto.' },
        { id: 'cs6', label: 'Tubos cribosos del Floema', categoryId: 'cat2', hint: 'Red de reparto bidireccional.' },
        { id: 'cs7', label: 'Glucosa energética', categoryId: 'cat3', hint: 'Azúcar recién fabricado.' },
        { id: 'cs8', label: 'Oxígeno liberado (O₂)', categoryId: 'cat3', hint: 'Gas expulsado tras romper agua.' },
        { id: 'cs9', label: 'Almidón en tubérculos', categoryId: 'cat3', hint: 'Ahorro energético de la planta.' },
      ],
    },
    flashcards: [
      {
        id: 'f1',
        front: '¿Qué transporta la savia bruta vs. la savia elaborada?',
        back: 'Savia bruta = agua + minerales (xilema). Savia elaborada = agua + glucosa/sacarosa (floema).',
        analogy: 'Savia bruta son los ingredientes crudos; savia elaborada es el plato ya cocinado.',
        hint: 'Piensa en materia prima vs. comida terminada.',
      },
      {
        id: 'f2',
        front: '¿Cuál es la fórmula resumida de la fotosíntesis?',
        back: '6 CO₂ + 6 H₂O + Luz solar → C₆H₁₂O₆ (glucosa) + 6 O₂ (oxígeno).',
        analogy: 'Aire + Agua + Sol = Azúcar para la planta + Aire limpio para nosotros.',
        hint: 'Entran 2 moléculas simples y salen 1 azúcar y 1 gas.',
      },
      {
        id: 'f3',
        front: '¿Qué función cumplen las células oclusivas?',
        back: 'Rodean cada estoma y cambian de forma según su hidratación para abrir o cerrar el poro.',
        analogy: 'Son los guardias de seguridad de la puerta de la hoja.',
        hint: 'Su nombre viene de "ocluir" o cerrar.',
      },
      {
        id: 'f4',
        front: '¿Por qué el floema es bidireccional?',
        back: 'Porque las hojas maduras alimentan tanto a flores y brotes arriba como a raíces abajo.',
        analogy: 'Un repartidor que entrega en el ático y también en el sótano.',
        hint: 'Piensa dónde están las flores y dónde están las raíces.',
      },
      {
        id: 'f5',
        front: '¿Qué diferencia la fase luminosa del Ciclo de Calvin?',
        back: 'La fase luminosa rompe agua con luz y carga ATP; el Ciclo de Calvin usa ese ATP para convertir CO₂ en glucosa.',
        analogy: 'Primero cargas la batería al sol, luego usas la batería para cocinar.',
        hint: 'Tilacoides vs. Estroma.',
      },
    ],
    feynmanGuide: {
      childLevelExplanation:
        'Imagina que una planta es un chef solar: sus raíces son popotes que toman agua del suelo, sus hojas son paneles solares que atrapan luz y aire, y con eso cocina su propio azúcar para crecer mientras regala oxígeno al mundo.',
      socraticQuestions: [
        'Si pones una planta dentro de un armario oscuro pero la riegas todos los días, ¿por qué termina muriendo?',
        '¿Qué pasaría con un árbol gigante si bloqueáramos todos los poros debajo de sus hojas con vaselina?',
        '¿Por qué las zanahorias son dulces bajo tierra si nunca reciben luz solar directa?',
      ],
      realWorldHook:
        'Pregunta inicial: "Un roble pesa varias toneladas, pero el suelo de su maceta casi no pierde tierra. ¿De dónde salió toda esa madera?"',
    },
    teachingMethods: [
      {
        id: 'tm1',
        name: 'Simulación Viviente: Autopistas de la Planta',
        durationMinutes: 15,
        bestFor: 'Grupos de 10 a 35 estudiantes en aula o patio',
        objective: 'Diferenciar físicamente el flujo unidireccional del xilema frente al reparto bidireccional del floema.',
        steps: [
          'Divide al salón en 3 zonas: Raíz, Tallo (2 filas paralelas) y Hoja.',
          'La fila "Xilema" solo puede pasarse tarjetas azules (Agua) hacia arriba, desde la Raíz hasta la Hoja.',
          'La zona "Hoja" intercambia tarjetas azules + aire por tarjetas doradas (Glucosa) cuando reciben "luz".',
          'La fila "Floema" reparte las tarjetas doradas tanto hacia arriba (flores) como hacia abajo (raíz).',
        ],
        materialsNeeded: ['Tarjetas azules (agua)', 'Tarjetas doradas (glucosa)', 'Cinta adhesiva para marcar el suelo'],
      },
      {
        id: 'tm2',
        name: 'Experimento Express del Apio Teñido',
        durationMinutes: 10,
        bestFor: 'Demostración visual de alto impacto',
        objective: 'Hacer visible el xilema en plantas reales para eliminar la idea de que el tallo es macizo.',
        steps: [
          'Coloca dos tallos frescos de apio en vasos con agua y colorante azul o rojo.',
          'Pide hipótesis previas: "¿Subirá el color a las hojas?".',
          'Corta transversalmente el tallo al día siguiente para observar los puntos teñidos del xilema.',
        ],
        materialsNeeded: ['2 tallos de apio', 'Colorante vegetal', 'Vaso transparente'],
      },
    ],
    lessonPlanActs: [
      {
        actNumber: 1,
        title: 'El Misterio del Árbol que No Come Tierra',
        durationMinutes: 7,
        teacherAction: 'Plantea el experimento de Van Helmont y pregunta de dónde sale el peso del árbol.',
        studentActivity: 'Votan hipótesis en parejas antes de escuchar la respuesta.',
      },
      {
        actNumber: 2,
        title: 'Recorrido del Mapa de 8 Puntos y Juegos',
        durationMinutes: 20,
        teacherAction: 'Proyecta las 4 etapas visuales y guía las analogías de tubería y cocina solar.',
        studentActivity: 'Resuelven en equipos el clasificador de conceptos y parejas.',
      },
      {
        actNumber: 3,
        title: 'Trivia Relámpago y Ticket de Salida',
        durationMinutes: 13,
        teacherAction: 'Lanza la Trivia de 10 preguntas y cierra aclarando el mito de la respiración nocturna.',
        studentActivity: 'Responden las 2 preguntas de salida antes de terminar.',
      },
    ],
    exitTicketQuestions: [
      'Explica con tus propias palabras la diferencia entre xilema y floema usando una analogía cotidiana.',
      '¿De qué molécula viene el oxígeno que libera la planta y de dónde viene el carbono de la glucosa?',
    ],
  },
  {
    id: 'sample-revolucion',
    sourceFileName: 'Tema_Revolucion_Industrial_Resumen.docx',
    sourceType: 'ejemplo',
    sourceTextContext:
      'La Primera Revolución Industrial comenzó en Gran Bretaña hacia 1760 gracias a la revolución agrícola previa (cercamientos o enclosures), la abundancia de carbón mineral y hierro, el capital comercial colonial y la estabilidad institucional. La mecanización inició en la industria textil del algodón con inventos como la Spinning Jenny de Hargreaves y el telar mecánico. En 1769 James Watt perfeccionó la máquina de vapor añadiendo un condensador separado, permitiendo instalar fábricas en cualquier ciudad sin depender de ríos. Surgió el sistema fabril (factory system) con horarios estrictos y división del trabajo, reemplazando los talleres artesanales. El transporte se transformó con la locomotora de George Stephenson (línea Liverpool-Manchester 1830) y barcos de vapor, unificando mercados y creando horarios estándar. Socialmente creció la burguesía industrial y nació el proletariado urbano, enfrentando largas jornadas y trabajo infantil, lo que originó protestas como el ludismo y los primeros sindicatos (Trade Unions).',
    subjectTitle: 'La Primera Revolución Industrial',
    discipline: 'Historia Universal',
    level: 'preparatoria',
    focus: 'ambos',
    estimatedStudyMinutes: 22,
    executiveSummary:
      'Entre 1760 y 1840, Gran Bretaña transitó de una economía agrícola y artesanal a una economía mecanizada impulsada por el carbón y la máquina de vapor, transformando la producción, el transporte, las ciudades y la estructura social.',
    bigIdea:
      'Cambiar la fuerza muscular por máquinas de vapor multiplicó la producción como nunca antes, pero reorganizó toda la vida humana alrededor de las fábricas y el reloj.',
    stages: [
      {
        stageNumber: 1,
        title: 'Condiciones Previas en Gran Bretaña',
        summary: 'Revolución agrícola, cercamientos, abundancia de carbón y hierro y capital comercial.',
        keyTakeaway: 'Había energía barata, dinero para invertir y mano de obra disponible.',
      },
      {
        stageNumber: 2,
        title: 'Mecanización Textil y Vapor',
        summary: 'La Spinning Jenny y la máquina de vapor de James Watt dieron origen al sistema fabril.',
        keyTakeaway: 'La energía dejó de depender de ríos o caballos.',
      },
      {
        stageNumber: 3,
        title: 'Revolución del Transporte',
        summary: 'Locomotoras y barcos de vapor acortaron distancias y conectaron mercados.',
        keyTakeaway: 'Mover mercancías pasó de semanas a horas.',
      },
      {
        stageNumber: 4,
        title: 'Sociedad Urbana y Movimiento Obrero',
        summary: 'Migración masiva a ciudades industriales, nacimiento del proletariado y primeros sindicatos.',
        keyTakeaway: 'Nació la clase obrera moderna y la lucha por derechos laborales.',
      },
    ],
    concepts: [
      {
        id: 'r1',
        title: 'Revolución Agrícola y Cercamientos',
        shortLabel: 'Cercamientos',
        stage: 1,
        simpleExplanation:
          'Nuevas técnicas de cultivo produjeron más comida con menos campesinos, y las leyes de cercamiento privatizaron tierras comunales.',
        everydayAnalogy:
          'Modernizar una granja redujo el trabajo manual, empujando a miles de familias a buscar empleo en las ciudades.',
        documentExample:
          'Las Enclosures Acts concentraron tierras en grandes propietarios y liberaron mano de obra hacia centros fabriles.',
        teachingTip:
          'Explica la cadena causa-efecto: más comida → más población → menos empleo rural → obreros disponibles.',
        commonMisconception:
          'Creer que las fábricas aparecieron de la nada sin cambios previos en el campo.',
        keyPoints: ['Rotación de cultivos cuatrienal.', 'Crecimiento demográfico rápido.', 'Migración campo-ciudad.'],
        connectsTo: ['r3', 'r4'],
      },
      {
        id: 'r2',
        title: 'Carbón Mineral y Hierro',
        shortLabel: 'Carbón y Hierro',
        stage: 1,
        simpleExplanation:
          'Gran Bretaña contaba con enormes minas de carbón cerca de la superficie y yacimientos de hierro para construir calderas y rieles.',
        everydayAnalogy:
          'Tener la gasolina y el acero en el patio de casa antes que nadie.',
        documentExample:
          'El coque obtenido del carbón permitió fundir hierro de mayor resistencia para puentes, máquinas y locomotoras.',
        teachingTip:
          'Muestra en un mapa la cercanía entre minas de carbón, puertos y ciudades industriales inglesas.',
        commonMisconception:
          'Pensar que el petróleo fue el combustible de la primera revolución; el petróleo llegó en la Segunda (finales del XIX).',
        keyPoints: ['Carbón como combustible central.', 'Hierro para maquinaria pesada.', 'Minas cercanas a puertos.'],
        connectsTo: ['r3', 'r5'],
      },
      {
        id: 'r3',
        title: 'Mecanización Textil (Spinning Jenny)',
        shortLabel: 'Industria Textil',
        stage: 2,
        simpleExplanation:
          'El sector del algodón fue el primero en mecanizarse, multiplicando por decenas la velocidad para hilar y tejer telas.',
        everydayAnalogy:
          'Pasar de tejer un suéter a mano en una semana a producir cincuenta en una tarde.',
        documentExample:
          'La Spinning Jenny permitió a un solo operario manejar múltiples husos simultáneamente.',
        teachingTip:
          'Pregunta al grupo por qué empezaron por la ropa y no por computadoras o autos: la demanda básica de tela era universal.',
        commonMisconception:
          'Creer que la industria pesada fue primero que la textil; primero fue el algodón, luego el acero.',
        keyPoints: ['Algodón importado en grandes volúmenes.', 'Innovaciones en cadena: hilado y tejido.', 'Abarató la vestimenta.'],
        connectsTo: ['r4'],
      },
      {
        id: 'r4',
        title: 'Máquina de Vapor (James Watt)',
        shortLabel: 'Máquina de Vapor',
        stage: 2,
        simpleExplanation:
          'Motor que convierte el calor del carbón y el vapor de agua en movimiento continuo para mover máquinas y trenes.',
        everydayAnalogy:
          'Como una olla de presión gigante cuya tapa empuja un pistón conectado a una rueda.',
        documentExample:
          'Watt añadió en 1769 un condensador separado que redujo drásticamente el consumo de carbón.',
        teachingTip:
          'Compara la fábrica antes de Watt (atada a un río) vs. después (ubicada en cualquier ciudad).',
        commonMisconception:
          'Pensar que Watt inventó la primera máquina de vapor desde cero; perfeccionó la de Newcomen.',
        keyPoints: ['Independizó fábricas de los ríos.', 'Ahorró combustible con condensador separado.', 'Se adaptó a minas, telares y trenes.'],
        connectsTo: ['r5', 'r6'],
      },
      {
        id: 'r5',
        title: 'Sistema Fabril (Factory System)',
        shortLabel: 'Sistema Fabril',
        stage: 3,
        simpleExplanation:
          'Concentró máquinas y cientos de obreros bajo un mismo techo, con tareas divididas y horarios marcados por sirenas y relojes.',
        everydayAnalogy:
          'De cocinar cada quien en su casa a trabajar en una cocina industrial cronometrada por turnos.',
        documentExample:
          'El artesano dueño de su ritmo pasó a ser un asalariado supervisado con jornadas de 12 a 14 horas.',
        teachingTip:
          'Dinámica de 2 min: un alumno dobla aviones solo vs. 4 alumnos en línea haciendo un doblez cada uno.',
        commonMisconception:
          'Pensar que antes de las fábricas la gente trabajaba con relojes exactos en el campo.',
        keyPoints: ['División estricta del trabajo.', 'Disciplina horaria y multas.', 'Producción estandarizada en masa.'],
        connectsTo: ['r7', 'r8'],
      },
      {
        id: 'r6',
        title: 'Ferrocarril y Barco de Vapor',
        shortLabel: 'Ferrocarril',
        stage: 3,
        simpleExplanation:
          'Locomotoras sobre vías de hierro conectaron minas, fábricas y puertos a velocidades nunca vistas.',
        everydayAnalogy:
          'Fue el "internet físico" del siglo XIX: unió regiones aisladas y estandarizó los relojes entre ciudades.',
        documentExample:
          'La línea Liverpool-Manchester (1830) demostró que transportar mercancías y pasajeros por tren era veloz y rentable.',
        teachingTip:
          'Explica cómo los horarios ferroviarios obligaron a crear la hora nacional unificada.',
        commonMisconception:
          'Ver el tren solo para viajeros; su negocio principal era mover carbón, hierro y algodón.',
        keyPoints: ['Locomotora de Stephenson.', 'Abarató el transporte terrestre.', 'Impulsó la minería y siderurgia.'],
        connectsTo: ['r7'],
      },
      {
        id: 'r7',
        title: 'Urbanización y Burguesía Industrial',
        shortLabel: 'Ciudades Industriales',
        stage: 4,
        simpleExplanation:
          'Aldeas como Manchester crecieron explosivamente en barrios obreros hacinados, mientras los dueños de fábricas acumulaban poder.',
        everydayAnalogy:
          'Construir una ciudad para 300 mil personas en pocos años sin drenaje ni agua potable planeada.',
        documentExample:
          'La burguesía industrial reemplazó gradualmente a la antigua nobleza terrateniente como motor económico.',
        teachingTip:
          'Contrasta los barrios residenciales burgueses con las viviendas obreras cerca de las chimeneas.',
        commonMisconception:
          'Suponer que el crecimiento urbano trajo higiene inmediata; las primeras ciudades industriales sufrieron graves epidemias.',
        keyPoints: ['Crecimiento acelerado de Manchester y Liverpool.', 'Contaminación por hollín de carbón.', 'Ascenso político de la burguesía.'],
        connectsTo: ['r8'],
      },
      {
        id: 'r8',
        title: 'Proletariado, Ludismo y Sindicatos',
        shortLabel: 'Movimiento Obrero',
        stage: 4,
        simpleExplanation:
          'La nueva clase obrera asalariada enfrentó bajos salarios y trabajo infantil, organizándose primero en protestas y luego en sindicatos.',
        everydayAnalogy:
          'Si reclama una persona sola es reemplazada; si paran todos juntos, pueden negociar reglas justas.',
        documentExample:
          'Las Trade Unions británicas lograron progresivamente limitar las horas de trabajo y prohibir abusos infantiles.',
        teachingTip:
          'Pide al grupo redactar 3 derechos laborales esenciales que hoy damos por sentados.',
        commonMisconception:
          'Confundir el ludismo con odio irracional a la ciencia; protestaban contra la pérdida de salarios y condiciones inhumanas.',
        keyPoints: ['Jornadas de 12–16 horas y trabajo infantil.', 'Ludismo: destrucción simbólica de máquinas.', 'Nacimiento de Trade Unions (sindicatos).'],
        connectsTo: [],
      },
    ],
    quiz: [
      {
        id: 'rq1',
        question: '¿Qué combustible impulsó decisivamente la Primera Revolución Industrial?',
        options: ['El petróleo refinado', 'El carbón mineral', 'La energía solar', 'El gas natural'],
        correctIndex: 1,
        explanation: 'Gran Bretaña poseía enormes yacimientos de carbón mineral accesibles para calderas y altos hornos.',
        difficulty: 'basico',
      },
      {
        id: 'rq2',
        question: '¿Cuál fue el primer sector económico que se mecanizó masivamente?',
        options: ['La industria textil del algodón', 'La aviación comercial', 'La industria automotriz', 'La electrónica'],
        correctIndex: 0,
        explanation: 'Inventos como la Spinning Jenny y el telar mecánico transformaron primero el sector textil.',
        difficulty: 'basico',
      },
      {
        id: 'rq3',
        question: '¿Por qué la mejora de James Watt a la máquina de vapor cambió la geografía de las fábricas?',
        options: [
          'Porque permitió instalar fábricas lejos de ríos con corriente, cerca de carbón y puertos',
          'Porque funcionaba con nieve de montaña',
          'Porque prohibió construir caminos rurales',
          'Porque redujo el tamaño de las ciudades a aldeas',
        ],
        correctIndex: 0,
        explanation: 'Antes de Watt, muchas fábricas dependían de ruedas hidráulicas junto a ríos rápidos.',
        difficulty: 'intermedio',
      },
      {
        id: 'rq4',
        question: '¿Qué cambió el sistema fabril respecto al taller artesanal previo?',
        options: [
          'Concentró obreros y máquinas bajo un mismo techo con división del trabajo y horarios fijos',
          'Entregó una máquina de vapor gratuita a cada granja',
          'Eliminó el uso de salarios monetarios',
          'Restringió la producción a solo días festivos',
        ],
        correctIndex: 0,
        explanation: 'El trabajo pasó de ser autónomo a jornadas reguladas por el reloj y el ritmo de la máquina.',
        difficulty: 'intermedio',
      },
      {
        id: 'rq5',
        question: '¿Qué efecto tuvieron los cercamientos (Enclosures) en el campo británico?',
        options: [
          'Desplazaron a campesinos sin tierras hacia las ciudades en busca de empleo fabril',
          'Repartieron las fábricas entre los campesinos',
          'Prohibieron la cría de ganado en Inglaterra',
          'Detuvieron por completo el crecimiento de la población',
        ],
        correctIndex: 0,
        explanation: 'La privatización de tierras comunales y la mejora agrícola liberaron abundante mano de obra urbana.',
        difficulty: 'intermedio',
      },
      {
        id: 'rq6',
        question: '¿Qué inauguró en 1830 la línea ferroviaria entre Liverpool y Manchester?',
        options: [
          'El transporte regular de carga y pasajeros impulsado por locomotoras a vapor',
          'El primer metro subterráneo eléctrico del mundo',
          'El primer canal aéreo de dirigibles',
          'La prohibición del carbón mineral',
        ],
        correctIndex: 0,
        explanation: 'Demostró la viabilidad económica y velocidad del ferrocarril moderno.',
        difficulty: 'basico',
      },
      {
        id: 'rq7',
        question: '¿Qué representó el movimiento ludita a inicios del siglo XIX?',
        options: [
          'Protestas obreras que destruían telares mecánicos por el desempleo y bajos salarios',
          'Un grupo de banqueros que financiaba ferrocarriles',
          'Una asociación científica dedicada a perfeccionar el vapor',
          'El partido político de los dueños de minas',
        ],
        correctIndex: 0,
        explanation: 'Artesanos y tejedores desplazados veían las nuevas máquinas como amenaza directa a su sustento.',
        difficulty: 'intermedio',
      },
      {
        id: 'rq8',
        question: '¿Qué caracterizaba a la nueva clase social llamada proletariado?',
        options: [
          'No poseía medios de producción y vendía su fuerza de trabajo por un salario',
          'Era dueña de las minas de carbón y navieras',
          'Cobraba impuestos feudales a los reyes',
          'Solo trabajaba en monasterios medievales',
        ],
        correctIndex: 0,
        explanation: 'A diferencia de la burguesía industrial, el proletariado dependía íntegramente de su salario.',
        difficulty: 'basico',
      },
      {
        id: 'rq9',
        question: '¿Por qué el ferrocarril impulsó también a las industrias del carbón y del hierro?',
        options: [
          'Porque construir vías, puentes y calderas exigía toneladas de hierro y carbón diario',
          'Porque los trenes funcionaban únicamente con velas de tela',
          'Porque redujo la necesidad de metal en el país',
          'Porque reemplazó todas las minas por granjas',
        ],
        correctIndex: 0,
        explanation: 'Generó un círculo de retroalimentación industrial entre transporte, siderurgia y minería.',
        difficulty: 'reto',
      },
      {
        id: 'rq10',
        question: '¿Qué impacto inesperado tuvo el ferrocarril sobre la vida cotidiana del siglo XIX?',
        options: [
          'Obligó a unificar la hora oficial entre ciudades para evitar choques y coordinar itinerarios',
          'Eliminó el uso de relojes en las fábricas',
          'Impidió el comercio entre puertos y capitales',
          'Aumentó el tiempo de viaje de días a meses',
        ],
        correctIndex: 0,
        explanation: 'Antes cada pueblo tenía su hora solar local; los horarios de tren estandarizaron el tiempo.',
        difficulty: 'reto',
      },
    ],
    matchPairs: [
      { id: 'rm1', term: 'James Watt', definition: 'Perfeccionó la máquina de vapor industrial', category: 'Invento' },
      { id: 'rm2', term: 'Carbón mineral', definition: 'Fuente energética base del siglo XVIII', category: 'Energía' },
      { id: 'rm3', term: 'Proletariado', definition: 'Clase obrera asalariada urbana', category: 'Sociedad' },
      { id: 'rm4', term: 'Ludismo', definition: 'Protesta obrera contra mecanización abusiva', category: 'Conflicto' },
      { id: 'rm5', term: 'Ferrocarril', definition: 'Unificó mercados y acortó tiempos de viaje', category: 'Transporte' },
      { id: 'rm6', term: 'Enclosures', definition: 'Cercamiento de tierras que impulsó migración', category: 'Campo' },
    ],
    sequenceChallenge: {
      title: 'Cadena de Transformación Industrial',
      instruction: 'Ordena cómo un cambio en el campo desencadenó el mundo industrial moderno.',
      steps: [
        { id: 'rs1', order: 1, title: 'Revolución Agrícola y Cercamientos', description: 'Mejoran las cosechas y campesinos sin tierra migran buscando trabajo.' },
        { id: 'rs2', order: 2, title: 'Mecanización Textil y Carbón', description: 'Se inventan hiladoras rápidas alimentadas por carbón y vapor.' },
        { id: 'rs3', order: 3, title: 'Expansión de Fábricas y Ferrocarril', description: 'Las ciudades crecen rápido y los trenes conectan fábricas con puertos.' },
        { id: 'rs4', order: 4, title: 'Nacimiento de Sindicatos', description: 'Los obreros se organizan para exigir jornadas justas y fin del trabajo infantil.' },
      ],
    },
    clozeExercises: [
      {
        id: 'rcl1',
        beforeBlank: 'La Primera Revolución Industrial comenzó hacia 1760 en',
        blankAnswer: 'Gran Bretaña',
        afterBlank: 'impulsada por su riqueza en carbón y hierro.',
        hint: 'País insular europeo donde nació el ferrocarril.',
      },
      {
        id: 'rcl2',
        beforeBlank: 'El motor clave que permitió independizar las fábricas de los ríos fue la máquina de',
        blankAnswer: 'vapor',
        afterBlank: 'perfeccionada por James Watt.',
        hint: 'Gas que sale del agua hirviendo.',
      },
      {
        id: 'rcl3',
        beforeBlank: 'La nueva clase trabajadora urbana que vivía de su salario recibió el nombre de',
        blankAnswer: 'proletariado',
        afterBlank: 'en contraste con la burguesía industrial.',
        hint: 'Empieza con P.',
      },
      {
        id: 'rcl4',
        beforeBlank: 'El primer sector en adoptar máquinas a gran escala fue la industria',
        blankAnswer: 'textil',
        afterBlank: 'especialmente hilando y tejiendo algodón.',
        hint: 'Relacionada con telas y ropa.',
      },
    ],
    trueFalseItems: [
      {
        id: 'rtf1',
        statement: 'El petróleo y la electricidad fueron las energías principales de la Primera Revolución Industrial.',
        isTrue: false,
        explanation: 'Falso: fueron el carbón mineral y la máquina de vapor; el petróleo y la electricidad llegaron en la Segunda.',
      },
      {
        id: 'rtf2',
        statement: 'James Watt mejoró la máquina de vapor al incorporar un condensador separado que ahorraba carbón.',
        isTrue: true,
        explanation: 'Verdadero: ese avance hizo rentable usar motores a vapor en fábricas de todo tipo.',
      },
      {
        id: 'rtf3',
        statement: 'Antes del sistema fabril, el trabajo artesanal no dependía de sirenas ni turnos estrictos por reloj.',
        isTrue: true,
        explanation: 'Verdadero: la fábrica impuso la disciplina del tiempo cronometrado.',
      },
      {
        id: 'rtf4',
        statement: 'El ludismo era una asociación de empresarios textiles a favor de nuevas máquinas.',
        isTrue: false,
        explanation: 'Falso: fue un movimiento obrero que destruía máquinas ante el temor de perder su sustento.',
      },
      {
        id: 'rtf5',
        statement: 'El ferrocarril contribuyó a estandarizar la hora oficial entre diferentes ciudades.',
        isTrue: true,
        explanation: 'Verdadero: se necesitaba un horario común para coordinar salidas y llegadas.',
      },
      {
        id: 'rtf6',
        statement: 'La Primera Revolución Industrial comenzó inicialmente en Francia y Alemania antes que en Inglaterra.',
        isTrue: false,
        explanation: 'Falso: inició en Gran Bretaña hacia 1760 y luego se expandió por Europa y Norteamérica.',
      },
    ],
    categorySortGame: {
      title: 'Clasifica los Factores de la Revolución Industrial',
      instruction: 'Agrupa cada elemento en Tecnología y Energía, Economía y Sociedad, o Consecuencias Laborales.',
      categories: [
        { id: 'cat1', name: 'Tecnología y Energía' },
        { id: 'cat2', name: 'Economía y Sociedad' },
        { id: 'cat3', name: 'Respuestas y Derechos' },
      ],
      items: [
        { id: 'rcs1', label: 'Máquina de vapor de Watt', categoryId: 'cat1', hint: 'Motor térmico de 1769.' },
        { id: 'rcs2', label: 'Locomotora sobre rieles', categoryId: 'cat1', hint: 'Revolución del transporte.' },
        { id: 'rcs3', label: 'Hiladora Spinning Jenny', categoryId: 'cat1', hint: 'Invento para hilar algodón.' },
        { id: 'rcs4', label: 'Burgesía dueña de fábricas', categoryId: 'cat2', hint: 'Propietarios del capital.' },
        { id: 'rcs5', label: 'Crecimiento rápido de Manchester', categoryId: 'cat2', hint: 'Fenómeno de urbanización.' },
        { id: 'rcs6', label: 'Cercamientos agrícolas', categoryId: 'cat2', hint: 'Cambio previo en el campo.' },
        { id: 'rcs7', label: 'Primeros sindicatos (Trade Unions)', categoryId: 'cat3', hint: 'Organización obrera.' },
        { id: 'rcs8', label: 'Protestas del movimiento ludita', categoryId: 'cat3', hint: 'Resistencia contra abusos.' },
        { id: 'rcs9', label: 'Leyes contra trabajo infantil', categoryId: 'cat3', hint: 'Reformas laborales.' },
      ],
    },
    flashcards: [
      {
        id: 'rf1',
        front: '¿Por qué empezó en Gran Bretaña y no en otro país?',
        back: 'Combinó carbón y hierro abundantes, revolución agrícola previa, capital comercial y estabilidad política.',
        analogy: 'Tenía juntos los ingredientes, la estufa y el mercado para vender.',
        hint: 'Piensa en recursos naturales + dinero + mano de obra.',
      },
      {
        id: 'rf2',
        front: '¿Diferencia entre burguesía industrial y proletariado?',
        back: 'La burguesía era dueña de las fábricas y máquinas; el proletariado aportaba su trabajo por un salario.',
        analogy: 'Dueños del taller gigante vs. operadores de las máquinas.',
        hint: 'Propiedad de los medios vs. fuerza de trabajo.',
      },
      {
        id: 'rf3',
        front: '¿Cómo cambió el ferrocarril la vida cotidiana?',
        back: 'Abarató productos, aceleró viajes de días a horas e impulsó el consumo de hierro y carbón.',
        analogy: 'Fue equivalente histórico a pasar de cartas a caballo a fibra óptica.',
        hint: 'Impactó tanto al comercio como al tiempo.',
      },
      {
        id: 'rf4',
        front: '¿Qué fueron las Trade Unions?',
        back: 'Los primeros sindicatos británicos formados por obreros para exigir salarios dignos y jornadas limitadas.',
        analogy: 'Unir voces individuales en un solo equipo negociador.',
        hint: 'Nacieron en las fábricas del siglo XIX.',
      },
    ],
    feynmanGuide: {
      childLevelExplanation:
        'Antes casi todo se hacía con manos, viento o caballos; la Revolución Industrial fue descubrir que hirviendo agua con carbón podías hacer que máquinas gigantes trabajaran sin cansarse nunca.',
      socraticQuestions: [
        'Si una máquina produce 50 camisas en el tiempo que antes tomaba 1, ¿quién gana y quién pierde al principio?',
        '¿Por qué crees que antes de las fábricas la gente no miraba el reloj minuto a minuto?',
      ],
      realWorldHook: 'Mira la etiqueta de tu camisa hoy: todo ese proceso masivo nació con el algodón británico de 1760.',
    },
    teachingMethods: [
      {
        id: 'rtm1',
        name: 'Taller Artesanal vs. Cadena de Montaje',
        durationMinutes: 12,
        bestFor: 'Clase completa para experimentar la división del trabajo',
        objective: 'Sentir la diferencia entre producir de principio a fin y especializarse en un paso repetitivo.',
        steps: [
          'Un equipo de 4 estudiantes fabrica figuras completas de papel de forma individual (artesanos).',
          'Otro equipo de 4 se divide en pasos 1-2-3-4 en línea (fábrica) con cronómetro exigente.',
          'Al final comparan cantidad producida, calidad y cómo se sintieron en ambos roles.',
        ],
        materialsNeeded: ['Hojas recicladas', 'Cronómetro'],
      },
    ],
    lessonPlanActs: [
      {
        actNumber: 1,
        title: 'Antes y Después del Reloj',
        durationMinutes: 8,
        teacherAction: 'Muestra dos rutinas diarias: un campesino de 1700 vs. un obrero de Manchester de 1830.',
        studentActivity: 'Identifican 3 cambios drásticos en horario, vivienda y trabajo.',
      },
      {
        actNumber: 2,
        title: 'Simulación Fabril + Mapa de 8 Puntos',
        durationMinutes: 20,
        teacherAction: 'Ejecuta la dinámica de papel y conecta cada hallazgo con los 8 conceptos del mapa.',
        studentActivity: 'Completan el reto de secuencia y el clasificador.',
      },
      {
        actNumber: 3,
        title: 'Debate Rápido sobre Derechos Laborales',
        durationMinutes: 12,
        teacherAction: 'Plantea la pregunta sobre las Trade Unions y cierra con el ticket de salida.',
        studentActivity: 'Proponen 2 derechos laborales esenciales.',
      },
    ],
    exitTicketQuestions: [
      '¿Qué papel jugó la máquina de vapor en el crecimiento de las ciudades?',
      'Menciona una ventaja y una consecuencia social dura de la industrialización.',
    ],
  },
  {
    id: 'sample-newton',
    sourceFileName: 'Fisica_Leyes_de_Newton_Didactica.pdf',
    sourceType: 'ejemplo',
    sourceTextContext:
      'Las tres leyes del movimiento de Isaac Newton fundamentan la mecánica clásica. Primera Ley (Inercia): todo cuerpo permanece en reposo o en movimiento rectilíneo uniforme si la fuerza neta que actúa sobre él es cero; explica el uso del cinturón de seguridad. Masa es la medida de la inercia de un cuerpo en kilogramos, distinta del peso que es fuerza gravitacional en Newtons. Segunda Ley (Dinámica): la aceleración es directamente proporcional a la fuerza neta e inversamente proporcional a la masa (F = m·a), medida en Newtons (1 N = 1 kg·m/s²). La fricción es una fuerza de contacto opuesta al deslizamiento. Tercera Ley (Acción y Reacción): si un cuerpo A ejerce fuerza sobre B, B ejerce una fuerza igual en magnitud y opuesta en sentido sobre A; estas fuerzas actúan sobre cuerpos distintos y por ello nunca se cancelan entre sí, permitiendo el despegue de cohetes en el vacío o el nado.',
    subjectTitle: 'Las Tres Leyes del Movimiento de Newton',
    discipline: 'Física',
    level: 'preparatoria',
    focus: 'ambos',
    estimatedStudyMinutes: 20,
    executiveSummary:
      'Las leyes de Newton explican por qué los objetos permanecen quietos o en movimiento, cómo se relacionan fuerza, masa y aceleración (F = m·a), y por qué toda interacción nace en pares iguales y opuestos.',
    bigIdea:
      'Nada cambia su movimiento por arte de magia: necesita una fuerza neta, y siempre que empujas algo, ese algo te empuja de vuelta con la misma intensidad.',
    stages: [
      {
        stageNumber: 1,
        title: 'Primera Ley: Inercia y Equilibrio',
        summary: 'Los cuerpos mantienen su estado de reposo o velocidad constante si la fuerza neta es cero.',
        keyTakeaway: 'Los objetos se resisten a cambiar lo que ya están haciendo.',
      },
      {
        stageNumber: 2,
        title: 'Masa, Peso y Fricción',
        summary: 'La masa mide la inercia en kg, mientras peso y fricción son fuerzas en Newtons.',
        keyTakeaway: 'La fricción explica por qué en la Tierra las cosas se frenan.',
      },
      {
        stageNumber: 3,
        title: 'Segunda Ley: F = m · a',
        summary: 'Acelerar más masa exige más fuerza; con la misma fuerza, menos masa acelera más.',
        keyTakeaway: 'La aceleración apunta siempre en la dirección de la fuerza neta.',
      },
      {
        stageNumber: 4,
        title: 'Tercera Ley: Acción y Reacción',
        summary: 'Toda fuerza tiene una pareja igual y opuesta actuando sobre un cuerpo distinto.',
        keyTakeaway: 'No se anulan porque cada una empuja a un objeto diferente.',
      },
    ],
    concepts: [
      {
        id: 'n1',
        title: 'Ley de Inercia (1.ª Ley)',
        shortLabel: '1.ª Ley: Inercia',
        stage: 1,
        simpleExplanation:
          'Un objeto quieto sigue quieto, y uno en movimiento sigue en línea recta a velocidad constante salvo que actúe una fuerza neta.',
        everydayAnalogy:
          'Cuando el autobús frena de golpe, tu cuerpo sigue yéndose hacia adelante porque quería conservar su velocidad.',
        documentExample:
          'El cinturón de seguridad aplica la fuerza externa necesaria para detener tu cuerpo junto con el auto.',
        teachingTip:
          'Haz el truco de la moneda sobre una tarjeta encima de un vaso: al jalar rápido la tarjeta, la moneda cae recto al vaso.',
        commonMisconception:
          'Creer que un objeto necesita una fuerza constante para seguir moviéndose; en el espacio seguiría sin empujarlo.',
        keyPoints: ['Reposo o movimiento uniforme.', 'Ocurre cuando la fuerza neta = 0.', 'Base de la seguridad vial.'],
        connectsTo: ['n2', 'n3'],
      },
      {
        id: 'n2',
        title: 'Fuerza Neta y Equilibrio',
        shortLabel: 'Fuerza Neta',
        stage: 1,
        simpleExplanation:
          'Es la suma vectorial de todas las fuerzas que actúan sobre un mismo objeto. Si se cancelan entre sí, la fuerza neta es cero.',
        everydayAnalogy:
          'Dos equipos jalando una cuerda con la misma fuerza: hay mucha tensión, pero el nudo del centro no acelera.',
        documentExample:
          'Un libro sobre la mesa no cae porque la fuerza normal de la mesa equilibra exactamente a su peso.',
        teachingTip:
          'Dibuja flechas opuestas del mismo tamaño sobre una caja para mostrar equilibrio estático y dinámico.',
        commonMisconception:
          'Pensar que "fuerza neta cero" significa obligatoriamente velocidad cero (un avión a velocidad crucero tiene fuerza neta cero).',
        keyPoints: ['Suma de todas las fuerzas.', 'Fnet = 0 implica aceleración = 0.', 'Fuerzas opuestas se restan.'],
        connectsTo: ['n4', 'n5'],
      },
      {
        id: 'n3',
        title: 'Masa vs. Peso',
        shortLabel: 'Masa y Peso',
        stage: 2,
        simpleExplanation:
          'La masa (kg) es la cantidad de materia y mide la inercia; el peso (N) es la fuerza con la que la gravedad atrae esa masa.',
        everydayAnalogy:
          'En la Luna sigues teniendo los mismos kilogramos de masa, pero tu peso baja a la sexta parte.',
        documentExample:
          'Una masa de 10 kg pesa aproximadamente 98 N en la Tierra (P = m · g).',
        teachingTip:
          'Pregunta: "¿Si flotas en la Estación Espacial sin peso aparente, cuesta mover un tanque de 100 kg?" ¡Sí, porque aún tiene masa e inercia!',
        commonMisconception:
          'Usar kilogramos como unidad de peso en física.',
        keyPoints: ['Masa en kg (invariable).', 'Peso en Newtons (depende de g).', 'Más masa = mayor inercia.'],
        connectsTo: ['n5'],
      },
      {
        id: 'n4',
        title: 'Fuerza de Fricción',
        shortLabel: 'Fricción',
        stage: 2,
        simpleExplanation:
          'Fuerza de contacto entre dos superficies que se opone al deslizamiento y frena los objetos cotidianos.',
        everydayAnalogy:
          'Deslizar un zapato sobre asfalto rugoso vs. patinar sobre hielo liso.',
        documentExample:
          'Sin fricción entre tus tenis y el suelo no podrías caminar hacia adelante; resbalarías en el mismo lugar.',
        teachingTip:
          'Frota las manos rápido 5 segundos: el calor demuestra que la fricción transforma movimiento en energía térmica.',
        commonMisconception:
          'Ver la fricción siempre como "mala"; sin ella los autos no frenarían ni doblarían.',
        keyPoints: ['Siempre opuesta al deslizamiento.', 'Depende de la rugosidad y peso.', 'Permite caminar y frenar.'],
        connectsTo: ['n5'],
      },
      {
        id: 'n5',
        title: 'Segunda Ley: F = m · a',
        shortLabel: '2.ª Ley: F = m·a',
        stage: 3,
        simpleExplanation:
          'La aceleración que adquiere un objeto aumenta con la fuerza aplicada y disminuye si el objeto tiene más masa.',
        everydayAnalogy:
          'Empujar un carrito vacío es facilísimo; lleno de garrafones de agua acelera mucho más lento con la misma fuerza.',
        documentExample:
          'Una fuerza neta de 20 N sobre una caja de 4 kg produce una aceleración de 5 m/s².',
        teachingTip:
          'Usa números mentales redondos (10 N, 2 kg) antes de pasar a ejercicios largos.',
        commonMisconception:
          'Creer que si la fuerza es constante, la velocidad es constante (en realidad es constante la aceleración).',
        keyPoints: ['a = F_neta / m.', '1 Newton = 1 kg·m/s².', 'Dirección de a = dirección de F_neta.'],
        connectsTo: ['n6', 'n7'],
      },
      {
        id: 'n6',
        title: 'Acción y Reacción (3.ª Ley)',
        shortLabel: '3.ª Ley: Pares',
        stage: 4,
        simpleExplanation:
          'Toda interacción produce dos fuerzas de igual magnitud y sentidos contrarios, aplicadas siempre sobre dos objetos distintos.',
        everydayAnalogy:
          'En patines, si empujas una pared hacia adelante, la pared te empuja hacia atrás con exactamente la misma fuerza.',
        documentExample:
          'Al remar, la pala empuja el agua hacia atrás y el agua impulsa el bote hacia adelante.',
        teachingTip:
          'Infla un globo y suéltalo sin atarlo: el aire sale por atrás y el globo vuela hacia adelante.',
        commonMisconception:
          'Pensar que acción y reacción se anulan entre sí. ¡Nunca se anulan porque actúan en cuerpos distintos!',
        keyPoints: ['Ocurren simultáneamente.', 'Misma magnitud, sentido opuesto.', 'Actúan sobre cuerpos diferentes.'],
        connectsTo: ['n7'],
      },
      {
        id: 'n7',
        title: 'Propulsión de Cohetes en el Vacío',
        shortLabel: 'Cohetes y Vacío',
        stage: 4,
        simpleExplanation:
          'Un cohete no necesita aire afuera contra el cual empujar: expulsa gases a gran velocidad hacia atrás y los gases lo empujan hacia adelante.',
        everydayAnalogy:
          'Estar en una patineta y lanzar una mochila pesada hacia atrás: tú sales rodando hacia adelante.',
        documentExample:
          'La 3.ª Ley explica la propulsión orbital, mientras la 2.ª Ley explica por qué el cohete acelera más conforme quema combustible (pierde masa).',
        teachingTip:
          'Es la mejor prueba para comprobar si de verdad entendieron la 3.ª Ley.',
        commonMisconception:
          'Creer que los cohetes empujan contra la atmósfera o contra la plataforma de lanzamiento para subir.',
        keyPoints: ['No requiere atmósfera externa.', 'Interacción cohete ↔ gases.', 'Acelera más al perder masa.'],
        connectsTo: [],
      },
    ],
    quiz: [
      {
        id: 'nq1',
        question: 'Si empujas con la misma fuerza un carrito vacío y otro lleno de libros, ¿cuál acelera más?',
        options: [
          'El vacío, porque tiene menor masa (Segunda Ley: a = F/m)',
          'El lleno, porque la masa aumenta la velocidad',
          'Ambos aceleran exactamente igual',
          'Ninguno se mueve sin fricción cero',
        ],
        correctIndex: 0,
        explanation: 'A igual fuerza neta, menor masa produce mayor aceleración.',
        difficulty: 'basico',
      },
      {
        id: 'nq2',
        question: '¿Por qué un cohete espacial puede acelerar en el vacío donde no hay aire?',
        options: [
          'Porque expulsa gases hacia atrás y esos gases empujan al cohete hacia adelante (3.ª Ley)',
          'Porque el vacío tiene aire invisible oculto',
          'Porque la gravedad lo jala hacia arriba',
          'Porque la inercia crea combustible extra',
        ],
        correctIndex: 0,
        explanation: 'La pareja acción-reacción ocurre entre el cohete y sus propios gases expulsados.',
        difficulty: 'intermedio',
      },
      {
        id: 'nq3',
        question: 'Si acción y reacción son iguales y opuestas, ¿por qué los objetos sí logran moverse?',
        options: [
          'Porque actúan sobre cuerpos diferentes, no sobre el mismo objeto',
          'Porque la reacción llega 5 segundos tarde',
          'Porque la acción siempre es mayor que la reacción',
          'Porque solo ocurren en líquidos',
        ],
        correctIndex: 0,
        explanation: 'Una fuerza actúa sobre A y la otra sobre B, así que no se cancelan en un solo cuerpo.',
        difficulty: 'reto',
      },
      {
        id: 'nq4',
        question: '¿Cuál es la diferencia fundamental entre masa y peso?',
        options: [
          'La masa se mide en kg y no cambia de lugar; el peso es una fuerza gravitacional en Newtons',
          'Son exactamente sinónimos en física',
          'El peso se mide en kilogramos y la masa en metros',
          'La masa solo existe en la Tierra',
        ],
        correctIndex: 0,
        explanation: 'Tu masa es la misma en la Luna, pero tu peso cambia por la gravedad lunar.',
        difficulty: 'basico',
      },
      {
        id: 'nq5',
        question: 'Si aplicas una fuerza neta de 24 N a una caja de 6 kg, ¿qué aceleración adquiere?',
        options: ['4 m/s²', '144 m/s²', '18 m/s²', '0.25 m/s²'],
        correctIndex: 0,
        explanation: 'Por la Segunda Ley, a = F / m = 24 N / 6 kg = 4 m/s².',
        difficulty: 'basico',
      },
      {
        id: 'nq6',
        question: 'Un avión vuela en línea recta a velocidad constante de 800 km/h. ¿Cuánto vale la fuerza neta sobre él?',
        options: [
          'Cero, porque su velocidad no está cambiando (aceleración = 0)',
          '800 Newtons hacia adelante',
          'Infinita para vencer la inercia',
          'Igual a su masa al cuadrado',
        ],
        correctIndex: 0,
        explanation: 'El empuje equilibra al arrastre del aire y la sustentación equilibra al peso: fuerza neta = 0.',
        difficulty: 'reto',
      },
      {
        id: 'nq7',
        question: 'Si una mosca choca contra el parabrisas de un camión en marcha, ¿cuál recibe mayor fuerza de impacto?',
        options: [
          'Ambos reciben exactamente la misma magnitud de fuerza (3.ª Ley)',
          'La mosca recibe 1000 veces más fuerza',
          'El camión recibe más fuerza por ser grande',
          'Ninguno recibe fuerza',
        ],
        correctIndex: 0,
        explanation: 'La fuerza es igual por la 3.ª Ley; la mosca sufre un efecto drástico por tener masa diminuta (2.ª Ley).',
        difficulty: 'reto',
      },
      {
        id: 'nq8',
        question: '¿Qué ley explica por qué los pasajeros se van hacia adelante cuando un auto frena bruscamente?',
        options: [
          'Primera Ley (Inercia)',
          'Tercera Ley únicamente',
          'Ley de conservación del calor',
          'Ninguna ley física',
        ],
        correctIndex: 0,
        explanation: 'El cuerpo tiende a mantener la velocidad que traía antes de que el freno actuara sobre el auto.',
        difficulty: 'basico',
      },
      {
        id: 'nq9',
        question: '¿Qué papel cumple la fricción cuando caminas hacia adelante sobre el piso?',
        options: [
          'Empujas el piso hacia atrás y la fricción te impulsa hacia adelante',
          'Te jala hacia abajo impidiendo que des pasos',
          'Anula la gravedad terrestre',
          'Reduce tu masa corporal',
        ],
        correctIndex: 0,
        explanation: 'Sin fricción (como en hielo muy liso) tu pie resbalaría hacia atrás sin poder impulsarte.',
        difficulty: 'intermedio',
      },
      {
        id: 'nq10',
        question: 'Si duplicas tanto la fuerza neta como la masa de un cuerpo, ¿qué pasa con su aceleración?',
        options: [
          'Se mantiene exactamente igual',
          'Se duplica',
          'Se cuadruplica',
          'Se vuelve cero',
        ],
        correctIndex: 0,
        explanation: 'a = (2F) / (2m) = F / m, por lo tanto no cambia.',
        difficulty: 'intermedio',
      },
    ],
    matchPairs: [
      { id: 'nm1', term: 'Inercia', definition: 'Resistencia a cambiar el estado de movimiento', category: '1.ª Ley' },
      { id: 'nm2', term: 'F = m · a', definition: 'Relación entre fuerza, masa y aceleración', category: '2.ª Ley' },
      { id: 'nm3', term: 'Newton (N)', definition: 'Unidad de medida de la fuerza (kg·m/s²)', category: 'Unidad' },
      { id: 'nm4', term: 'Acción-Reacción', definition: 'Par de fuerzas iguales en cuerpos distintos', category: '3.ª Ley' },
      { id: 'nm5', term: 'Fricción', definition: 'Fuerza de contacto opuesta al deslizamiento', category: 'Fuerzas' },
      { id: 'nm6', term: 'Masa (kg)', definition: 'Medida de la inercia y cantidad de materia', category: 'Propiedad' },
    ],
    sequenceChallenge: {
      title: 'Análisis de un Choque Cotidiano con las 3 Leyes',
      instruction: 'Ordena la secuencia física al patear un balón en reposo.',
      steps: [
        { id: 'ns1', order: 1, title: 'Estado Inicial de Inercia', description: 'El balón permanece quieto en el césped porque la fuerza neta es cero.' },
        { id: 'ns2', order: 2, title: 'Interacción (Acción y Reacción)', description: 'Tu pie aplica fuerza al balón y el balón empuja tu pie en sentido opuesto.' },
        { id: 'ns3', order: 3, title: 'Aceleración (F = m·a)', description: 'Al ser mucho más liviano que tú, el balón acelera velozmente hacia la portería.' },
        { id: 'ns4', order: 4, title: 'Frenado por Fricción', description: 'El aire y el césped aplican una fuerza opuesta que detiene el balón.' },
      ],
    },
    clozeExercises: [
      {
        id: 'ncl1',
        beforeBlank: 'La tendencia de un cuerpo a mantener su reposo o velocidad constante se llama',
        blankAnswer: 'inercia',
        afterBlank: 'y define la Primera Ley de Newton.',
        hint: 'Por eso usamos cinturón de seguridad.',
      },
      {
        id: 'ncl2',
        beforeBlank: 'Según la Segunda Ley, la fuerza neta es igual al producto de la masa por la',
        blankAnswer: 'aceleración',
        afterBlank: 'medida en m/s².',
        hint: 'Cambio de velocidad en el tiempo.',
      },
      {
        id: 'ncl3',
        beforeBlank: 'La fuerza de acción y la fuerza de reacción actúan siempre sobre',
        blankAnswer: 'cuerpos',
        afterBlank: 'diferentes, por lo que no se cancelan.',
        hint: 'Objetos distintos en interacción.',
      },
      {
        id: 'ncl4',
        beforeBlank: 'La fuerza que se opone al deslizamiento entre dos superficies en contacto se llama',
        blankAnswer: 'fricción',
        afterBlank: 'y frena los objetos cotidianos.',
        hint: 'También genera calor al frotar las manos.',
      },
    ],
    trueFalseItems: [
      {
        id: 'ntf1',
        statement: 'Un objeto en movimiento necesita recibir una fuerza constante para no detenerse nunca en el espacio vacío.',
        isTrue: false,
        explanation: 'Falso: sin fricción en el vacío, mantendría velocidad constante por pura inercia.',
      },
      {
        id: 'ntf2',
        statement: 'La masa en kilogramos mide la inercia de un objeto y no cambia si viajas a la Luna.',
        isTrue: true,
        explanation: 'Verdadero: lo que cambia en la Luna es el peso debido a la menor gravedad.',
      },
      {
        id: 'ntf3',
        statement: 'Si un camión y un mosquito chocan, el mosquito ejerce menos fuerza sobre el camión que viceversa.',
        isTrue: false,
        explanation: 'Falso: por la 3.ª Ley, ambas fuerzas tienen exactamente la misma magnitud.',
      },
      {
        id: 'ntf4',
        statement: 'Un cuerpo con fuerza neta igual a cero puede estar moviéndose a velocidad constante en línea recta.',
        isTrue: true,
        explanation: 'Verdadero: fuerza neta cero implica aceleración cero, no necesariamente velocidad cero.',
      },
      {
        id: 'ntf5',
        statement: 'Con la misma fuerza neta, un objeto de menor masa adquiere mayor aceleración.',
        isTrue: true,
        explanation: 'Verdadero: a = F/m, por lo que masa y aceleración son inversamente proporcionales.',
      },
      {
        id: 'ntf6',
        statement: 'Un cohete no podría funcionar en el espacio porque no hay aire contra el cual empujar.',
        isTrue: false,
        explanation: 'Falso: el cohete empuja sus propios gases hacia atrás y los gases lo empujan hacia adelante.',
      },
    ],
    categorySortGame: {
      title: 'Asocia cada Situación con su Ley de Newton',
      instruction: 'Clasifica cada ejemplo real en 1.ª Ley (Inercia), 2.ª Ley (F = m·a) o 3.ª Ley (Acción y Reacción).',
      categories: [
        { id: 'cat1', name: '1.ª Ley: Inercia' },
        { id: 'cat2', name: '2.ª Ley: F = m·a' },
        { id: 'cat3', name: '3.ª Ley: Acción-Reacción' },
      ],
      items: [
        { id: 'ncs1', label: 'El cinturón te retiene al frenar', categoryId: 'cat1', hint: 'Tu cuerpo quería seguir moviéndose.' },
        { id: 'ncs2', label: 'Jalar rápido un mantel sin tirar platos', categoryId: 'cat1', hint: 'Los platos quieren quedar en reposo.' },
        { id: 'ncs3', label: 'Polvo que cae al sacudir una alfombra', categoryId: 'cat1', hint: 'Las partículas conservan su posición.' },
        { id: 'ncs4', label: 'Carrito vacío acelera más que lleno', categoryId: 'cat2', hint: 'Depende de la masa del objeto.' },
        { id: 'ncs5', label: 'Patear fuerte hace acelerar más el balón', categoryId: 'cat2', hint: 'Más fuerza produce más aceleración.' },
        { id: 'ncs6', label: 'Tráiler tarda más en frenar que bici', categoryId: 'cat2', hint: 'Mayor masa exige mayor fuerza.' },
        { id: 'ncs7', label: 'Globo desinflándose que sale volando', categoryId: 'cat3', hint: 'Aire atrás, globo adelante.' },
        { id: 'ncs8', label: 'Remo empujando agua para avanzar', categoryId: 'cat3', hint: 'Interacción en sentidos opuestos.' },
        { id: 'ncs9', label: 'Retroceso de manguera de bomberos', categoryId: 'cat3', hint: 'Chorro sale, manguera empuja atrás.' },
      ],
    },
    flashcards: [
      {
        id: 'nf1',
        front: '¿Qué dice en una frase la Primera Ley de Newton?',
        back: 'Un cuerpo no cambia su velocidad ni dirección a menos que actúe sobre él una fuerza neta externa.',
        analogy: 'En el espacio exterior, una pelota lanzada seguiría viajando para siempre.',
        hint: 'Inercia = seguir haciendo lo mismo.',
      },
      {
        id: 'nf2',
        front: 'Si aplicas 30 N a un objeto de 6 kg, ¿cuál es su aceleración?',
        back: '5 m/s², porque a = F / m = 30 / 6.',
        analogy: 'Repartir la fuerza entre cada kilogramo de masa.',
        hint: 'Divide Fuerza entre Masa.',
      },
      {
        id: 'nf3',
        front: '¿Por qué no se anulan acción y reacción?',
        back: 'Porque actúan sobre dos objetos distintos, mientras que la fuerza neta se calcula sobre un solo objeto.',
        analogy: 'Si tú empujas la pared, la fuerza sobre ti y la fuerza sobre la pared afectan a cosas distintas.',
        hint: 'Cuenta cuántos cuerpos participan.',
      },
      {
        id: 'nf4',
        front: '¿Qué mide la masa y qué mide el peso?',
        back: 'Masa (kg) mide inercia y cantidad de materia; Peso (N) mide fuerza de gravedad sobre esa masa.',
        analogy: 'Tu maleta tiene los mismos kg aquí y en Marte, pero allá pesa distinto.',
        hint: 'Unidades: kg vs. Newtons.',
      },
    ],
    feynmanGuide: {
      childLevelExplanation:
        'Las cosas son tercas (1.ª Ley), entre más pesadas son más cuesta empujarlas (2.ª Ley), y si empujas algo, eso te empuja igual de regreso (3.ª Ley).',
      socraticQuestions: [
        'Si una mosca choca contra el parabrisas de un camión, ¿cuál recibe mayor fuerza de impacto: la mosca o el camión?',
        '¿Por qué en una pista de hielo cuesta tanto frenar o girar?',
      ],
      realWorldHook: 'Demostración de 10 segundos en el escritorio con moneda, tarjeta y vaso.',
    },
    teachingMethods: [
      {
        id: 'ntm1',
        name: 'Laboratorio de Bolsillo en 3 Estaciones',
        durationMinutes: 15,
        bestFor: 'Grupos pequeños rotando cada 5 minutos',
        objective: 'Comprobar las 3 leyes con objetos de costo cero.',
        steps: [
          'Estación 1 (Inercia): Vaso, tarjeta y moneda.',
          'Estación 2 (F = m·a): Carrito ligero vs. libro pesado impulsados por la misma liga elástica.',
          'Estación 3 (Acción-Reacción): Globo inflado liberado sobre un popote y cuerda.',
        ],
        materialsNeeded: ['Vaso y moneda', 'Liga y carrito', 'Globo e hilo'],
      },
    ],
    lessonPlanActs: [
      {
        actNumber: 1,
        title: 'Truco de la Moneda',
        durationMinutes: 6,
        teacherAction: 'Realiza la prueba de la tarjeta y pide explicación antes de nombrar la ley.',
        studentActivity: 'Formulan hipótesis en voz alta.',
      },
      {
        actNumber: 2,
        title: 'Estaciones + Juegos de Clasificación',
        durationMinutes: 22,
        teacherAction: 'Guía las 3 estaciones prácticas y proyecta el mapa de 7 conceptos.',
        studentActivity: 'Resuelven el clasificador por leyes y la trivia.',
      },
      {
        actNumber: 3,
        title: 'Desafío de la Mosca y el Camión',
        durationMinutes: 12,
        teacherAction: 'Aclara que la fuerza es igual (3.ª Ley), pero la aceleración cambia por la masa (2.ª Ley).',
        studentActivity: 'Responden ticket de salida.',
      },
    ],
    exitTicketQuestions: [
      '¿Por qué sientes que te vas hacia atrás cuando el auto arranca rápido?',
      'Explica por qué acción y reacción no se cancelan entre sí.',
    ],
  },
];
