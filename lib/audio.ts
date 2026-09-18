import * as Tone from 'tone';
import { obterIntervalosInvertidos, INDICE_NOME_SUSTENIDO } from './music-theory';

let audioInitializing: Promise<void> | null = null;
let audioInitialized = false;

let pianoSynth: Tone.Sampler | Tone.PolySynth | null = null;
let guitarSynth: Tone.Sampler | Tone.PolySynth | null = null;

export async function initAudio() {
  if (audioInitialized) return;
  if (audioInitializing) {
    await audioInitializing;
    return;
  }

  audioInitializing = (async () => {
    await Tone.start();
    
    // Real Acoustic Piano using Tone.Sampler and Salamander Grand Piano samples
    pianoSynth = new Tone.Sampler({
    urls: {
      A0: "A0.mp3",
      C1: "C1.mp3",
      C2: "C2.mp3",
      C3: "C3.mp3",
      C4: "C4.mp3",
      C5: "C5.mp3",
      C6: "C6.mp3",
      C7: "C7.mp3"
    },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/"
  }).toDestination();
  
  pianoSynth.volume.value = 2; // Slight volume boost for the sampler

  // Real Acoustic Guitar (Nylon) using Soundfont samples
  guitarSynth = new Tone.Sampler({
    urls: {
      "E2": "E2.mp3",
      "F2": "F2.mp3",
      "F#2": "Gb2.mp3",
      "G2": "G2.mp3",
      "G#2": "Ab2.mp3",
      "A2": "A2.mp3",
      "A#2": "Bb2.mp3",
      "B2": "B2.mp3",
      "C3": "C3.mp3",
      "C#3": "Db3.mp3",
      "D3": "D3.mp3",
      "D#3": "Eb3.mp3",
      "E3": "E3.mp3",
      "F3": "F3.mp3",
      "F#3": "Gb3.mp3",
      "G3": "G3.mp3",
      "G#3": "Ab3.mp3",
      "A3": "A3.mp3",
      "A#3": "Bb3.mp3",
      "B3": "B3.mp3",
      "C4": "C4.mp3",
      "C#4": "Db4.mp3",
      "D4": "D4.mp3",
      "D#4": "Eb4.mp3",
      "E4": "E4.mp3",
      "F4": "F4.mp3",
      "F#4": "Gb4.mp3",
      "G4": "G4.mp3",
      "G#4": "Ab4.mp3",
      "A4": "A4.mp3",
      "A#4": "Bb4.mp3",
      "B4": "B4.mp3",
      "C5": "C5.mp3",
      "C#5": "Db5.mp3",
      "D5": "D5.mp3",
      "D#5": "Eb5.mp3",
      "E5": "E5.mp3",
      "F5": "F5.mp3",
      "F#5": "Gb5.mp3",
      "G5": "G5.mp3",
      "G#5": "Ab5.mp3",
      "A5": "A5.mp3",
      "A#5": "Bb5.mp3",
      "B5": "B5.mp3",
      "C6": "C6.mp3"
    },
    release: 1,
    baseUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/"
  }).toDestination();
  
  guitarSynth.volume.value = 2; // Volume boost to match the piano

  await Tone.loaded();

  audioInitialized = true;
  audioInitializing = null;
  })();

  await audioInitializing;
}

export async function tocarSomAcorde(
  tomIndice: number, 
  intervalos: number[], 
  inversaoAtiva: number, 
  instrumento: 'piano' | 'violao'
) {
  if (!audioInitialized) await initAudio();

  const synth = instrumento === 'piano' ? pianoSynth : guitarSynth;
  if (!synth) return;

  const intervalosFinais = obterIntervalosInvertidos(intervalos, inversaoAtiva);
  const delayEntreNotas = instrumento === 'violao' ? 0.05 : 0.01;

  const now = Tone.now();
  
  intervalosFinais.forEach((intervalo, i) => {
    const totalIdx = (tomIndice + intervalo) % 12;
    const notaNome = INDICE_NOME_SUSTENIDO[totalIdx];
    let oitava = 4 + Math.floor((tomIndice + intervalo) / 12);

    if (instrumento === 'violao') {
      oitava -= 1;
    }
    
    const notaString = `${notaNome}${oitava}`;
    
    synth.triggerAttackRelease(notaString, "1n", now + (i * delayEntreNotas));
  });
}
