/* Geração e correção dos exercícios. Roda inteiro no navegador. */

const OPERATIONS = {
  "soma":          { symbol: "+", calculate: (a, b) => a + b },
  "subtração":     { symbol: "-", calculate: (a, b) => a - b },
  "multiplicação": { symbol: "×", calculate: (a, b) => a * b },
  "divisão":       { symbol: "÷", calculate: (a, b) => Math.floor(a / b) },
};

const EXERCISE_TYPES = [...Object.keys(OPERATIONS), "decomposição", "problema", "interpretação"];
// Interpretação aparece com mais frequência na prática, pois é a maior dificuldade.
const EXERCISE_WEIGHTS = [1, 1, 1, 1, 1, 1, 3];

const CORRECT_MESSAGES = [
  "Uau, você arrasou! 🎀",
  "Perfeito! Você é incrível! 🌸",
  "Isso mesmo! Continue assim! ⭐",
  "Que inteligente! Mandou bem! 🎉",
  "Acertou em cheio! Orgulho total! 💖",
];

const WRONG_MESSAGES = [
  "Quase lá! Não desiste, você consegue! 🌷",
  "Errinho sem querer! Bora tentar o próximo! 🍭",
  "Foi mal dessa vez, mas você vai arrasar no próximo! 🎀",
  "Não tem problema! Aprender faz parte! 💪",
  "Continua tentando, você está indo muito bem! 🌸",
];

/* ══ SORTEIO ══ */
function randint(low, high) {
  return low + Math.floor(Math.random() * (high - low + 1));
}

function choice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function sample(list, amount) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, amount);
}

function weightedChoice(items, weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll < 0) return items[i];
  }
  return items[items.length - 1];
}

function shuffle(list) {
  return sample(list, list.length);
}

/* ══ EXERCÍCIOS ══ */
function generateExercise(allowedTypes = []) {
  const types = [];
  const weights = [];
  EXERCISE_TYPES.forEach((type, index) => {
    if (allowedTypes.length === 0 || allowedTypes.includes(type)) {
      types.push(type);
      weights.push(EXERCISE_WEIGHTS[index]);
    }
  });
  return generateExerciseByType(weightedChoice(types, weights));
}

function generateExerciseByType(exerciseType) {
  if (exerciseType === "decomposição") return generateDecompositionExercise();
  if (exerciseType === "problema") return generateWordProblem();
  if (exerciseType === "interpretação") return generateInterpretationExercise();
  return generateOperationExercise(exerciseType);
}

function generateDecompositionExercise() {
  const firstNumber = randint(1000, 99999);
  const terms = decomposeNumber(firstNumber);
  return {
    first_number: firstNumber,
    second_number: null,
    operation_name: "decomposição",
    symbol: "=",
    correct_answer: terms.join("+"),
    correct_terms: terms,
    question_text: null,
    badge_text: "decomposição",
  };
}

function generateOperationExercise(operationName) {
  const { symbol, calculate } = OPERATIONS[operationName];
  let firstNumber, secondNumber;

  if (operationName === "soma") {
    firstNumber = randint(100, 9999);
    secondNumber = randint(100, 9999);
  } else if (operationName === "subtração") {
    firstNumber = randint(200, 9999);
    secondNumber = randint(1, firstNumber - 1);
  } else if (operationName === "multiplicação") {
    firstNumber = randint(2, 999);
    secondNumber = randint(2, 9);
  } else { // divisão
    secondNumber = randint(2, 10);
    firstNumber = secondNumber * randint(10, 999);
  }

  return {
    first_number: firstNumber,
    second_number: secondNumber,
    operation_name: operationName,
    symbol,
    correct_answer: calculate(firstNumber, secondNumber),
    correct_terms: [],
    question_text: null,
    badge_text: operationName,
  };
}

