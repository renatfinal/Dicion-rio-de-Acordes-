export const NOME_NOTA_INDICE: Record<string, number> = {
  "C": 0, "B#": 0, "Dbb": 0,
  "C#": 1, "Db": 1,
  "D": 2, "C##": 2, "Ebb": 2,
  "D#": 3, "Eb": 3,
  "E": 4, "Fb": 4, "D##": 4,
  "F": 5, "E#": 5,
  "F#": 6, "Gb": 6,
  "G": 7, "F##": 7, "Abb": 7,
  "G#": 8, "Ab": 8,
  "A": 9, "G##": 9,
  "A#": 10, "Bb": 10,
  "B": 11, "Cb": 11, "A##": 11
};

export const INDICE_NOME_SUSTENIDO = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export type Notacao = "natural" | "sustenido" | "bemol";

export interface Nota {
  nome: string;
  indice: number;
}

export function obterNotaInterna(notaBase: string, alteracao: Notacao): Nota {
  if (alteracao === "natural") return { nome: notaBase, indice: NOME_NOTA_INDICE[notaBase] };
  if (alteracao === "sustenido") {
    const nome = notaBase + "#";
    return { nome, indice: NOME_NOTA_INDICE[nome] };
  }
  if (alteracao === "bemol") {
    const nome = notaBase + "b";
    return { nome, indice: NOME_NOTA_INDICE[nome] };
  }
  return { nome: notaBase, indice: NOME_NOTA_INDICE[notaBase] };
}

export function obterNomePorIndice(indice: number, notacao: Notacao): string {
  const normIndice = ((indice % 12) + 12) % 12;
  const nomeSustenido = INDICE_NOME_SUSTENIDO[normIndice];
  if (notacao === "sustenido") return nomeSustenido;
  if (notacao === "bemol") {
    const mapa: Record<string, string> = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" };
    return mapa[nomeSustenido] || nomeSustenido;
  }
  // Notação natural: para notas sem alteração retorna a nota direta; para acidentes cromáticos usa sustenido padrão
  return nomeSustenido;
}

const LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_PITCH: Record<string, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
};

export function obterNotasDaEscala(notaBase: string, accidental: Notacao, intervalos: number[]): string[] {
  const tom = obterNotaInterna(notaBase, accidental);
  const baseLetter = notaBase.charAt(0);
  const baseIndex = LETRAS.indexOf(baseLetter);
  
  if (baseIndex === -1) {
    return intervalos.map(i => obterNomePorIndice((tom.indice + i) % 12, accidental));
  }

  return intervalos.map((intervalo, grauIdx) => {
    const targetLetter = LETRAS[(baseIndex + grauIdx) % 7];
    const naturalPitch = NATURAL_PITCH[targetLetter];
    const targetPitch = (tom.indice + intervalo) % 12;
    
    let diff = (targetPitch - naturalPitch) % 12;
    if (diff < -6) diff += 12;
    if (diff > 6) diff -= 12;
    
    let accStr = "";
    if (diff === 1) accStr = "#";
    else if (diff === 2) accStr = "##";
    else if (diff === -1) accStr = "b";
    else if (diff === -2) accStr = "bb";
    
    return targetLetter + accStr;
  });
}

export const TIPOS_ACORDES = [
  { sufixo: "",   nome: "Maior",    intervalos: [0,4,7] },
  { sufixo: "m",  nome: "Menor",    intervalos: [0,3,7] },
  { sufixo: "º",  nome: "Diminuto", intervalos: [0,3,6] },
  { sufixo: "º7", nome: "Diminuto c/ 7ª", intervalos: [0,3,6,9] },
  { sufixo: "+",  nome: "Aumentado", intervalos: [0,4,8] },
  { sufixo: "sus2", nome: "Suspenso 2", intervalos: [0,2,7] },
  { sufixo: "sus4", nome: "Suspenso 4", intervalos: [0,5,7] },
  { sufixo: "7",  nome: "Sétima Dominante", intervalos: [0,4,7,10] },
  { sufixo: "m7", nome: "Menor com 7ª", intervalos: [0,3,7,10] },
  { sufixo: "7M", nome: "Sétima Maior", intervalos: [0,4,7,11] }
];

