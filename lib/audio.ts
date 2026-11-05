import * as Tone from 'tone';
import { obterIntervalosInvertidos, INDICE_NOME_SUSTENIDO } from './music-theory';

let audioInitializing: Promise<void> | null = null;
let audioInitialized = false;

// Real professional acoustic sampled instruments (Yamaha Grand Piano & Classical Nylon Guitar)
let pianoSampler: Tone.Sampler | null = null;
let guitarSampler: Tone.Sampler | null = null;
let masterLimiter: Tone.Limiter | null = null;
let acousticReverb: Tone.Freeverb | null = null;

export async function initAudio(): Promise<void> {
  if (audioInitialized) {
    if (Tone.getContext().state !== 'running') {
      try {
        await Tone.start();
      } catch {
        // Ignora caso contexto ainda esteja iniciando
      }
    }
    return;
  }

  if (audioInitializing) {
    await audioInitializing;
    return;
  }

  audioInitializing = (async () => {
    try {
      await Tone.start();

      // Master Limiter to keep chord playback crisp, dynamic and avoid clipping
      masterLimiter = new Tone.Limiter(-0.5).toDestination();

      // Subtle acoustic room ambience for natural concert hall depth
      acousticReverb = new Tone.Freeverb({
        roomSize: 0.28,
        dampening: 3200,
      });
      acousticReverb.wet.value = 0.12;
      acousticReverb.connect(masterLimiter);

      // 1. Professional Yamaha Salamander Grand Piano Samples (Local & 100% Offline)
      pianoSampler = new Tone.Sampler({
        urls: {
          A0: "A0.mp3",
          C1: "C1.mp3",
          A1: "A1.mp3",
          C2: "C2.mp3",
          A2: "A2.mp3",
          C3: "C3.mp3",
          A3: "A3.mp3",
          C4: "C4.mp3",
          A4: "A4.mp3",
          C5: "C5.mp3",
          A5: "A5.mp3",
          C6: "C6.mp3",
          A6: "A6.mp3",
          C7: "C7.mp3",
          A7: "A7.mp3",
        },
        release: 1.5,
        baseUrl: "/audio/piano/",
      });
      pianoSampler.volume.value = 2.5; // Encorpado e presente
      pianoSampler.connect(acousticReverb);

      // 2. Professional FluidR3 Classical Acoustic Nylon Guitar Samples (Local & 100% Offline)
      guitarSampler = new Tone.Sampler({
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
          "C6": "C6.mp3",
        },
        release: 1.2,
        baseUrl: "/audio/violao/",
      });
      guitarSampler.volume.value = 2.5; // Nível balanceado com o piano
      guitarSampler.connect(acousticReverb);

      // Espera carregar os buffers dos instrumentos locais
      await Tone.loaded();
      audioInitialized = true;
    } catch (err) {
      console.warn("Inicialização de áudio:", err);
      audioInitialized = true;
    } finally {
      audioInitializing = null;
    }
  })();

  await audioInitializing;
}

export async function tocarSomAcorde(
  tomIndice: number,
  intervalos: number[],
  inversaoAtiva: number,
  instrumento: 'piano' | 'violao'
): Promise<void> {
  if (!audioInitialized) {
    await initAudio();
  }

  if (Tone.getContext().state !== 'running') {
    try {
      await Tone.start();
    } catch {
      // Ignora erro de contexto
    }
  }

  const sampler = instrumento === 'piano' ? pianoSampler : guitarSampler;
  if (!sampler) return;

  const intervalosFinais = obterIntervalosInvertidos(intervalos, inversaoAtiva);
  // Violão tem dedilhado/batida realista (45ms entre notas); Piano tem batida simultânea natural (12ms)
  const delayEntreNotas = instrumento === 'violao' ? 0.045 : 0.012;

  const now = Tone.now();

  intervalosFinais.forEach((intervalo, i) => {
    const totalIdx = (tomIndice + intervalo) % 12;
    const notaNome = INDICE_NOME_SUSTENIDO[totalIdx];
    let oitava = 4 + Math.floor((tomIndice + intervalo) / 12);

    if (instrumento === 'violao') {
      oitava -= 1; // Violão soa na oitava natural do braço do instrumento (3ª/4ª)
    }

    const notaString = `${notaNome}${oitava}`;
    const triggerTime = now + (i * delayEntreNotas);

    try {
      sampler.triggerAttackRelease(notaString, "1.5n", triggerTime);
    } catch {
      // Previne interrupção caso uma nota específica ainda esteja em buffer
    }
  });
}