function generateWordProblem() {
  const operationName = choice(Object.keys(OPERATIONS));
  const { symbol, calculate } = OPERATIONS[operationName];

  const people = ["Maria", "João", "Ana", "Pedro", "Lia", "Davi", "Sofia", "Lucas"];
  const items = [
    ["livros", "quantos livros", "comprou", "emprestou"],
    ["maçãs", "quantas maçãs", "comprou", "comeu"],
    ["figurinhas", "quantas figurinhas", "ganhou", "deu"],
    ["lápis", "quantos lápis", "comprou", "usou"],
    ["adesivos", "quantos adesivos", "ganhou", "colou"],
    ["balas", "quantas balas", "comprou", "comeu"],
  ];
  const person = choice(people);
  const [itemPlural, itemQuestion, gainVerb, lossVerb] = choice(items);
  const question = capitalize(itemQuestion);
  let firstNumber, secondNumber, questionText;

  if (operationName === "soma") {
    firstNumber = randint(3, 35);
    secondNumber = randint(2, 35);
    questionText = `${person} tinha ${firstNumber} ${itemPlural} e ${gainVerb} mais ` +
      `${secondNumber}. ${question} ${person} tem agora?`;
  } else if (operationName === "subtração") {
    firstNumber = randint(8, 60);
    secondNumber = randint(2, firstNumber - 1);
    questionText = `${person} tinha ${firstNumber} ${itemPlural} e ${lossVerb} ${secondNumber}. ` +
      `Com ${itemQuestion} ${person} ficou?`;
  } else if (operationName === "multiplicação") {
    firstNumber = randint(2, 12);
    secondNumber = randint(2, 9);
    questionText = `${person} organizou ${firstNumber} grupos com ${secondNumber} ` +
      `${itemPlural} em cada grupo. ${question} são ao todo?`;
  } else { // divisão
    secondNumber = randint(2, 9);
    firstNumber = secondNumber * randint(2, 12);
    questionText = `${person} dividiu ${firstNumber} ${itemPlural} igualmente entre ` +
      `${secondNumber} pessoas. ${question} cada pessoa recebeu?`;
  }

  return {
    first_number: firstNumber,
    second_number: secondNumber,
    operation_name: operationName,
    symbol,
    correct_answer: calculate(firstNumber, secondNumber),
    correct_terms: [],
    question_text: questionText,
    badge_text: "problema",
  };
}

function generateInterpretationExercise() {
  const [questionText, answer] = generateInterpretation();
  return {
    first_number: answer,
    second_number: null,
    operation_name: "interpretação",
    symbol: "=",
    correct_answer: answer,
    correct_terms: [],
    question_text: questionText,
    badge_text: "interpretação",
  };
}

function decomposeNumber(number) {
  const digits = String(number).split("").map(Number);
  return digits
    .map((digit, index) => digit * 10 ** (digits.length - 1 - index))
    .filter((term) => term > 0);
}

function buildExamPlan() {
  return shuffle([
    ...Object.keys(OPERATIONS),
    "problema", "interpretação", "interpretação",
    "decomposição",
  ]);
}

/* ══ CORREÇÃO ══ */
function parseWholeNumber(value) {
  const text = String(value).trim();
  return /^-?\d+$/.test(text) ? Number(text) : null;
}

function normalizeDecompositionAnswer(answer) {
  const parts = Array.isArray(answer)
    ? answer.map((part) => String(part).trim())
    : String(answer).replace(/ /g, "").split("+");

  if (parts.length === 0 || parts.some((part) => part === "")) return null;
  const terms = parts.map(parseWholeNumber);
  return terms.includes(null) ? null : terms;
}