export type GuitarShape = { status: (string | number)[], marcas: number[][], cordaRaiz: number, casaInicial: number };

export function getViolaoShape(tomIndice: number, sufixo: string): GuitarShape {
  // Common open chords
  const openKey = `${tomIndice}-${sufixo}`;
  const openChords: Record<string, GuitarShape> = {
    // C
    "0-": { status: ['x', 'o', 2, 2, 1, 'o'], marcas: [[1,3], [2,2], [4,1]], cordaRaiz: 1, casaInicial: 1 },
    "0-M": { status: ['x', 'o', 2, 2, 1, 'o'], marcas: [[1,3], [2,2], [4,1]], cordaRaiz: 1, casaInicial: 1 },
    "0-7M": { status: ['x', 'o', 2, 'o', 'o', 'o'], marcas: [[1,3], [2,2]], cordaRaiz: 1, casaInicial: 1 },
    "0-7": { status: ['x', 'o', 2, 3, 1, 'o'], marcas: [[1,3], [2,2], [3,3], [4,1]], cordaRaiz: 1, casaInicial: 1 },
    
    // D
    "2-": { status: ['x', 'x', 'o', 1, 3, 2], marcas: [[3,2], [4,3], [5,2]], cordaRaiz: 2, casaInicial: 1 },
    "2-M": { status: ['x', 'x', 'o', 1, 3, 2], marcas: [[3,2], [4,3], [5,2]], cordaRaiz: 2, casaInicial: 1 },
    "2-m": { status: ['x', 'x', 'o', 2, 3, 1], marcas: [[3,2], [4,3], [5,1]], cordaRaiz: 2, casaInicial: 1 },
    "2-7": { status: ['x', 'x', 'o', 2, 1, 2], marcas: [[3,2], [4,1], [5,2]], cordaRaiz: 2, casaInicial: 1 },
    
    // E
    "4-": { status: ['o', 2, 3, 1, 'o', 'o'], marcas: [[1,2], [2,2], [3,1]], cordaRaiz: 0, casaInicial: 1 },
    "4-M": { status: ['o', 2, 3, 1, 'o', 'o'], marcas: [[1,2], [2,2], [3,1]], cordaRaiz: 0, casaInicial: 1 },
    "4-m": { status: ['o', 2, 2, 'o', 'o', 'o'], marcas: [[1,2], [2,2]], cordaRaiz: 0, casaInicial: 1 },
    "4-7": { status: ['o', 2, 'o', 1, 'o', 'o'], marcas: [[1,2], [3,1]], cordaRaiz: 0, casaInicial: 1 },
    
    // F (Open/Barre hybrid at fret 1)
    "5-": { status: ['o', 'o', 'o', 'o', 'o', 'o'], marcas: [[0,1], [1,3], [2,3], [3,2], [4,1], [5,1]], cordaRaiz: 0, casaInicial: 1 },
    "5-M": { status: ['o', 'o', 'o', 'o', 'o', 'o'], marcas: [[0,1], [1,3], [2,3], [3,2], [4,1], [5,1]], cordaRaiz: 0, casaInicial: 1 },
    
    // G
    "7-": { status: [2, 1, 'o', 'o', 'o', 3], marcas: [[0,3], [1,2], [4,3], [5,3]], cordaRaiz: 0, casaInicial: 1 },
    "7-M": { status: [2, 1, 'o', 'o', 'o', 3], marcas: [[0,3], [1,2], [4,3], [5,3]], cordaRaiz: 0, casaInicial: 1 },
    
    // A
    "9-": { status: ['x', 'o', 1, 2, 3, 'o'], marcas: [[2,2], [3,2], [4,2]], cordaRaiz: 1, casaInicial: 1 },
    "9-M": { status: ['x', 'o', 1, 2, 3, 'o'], marcas: [[2,2], [3,2], [4,2]], cordaRaiz: 1, casaInicial: 1 },
    "9-m": { status: ['x', 'o', 2, 3, 1, 'o'], marcas: [[2,2], [3,2], [4,1]], cordaRaiz: 1, casaInicial: 1 },
    "9-7": { status: ['x', 'o', 2, 'o', 3, 'o'], marcas: [[2,2], [4,2]], cordaRaiz: 1, casaInicial: 1 },
  };

  if (openChords[openKey]) {
    return openChords[openKey];
  }

  // Barre Chords
  const E_ROOT = 4;
  const A_ROOT = 9;

  let fretE = (tomIndice - E_ROOT + 12) % 12;
  if (fretE === 0) fretE = 12; 

  let fretA = (tomIndice - A_ROOT + 12) % 12;
  if (fretA === 0) fretA = 12;

  let useEShape = fretE <= fretA;
  let baseFret = useEShape ? fretE : fretA;
  let cordaRaiz = useEShape ? 0 : 1;

  const shapeE: Record<string, { status: string[], marcas: number[][] }> = {
    "":     { status: ['o', 'o', 'o', 'o', 'o', 'o'], marcas: [[0,1], [1,3], [2,3], [3,2], [4,1], [5,1]] },
    "M":    { status: ['o', 'o', 'o', 'o', 'o', 'o'], marcas: [[0,1], [1,3], [2,3], [3,2], [4,1], [5,1]] },
    "m":    { status: ['o', 'o', 'o', 'o', 'o', 'o'], marcas: [[0,1], [1,3], [2,3], [3,1], [4,1], [5,1]] },
    "7":    { status: ['o', 'o', 'o', 'o', 'o', 'o'], marcas: [[0,1], [1,3], [2,1], [3,2], [4,1], [5,1]] },
    "m7":   { status: ['o', 'o', 'o', 'o', 'o', 'o'], marcas: [[0,1], [1,3], [2,1], [3,1], [4,1], [5,1]] },
    "7M":   { status: ['o', 'x', 'o', 'o', 'o', 'x'], marcas: [[0,1], [2,1], [3,2], [4,1]] },
    "sus4": { status: ['o', 'o', 'o', 'o', 'o', 'o'], marcas: [[0,1], [1,3], [2,3], [3,3], [4,1], [5,1]] },
    "sus2": { status: ['o', 'x', 'o', 'o', 'x', 'x'], marcas: [[0,1], [2,3], [3,3]] },
    "º":    { status: ['o', 'x', 'o', 'o', 'x', 'x'], marcas: [[0,2], [2,1], [3,2]] },
    "º7":   { status: ['o', 'x', 'o', 'o', 'o', 'x'], marcas: [[0,2], [2,1], [3,2], [4,1]] },
    "+":    { status: ['o', 'x', 'o', 'o', 'o', 'x'], marcas: [[0,1], [2,2], [3,1], [4,1]] },
  };

  const shapeA: Record<string, { status: string[], marcas: number[][] }> = {
    "":     { status: ['x', 'o', 'o', 'o', 'o', 'o'], marcas: [[1,1], [2,3], [3,3], [4,3], [5,1]] },
    "M":    { status: ['x', 'o', 'o', 'o', 'o', 'o'], marcas: [[1,1], [2,3], [3,3], [4,3], [5,1]] },
    "m":    { status: ['x', 'o', 'o', 'o', 'o', 'o'], marcas: [[1,1], [2,3], [3,3], [4,2], [5,1]] },
    "7":    { status: ['x', 'o', 'o', 'o', 'o', 'o'], marcas: [[1,1], [2,3], [3,1], [4,3], [5,1]] },
    "m7":   { status: ['x', 'o', 'o', 'o', 'o', 'o'], marcas: [[1,1], [2,3], [3,1], [4,2], [5,1]] },
    "7M":   { status: ['x', 'o', 'o', 'o', 'o', 'o'], marcas: [[1,1], [2,3], [3,2], [4,3], [5,1]] },
    "sus4": { status: ['x', 'o', 'o', 'o', 'o', 'o'], marcas: [[1,1], [2,3], [3,3], [4,4], [5,1]] }, 
    "sus2": { status: ['x', 'o', 'o', 'o', 'o', 'o'], marcas: [[1,1], [2,3], [3,3], [4,1], [5,1]] },
    "º":    { status: ['x', 'o', 'o', 'o', 'o', 'x'], marcas: [[1,1], [2,2], [3,1], [4,2]] },
    "º7":   { status: ['x', 'o', 'o', 'o', 'o', 'x'], marcas: [[1,1], [2,2], [3,1], [4,2]] }, 
    "+":    { status: ['x', 'o', 'o', 'o', 'o', 'x'], marcas: [[1,1], [2,3], [3,3], [4,2]] },
  };

  const selectedShape = useEShape ? (shapeE[sufixo] || shapeE[""]) : (shapeA[sufixo] || shapeA[""]);

  let casaView = baseFret;
  // If the root note is not at the 1st relative fret (e.g. diminished chords), adjust casaInicial
  if (selectedShape.marcas.find(m => m[0] === cordaRaiz && m[1] === 2)) {
    casaView = baseFret - 1;
  }

  return {
    status: selectedShape.status,
    marcas: selectedShape.marcas,
    cordaRaiz,
    casaInicial: casaView
  };
}