/** Devolve { correct, correct_answer, message } ou null se a resposta for inválida. */
function checkAnswer(exercise, answer) {
  let isCorrect;

  if (exercise.operation_name === "decomposição") {
    const terms = normalizeDecompositionAnswer(answer);
    if (terms === null) return null;
    isCorrect = terms.length === exercise.correct_terms.length &&
      terms.every((term, index) => term === exercise.correct_terms[index]);
  } else {
    const given = parseWholeNumber(answer);
    if (given === null) return null;
    isCorrect = given === exercise.correct_answer;
  }

  return {
    correct: isCorrect,
    correct_answer: exercise.correct_answer,
    message: choice(isCorrect ? CORRECT_MESSAGES : WRONG_MESSAGES),
  };
}

/* ══ PROBLEMAS DE INTERPRETAÇÃO ══
   Cada modelo devolve [enunciado, resposta] ou null quando os números sorteados
   não servem (por exemplo, uma divisão que não daria exata). Nesse caso outro
   sorteio é feito. */

// [nome, pronome]
const CHARACTERS = [
  ["Hello Kitty", "ela"],
  ["Kuromi", "ela"],
  ["My Melody", "ela"],
  ["Supergirl", "ela"],
  ["Batman", "ele"],
  ["Superman", "ele"],
  ["Cinnamoroll", "ele"],
  ["Pompompurin", "ele"],
];

// [plural, gênero]
const THINGS = [
  ["adesivos", "m"],
  ["figurinhas", "f"],
  ["balas", "f"],
  ["biscoitos", "m"],
  ["lápis", "m"],
  ["laços", "m"],
  ["cupcakes", "m"],
  ["bombons", "m"],
  ["canetas", "f"],
  ["maçãs", "f"],
  ["pirulitos", "m"],
  ["bolinhas de gude", "f"],
  ["cristais brilhantes", "m"],
  ["chaveirinhos", "m"],
];

// [plural, singular, gênero]
const CONTAINERS = [
  ["caixas", "caixa", "f"],
  ["pacotes", "pacote", "m"],
  ["cartelas", "cartela", "f"],
  ["potes", "pote", "m"],
  ["sacolas", "sacola", "f"],
  ["bandejas", "bandeja", "f"],
];

// [nome com artigo, preço mínimo, preço máximo]
const SINGLE_ITEMS = [
  ["uma mochila", 30, 70],
  ["uma boneca", 25, 60],
  ["um livro", 20, 45],
  ["um estojo", 12, 30],
  ["uma lanterna", 15, 35],
  ["uma capa", 30, 55],
  ["um jogo de tabuleiro", 35, 80],
  ["uma lancheira", 18, 40],
];

// [plural, gênero, preço mínimo, preço máximo]
const MULTI_ITEMS = [
  ["cadernos", "m", 5, 12],
  ["canetas coloridas", "f", 2, 6],
  ["cartelas de adesivos", "f", 4, 15],
  ["sucos", "m", 4, 8],
  ["sanduíches", "m", 9, 16],
  ["chaveiros", "m", 3, 9],
  ["borrachas", "f", 2, 5],
  ["gibis", "m", 6, 12],
];

const EXERCISES = [["flexões", "f"], ["abdominais", "m"], ["polichinelos", "m"], ["agachamentos", "m"]];

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function quantos(gender) {
  return gender === "m" ? "Quantos" : "Quantas";
}

function cadaUm(gender) {
  return gender === "m" ? "cada um" : "cada uma";
}

function reais(value) {
  return `R$ ${value},00`;
}

function characters(amount) {
  return sample(CHARACTERS, amount);
}

/** Sorteia quanto retirar de `total` para o restante dividir exato por `divisor`. */
function pickRemoval(total, divisor, low, high) {
  const options = [];
  for (let removed = low; removed <= high; removed++) {
    if (removed < total && (total - removed) % divisor === 0) options.push(removed);
  }
  return options.length ? choice(options) : null;
}

function roundUpPayment(cost) {
  for (const note of [10, 20, 50, 100, 200]) {
    if (note > cost) return note;
  }
  return Math.ceil((cost + 1) / 50) * 50;
}

function guardarEmEnvelopes() {
  const [[name, pronoun]] = characters(1);
  const [thing, gender] = choice(THINGS);
  const [container, containerOne] = choice(CONTAINERS);
  const groups = randint(2, 6), perGroup = randint(6, 15), envelopes = randint(2, 6);
  const total = groups * perGroup;
  const given = pickRemoval(total, envelopes, 3, 20);
  if (given === null) return null;
  const text = `${name} estava organizando ${thing}. ${capitalize(pronoun)} tinha ${groups} ${container} ` +
    `com ${perGroup} ${thing} em cada ${containerOne}. Depois, deu ${given} ${thing} para ` +
    `um amigo e guardou o restante em ${envelopes} envelopes, com a mesma quantidade em ` +
    `cada envelope. ${quantos(gender)} ${thing} ficaram em cada envelope?`;
  return [text, (total - given) / envelopes];
}

function duasPessoasPegaram() {
  const [[name], [friend1], [friend2]] = characters(3);
  const [thing, gender] = choice(THINGS);
  const [container, containerOne] = choice(CONTAINERS);
  const groups = randint(3, 8), perGroup = randint(6, 12);
  const total = groups * perGroup;
  const first = randint(2, 12), second = randint(2, 12);
  if (first + second >= total) return null;
  const text = `${name} comprou ${groups} ${container} de ${thing}. Cada ${containerOne} tinha ` +
    `${perGroup} ${thing}. Mais tarde, ${friend1} pegou ${first} ${thing} e ${friend2} ` +
    `pegou ${second}. ${quantos(gender)} ${thing} sobraram?`;
  return [text, total - first - second];
}

function compraESobra() {
  const [[name, pronoun]] = characters(1);
  const [item, low, high] = choice(SINGLE_ITEMS);
  const [items, gender, itemLow, itemHigh] = choice(MULTI_ITEMS);
  const price = randint(low, high), amount = randint(2, 5), unitPrice = randint(itemLow, itemHigh);
  const cost = price + amount * unitPrice;
  const money = roundUpPayment(cost) + choice([0, 10, 20]);
  const text = `${name} tinha ${reais(money)} para fazer compras. ${capitalize(pronoun)} comprou ` +
    `${item} por ${reais(price)} e ${amount} ${items} de ${reais(unitPrice)} ` +
    `${cadaUm(gender)}. Quantos reais sobraram?`;
  return [text, money - cost];
}

function separarAntesDeDistribuir() {
  const [[name, pronoun]] = characters(1);
  const [thing, gender] = choice(THINGS);
  const kids = randint(3, 9), perKid = randint(3, 12), kept = randint(5, 25);
  const total = kids * perKid + kept;
  const text = `${name} levou ${total} ${thing} para distribuir igualmente entre ${kids} crianças. ` +
    `Antes da distribuição, ${pronoun} separou ${kept} ${thing} para guardar em casa. ` +
    `${quantos(gender)} ${thing} cada criança recebeu?`;
  return [text, perKid];
}

function festaBandejas() {
  const [[name, pronoun]] = characters(1);
  const [food, gender] = choice([["cupcakes", "m"], ["brigadeiros", "m"], ["pães de queijo", "m"], ["coxinhas", "f"]]);
  const trays = randint(3, 6), perTray = randint(8, 16), friends = randint(2, 6);
  const total = trays * perTray;
  const eaten = pickRemoval(total, friends, 10, total - friends);
  if (eaten === null) return null;
  const text = `${name} preparou ${trays} bandejas com ${perTray} ${food} em cada uma. Na festa, ` +
    `foram ${gender === "m" ? "comidos" : "comidas"} ${eaten} ${food}. Depois, ${pronoun} dividiu ` +
    `${gender === "m" ? "os" : "as"} ${food} que sobraram ` +
    `igualmente entre ${friends} amigos. ${quantos(gender)} ${food} cada amigo recebeu?`;
  return [text, (total - eaten) / friends];
}