export interface Escala {
  nome: string;
  intervalos: number[];
  graus: string[];
  sufixos: string[];
  estruturaIntervalos: string;
  passos: string[];
}

export const ESCALAS: Escala[] = [
  {
    nome: "Maior Natural",
    intervalos: [0, 2, 4, 5, 7, 9, 11],
    graus: ["I", "II", "III", "IV", "V", "VI", "VII"],
    sufixos: ["", "m", "m", "", "", "m", "º"],
    estruturaIntervalos: "T - T - ST - T - T - T - ST",
    passos: ["T", "T", "ST", "T", "T", "T", "ST"]
  },
  {
    nome: "Menor Natural",
    intervalos: [0, 2, 3, 5, 7, 8, 10],
    graus: ["I", "II", "III", "IV", "V", "VI", "VII"],
    sufixos: ["m", "º", "", "m", "m", "", ""],
    estruturaIntervalos: "T - ST - T - T - ST - T - T",
    passos: ["T", "ST", "T", "T", "ST", "T", "T"]
  },
  {
    nome: "Maior Harmônica",
    intervalos: [0, 2, 4, 5, 7, 8, 11],
    graus: ["I", "II", "III", "IV", "V", "VI", "VII"],
    sufixos: ["", "º", "m", "m", "", "+", "º"],
    estruturaIntervalos: "T - T - ST - T - ST - 1T 1/2 - ST",
    passos: ["T", "T", "ST", "T", "ST", "1T 1/2", "ST"]
  },
  {
    nome: "Menor Harmônica",
    intervalos: [0, 2, 3, 5, 7, 8, 11],
    graus: ["I", "II", "III", "IV", "V", "VI", "VII"],
    sufixos: ["m", "º", "+", "m", "", "", "º"],
    estruturaIntervalos: "T - ST - T - T - ST - 1 T e 1/2 - ST",
    passos: ["T", "ST", "T", "T", "ST", "1 T e 1/2", "ST"]
  },
  {
    nome: "Menor Melódica",
    intervalos: [0, 2, 3, 5, 7, 9, 11],
    graus: ["I", "II", "III", "IV", "V", "VI", "VII"],
    sufixos: ["m", "m", "+", "", "", "º", "º"],
    estruturaIntervalos: "T - ST - T - T - T - T - ST",
    passos: ["T", "ST", "T", "T", "T", "T", "ST"]
  }
];

export const MODOS_GREGOS = [
  { nome: "Jônio (Maior)", intervalos: [0,2,4,5,7,9,11] },
  { nome: "Dórico", intervalos: [0,2,3,5,7,9,10] },
  { nome: "Frígio", intervalos: [0,1,3,5,7,8,10] },
  { nome: "Lídio", intervalos: [0,2,4,6,7,9,11] },
  { nome: "Mixolídio", intervalos: [0,2,4,5,7,9,10] },
  { nome: "Eólio (Menor Natural)", intervalos: [0,2,3,5,7,8,10] },
  { nome: "Lócrio", intervalos: [0,1,3,5,6,8,10] }
];

export function obterIntervalosInvertidos(intervalos: number[], grau: number): number[] {
  if (grau === 0 || grau >= intervalos.length) return [...intervalos];
  let arr = [...intervalos];
  for (let i=0; i<grau; i++) {
    const primeiro = arr.shift();
    if (primeiro !== undefined) {
      arr.push(primeiro + 12);
    }
  }
  return arr.sort((a,b) => a-b);
}