function treinoTresDias() {
  const [[name, pronoun]] = characters(1);
  const [exercise, gender] = choice(EXERCISES);
  const first = randint(5, 20) * 2;
  const [factorWord, factor] = choice([["o dobro", 2], ["o triplo", 3]]);
  const second = first * factor;
  let third, thirdText;
  if (Math.random() < 0.5) {
    const less = randint(3, second - 1);
    third = second - less;
    thirdText = `fez ${less} ${exercise} a menos que no segundo dia`;
  } else {
    const more = randint(3, 15);
    third = first + more;
    thirdText = `fez ${more} ${exercise} a mais que no primeiro dia`;
  }
  const text = `${name} treinou durante 3 dias. No primeiro dia, ${pronoun} fez ${first} ${exercise}. ` +
    `No segundo dia, fez ${factorWord} do primeiro dia. No terceiro dia, ${thirdText}. ` +
    `${quantos(gender)} ${exercise} ${pronoun} fez ao todo?`;
  return [text, first + second + third];
}

function estanteLivros() {
  const [[name, pronoun]] = characters(1);
  const perShelf = randint(5, 12), shelves = randint(3, 8);
  const total = perShelf * shelves;
  const removed = randint(3, Math.min(15, total - 1));
  const reason = choice(["estavam repetidos", "estavam rasgados", "eram emprestados"]);
  const text = `${name} organizou livros em uma estante. ${capitalize(pronoun)} colocou ${perShelf} ` +
    `livros em cada uma das ${shelves} prateleiras. Depois, percebeu que ${removed} livros ` +
    `${reason} e retirou esses livros. Quantos livros ficaram na estante?`;
  return [text, total - removed];
}

function deuEComprouMais() {
  const [[name, pronoun]] = characters(1);
  const [thing, gender] = choice(THINGS);
  const [container, containerOne] = choice(CONTAINERS);
  const groups = randint(2, 6), perGroup = randint(5, 12);
  const total = groups * perGroup;
  const given = randint(2, Math.min(12, total - 1)), bought = randint(4, 20);
  const text = `${name} comprou ${groups} ${container} de ${thing}. Cada ${containerOne} tinha ` +
    `${perGroup} ${thing}. No caminho, ${pronoun} deu ${given} ${thing} para algumas ` +
    `crianças e depois comprou mais ${bought}. Com ${quantos(gender).toLowerCase()} ${thing} ` +
    `${pronoun} ficou?`;
  return [text, total - given + bought];
}

function usouEComprouPacotes() {
  const [[name, pronoun]] = characters(1);
  const [thing, gender] = choice(THINGS);
  const start = randint(25, 90);
  const used = randint(5, start - 5);
  const packs = randint(2, 6), perPack = randint(4, 10);
  const text = `${name} tinha ${start} ${thing}. ${capitalize(pronoun)} usou ${used} ${thing} para ` +
    `decorar caixas de presente. Depois, comprou mais ${packs} pacotes com ${perPack} ` +
    `${thing} em cada pacote. Com ${quantos(gender).toLowerCase()} ${thing} ${pronoun} ficou?`;
  return [text, start - used + packs * perPack];
}

function dividirEmCofres() {
  const [[name, pronoun]] = characters(1);
  const [items, gender, itemLow, itemHigh] = choice(MULTI_ITEMS);
  const [item, low, high] = choice(SINGLE_ITEMS);
  const amount = randint(2, 4), unitPrice = randint(itemLow, itemHigh), price = randint(low, high);
  const safes = randint(2, 5), perSafe = randint(3, 20);
  const money = amount * unitPrice + price + safes * perSafe;
  const text = `${name} tinha ${reais(money)}. ${capitalize(pronoun)} comprou ${amount} ${items} por ` +
    `${reais(unitPrice)} ${cadaUm(gender)} e ${item} por ${reais(price)}. Depois da compra, ` +
    `dividiu o dinheiro que sobrou igualmente em ${safes} cofrinhos. Quantos reais ficaram ` +
    `em cada cofrinho?`;
  return [text, perSafe];
}

function arrecadacaoDupla() {
  const [[name1], [name2]] = characters(2);
  const thing = choice(["brinquedos", "livros", "agasalhos", "jogos"]);
  const first = randint(15, 60), second = randint(15, 60), rooms = randint(3, 6);
  const broken = pickRemoval(first + second, rooms, 2, 12);
  if (broken === null) return null;
  const text = `${name1} e ${name2} arrecadaram ${thing} para uma escola. ${name1} arrecadou ${first} ` +
    `${thing}, e ${name2} arrecadou ${second}. Eles separaram ${broken} ${thing} estragados ` +
    `e dividiram o restante igualmente entre ${rooms} salas. Quantos ${thing} cada sala ` +
    `recebeu?`;
  return [text, (first + second - broken) / rooms];
}

function colouEDeu() {
  const [[name, pronoun]] = characters(1);
  const packs = randint(3, 8), perPack = randint(5, 10);
  const total = packs * perPack;
  const glued = randint(5, Math.floor(total / 2));
  const given = randint(2, total - glued - 1);
  const text = `${name} comprou ${packs} pacotinhos de figurinhas. Cada pacotinho tinha ${perPack} ` +
    `figurinhas. ${capitalize(pronoun)} colou ${glued} figurinhas no álbum e deu ${given} ` +
    `para a irmã. Quantas figurinhas ainda ficaram com ${pronoun}?`;
  return [text, total - glued - given];
}

function montarKits() {
  const [[name, pronoun], [friend]] = characters(2);
  const [thing] = choice(THINGS);
  const kitWord = choice(["kit", "saquinho", "pacotinho"]);
  const perKit = randint(3, 8), kits = randint(8, 16);
  const given = randint(2, kits - 2);
  const text = `${name} tinha ${perKit * kits} ${thing} e colocou ${perKit} ${thing} em cada ` +
    `${kitWord}. Depois, entregou ${given} ${kitWord}s para ${friend}. Quantos ${kitWord}s ` +
    `ainda ficaram com ${pronoun}?`;
  return [text, kits - given];
}

function calcularTroco() {
  const [[name, pronoun]] = characters(1);
  const [[item1, low1, high1], [item2, low2, high2]] = sample(SINGLE_ITEMS, 2);
  const [items, gender, itemLow, itemHigh] = choice(MULTI_ITEMS);
  const price1 = randint(low1, high1), price2 = randint(low2, high2);
  const amount = randint(2, 4), unitPrice = randint(itemLow, itemHigh);
  const cost = price1 + price2 + amount * unitPrice;
  const paid = roundUpPayment(cost);
  const text = `${name} comprou ${item1} por ${reais(price1)}, ${item2} por ${reais(price2)} e ${amount} ` +
    `${items} por ${reais(unitPrice)} ${cadaUm(gender)}. ${capitalize(pronoun)} pagou com ` +
    `${reais(paid)}. Quantos reais ${pronoun} recebeu de troco?`;
  return [text, paid - cost];
}

function conferirTroco() {
  const [[name, pronoun]] = characters(1);
  const [[items1, gender1, low1, high1], [items2, gender2, low2, high2]] = sample(MULTI_ITEMS, 2);
  const amount1 = randint(2, 4), price1 = randint(low1, high1);
  const amount2 = randint(2, 4), price2 = randint(low2, high2);
  const cost = amount1 * price1 + amount2 * price2;
  const paid = roundUpPayment(cost);
  const change = paid - cost;
  let givenChange = change + choice([-3, -2, -1, 0, 1, 2, 3]);
  if (givenChange <= 0) givenChange = change;
  const text = `${name} comprou ${amount1} ${items1} por ${reais(price1)} ${cadaUm(gender1)} e ` +
    `${amount2} ${items2} por ${reais(price2)} ${cadaUm(gender2)}. ${capitalize(pronoun)} ` +
    `pagou com ${reais(paid)} e o caixa devolveu ${reais(givenChange)} de troco. ` +
    `Confira a conta: qual é o troco correto, em reais?`;
  return [text, change];
}

function separarEGuardarEmCaixas() {
  const [[name, pronoun]] = characters(1);
  const [thing, gender] = choice(THINGS);
  const boxes = randint(3, 8), perBox = randint(4, 15), kept = randint(5, 25);
  const text = `${name} encontrou ${boxes * perBox + kept} ${thing}. ${capitalize(pronoun)} guardou ` +
    `${kept} ${thing} em uma caixa especial. Depois, dividiu o restante igualmente entre ` +
    `${boxes} caixas pequenas. ${quantos(gender)} ${thing} ficaram em cada caixa pequena?`;
  return [text, perBox];
}

function moedasEmPacotes() {
  const [[name, pronoun], [friend]] = characters(2);
  const perPack = randint(3, 8), packs = randint(8, 18), separated = randint(5, 20);
  const given = randint(2, packs - 2);
  const text = `${name} tinha ${perPack * packs + separated} moedas. ${capitalize(pronoun)} separou ` +
    `${separated} moedas para consertar um brinquedo. Com o restante, montou pacotes com ` +
    `${perPack} moedas em cada pacote. Depois, entregou ${given} pacotes para ${friend}. ` +
    `Quantos pacotes ficaram com ${pronoun}?`;
  return [text, packs - given];
}

function paginasCompletas() {
  const [[name, pronoun]] = characters(1);
  const packs = randint(3, 8), perPack = randint(4, 8), won = randint(5, 20), perPage = randint(6, 9);
  const total = packs * perPack + won;
  const text = `${name} comprou ${packs} pacotes de figurinhas. Cada pacote tinha ${perPack} ` +
    `figurinhas. Depois, ganhou mais ${won} figurinhas. ${capitalize(pronoun)} colocou ` +
    `${perPage} figurinhas em cada página do álbum. Quantas páginas completas ` +
    `${pronoun} conseguiu preencher?`;
  return [text, Math.floor(total / perPage)];
}

function quantosAMais() {
  const [[name1], [name2]] = characters(2);
  const [thing, gender] = choice(THINGS);
  const packs1 = randint(4, 9), perPack1 = randint(6, 12);
  const packs2 = randint(2, 6), perPack2 = randint(4, 10);
  const total1 = packs1 * perPack1, total2 = packs2 * perPack2;
  if (total1 <= total2) return null;
  const text = `${name1} comprou ${packs1} pacotes com ${perPack1} ${thing} em cada um. ${name2} ` +
    `comprou ${packs2} pacotes com ${perPack2} ${thing} em cada um. ` +
    `${quantos(gender)} ${thing} ${name1} tem a mais que ${name2}?`;
  return [text, total1 - total2];
}

function dobroTriploJuntos() {
  const [[name1], [name2], [name3]] = characters(3);
  const [thing, gender] = choice(THINGS);
  const first = randint(6, 25);
  const [factorWord, factor] = choice([["o dobro", 2], ["o triplo", 3]]);
  const second = first * factor;
  const less = randint(2, second - 2);
  const text = `${name1} tem ${first} ${thing}. ${name2} tem ${factorWord} de ${thing} de ${name1}. ` +
    `${name3} tem ${less} ${thing} a menos que ${name2}. ${quantos(gender)} ${thing} os três ` +
    `têm juntos?`;
  return [text, first + second + (second - less)];
}

function vansNecessarias() {
  const [[name]] = characters(1);
  const [vehicle, vehicleOne, low, high] = choice([["vans", "van", 8, 15], ["carros", "carro", 4, 5], ["barcos", "barco", 6, 12]]);
  const capacity = randint(low, high);
  let people = randint(capacity * 3, capacity * 9);
  if (people % capacity === 0) people += randint(1, capacity - 1);
  const text = `${name} vai levar ${people} amigos para um passeio. Cada ${vehicleOne} leva no ` +
    `máximo ${capacity} pessoas. Quantos ${vehicle} são necessários para levar todos os ` +
    `amigos? (Lembre: ninguém pode ficar para trás!)`;
  return [text, Math.ceil(people / capacity)];
}

function precoDeCada() {
  const [[name, pronoun]] = characters(1);
  const [items, gender, itemLow, itemHigh] = choice(MULTI_ITEMS);
  const [item, low, high] = choice(SINGLE_ITEMS);
  const amount = randint(2, 6), unitPrice = randint(itemLow, itemHigh), price = randint(low, high);
  const text = `${name} gastou ${reais(amount * unitPrice + price)} ao todo. ${capitalize(pronoun)} ` +
    `comprou ${item} por ${reais(price)} e ${amount} ${items} iguais. Quantos reais custou ` +
    `${cadaUm(gender)} ${gender === "m" ? "dos" : "das"} ${items}?`;
  return [text, unitPrice];
}

function economizarSemanas() {
  const [[name, pronoun]] = characters(1);
  const [item, low, high] = choice(SINGLE_ITEMS);
  const perWeek = randint(5, 15), weeks = randint(4, 10);
  const saved = perWeek * weeks;
  if (saved <= low) return null;
  const price = randint(low, Math.min(high, saved - 1));
  const text = `${name} guardou ${reais(perWeek)} por semana durante ${weeks} semanas. Depois, ` +
    `${pronoun} comprou ${item} por ${reais(price)}. Quantos reais sobraram?`;
  return [text, saved - price];
}

function paginasDoLivro() {
  const [[name, pronoun]] = characters(1);
  const perDay = randint(6, 20), days = randint(3, 7);
  const left = randint(10, 80);
  const chapters = randint(8, 20);
  const text = `${name} ganhou um livro com ${perDay * days + left} páginas e ${chapters} capítulos. ` +
    `${capitalize(pronoun)} leu ${perDay} páginas por dia durante ${days} dias. Quantas ` +
    `páginas ainda faltam para ${pronoun} terminar o livro?`;
  return [text, left];
}

function saquinhosLembrancinha() {
  const [[name, pronoun], [friend]] = characters(2);
  const age = randint(8, 12);
  const perBag = randint(4, 9), bags = randint(8, 15);
  const given = randint(2, bags - 2);
  const text = `${name} vai fazer ${age} anos e preparou lembrancinhas para a festa. ` +
    `${capitalize(pronoun)} tinha ${perBag * bags} balas e colocou ${perBag} balas em ` +
    `cada saquinho. Depois, deu ${given} saquinhos para ${friend} distribuir. Quantos ` +
    `saquinhos ainda sobraram?`;
  return [text, bags - given];
}

const TEMPLATES = [
  guardarEmEnvelopes,
  duasPessoasPegaram,
  compraESobra,
  separarAntesDeDistribuir,
  festaBandejas,
  treinoTresDias,
  estanteLivros,
  deuEComprouMais,
  usouEComprouPacotes,
  dividirEmCofres,
  arrecadacaoDupla,
  colouEDeu,
  montarKits,
  calcularTroco,
  conferirTroco,
  separarEGuardarEmCaixas,
  moedasEmPacotes,
  paginasCompletas,
  quantosAMais,
  dobroTriploJuntos,
  vansNecessarias,
  precoDeCada,
  economizarSemanas,
  paginasDoLivro,
  saquinhosLembrancinha,
];

function generateInterpretation() {
  const template = choice(TEMPLATES);
  let result = template();
  while (result === null) result = template();
  return result;
}

if (typeof module !== "undefined") {
  module.exports = { TEMPLATES, EXERCISE_TYPES, generateExercise, generateExerciseByType, buildExamPlan, checkAnswer };
}
