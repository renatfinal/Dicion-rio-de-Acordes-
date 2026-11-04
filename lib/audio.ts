import * as Tone from 'tone';
import { obterIntervalosInvertidos, INDICE_NOME_SUSTENIDO } from './music-theory';

let audioInitializing: Promise<void> | null = null;
let audioInitialized = false;

// Procedural, 100% offline synthesizers using Web Audio API nodes
let pianoSynth: Tone.PolySynth | null = null;
let guitarSynth: Tone.PolySynth | null = null;
let pianoFilter: Tone.Filter | null = null;
let guitarFilter: Tone.Filter | null = null;
let acousticReverb: Tone.Freeverb | null = null;
let masterLimiter: Tone.Limiter | null = null;

export async function initAudio(): Promise<void> {
  if (audioInitialized) {
    if (Tone.getContext().state !== 'running') {
      try {
        await Tone.start();
      } catch {
        // Ignore gesture errors if context already starting
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
      // Start audio context on user interaction
      await Tone.start();

      // Master output limiter to ensure crisp, distortion-free chord playback
      masterLimiter = new Tone.Limiter(-1).toDestination();

      // Acoustic spatial resonance (Freeverb works 100% offline and synchronously)
      acousticReverb = new Tone.Freeverb({
        roomSize: 0.35,
        dampening: 2600,
      });
      acousticReverb.wet.value = 0.16;
      acousticReverb.connect(masterLimiter);

      // 1. Acoustic Piano Synthesizer (Warm acoustic harmonics & hammer envelope)
      pianoFilter = new Tone.Filter({
        frequency: 2400,
        type: 'lowpass',
        rolloff: -12,
      });
      pianoFilter.connect(acousticReverb);

      pianoSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'triangle8', // Rich overtone spectrum mimicking piano soundboard & strings
        },
        envelope: {
          attack: 0.005, // Fast wooden hammer strike
          decay: 1.8,    // Harmonic acoustic decay
          sustain: 0.15, // Gentle sustain floor
          release: 1.2,  // Natural damper release
        },
      });
      pianoSynth.volume.value = -3;
      pianoSynth.connect(pianoFilter);

      // 2. Violão / Acoustic Guitar Synthesizer (Plucked nylon/bronze string response)
      guitarFilter = new Tone.Filter({
        frequency: 1800,
        type: 'lowpass',
        rolloff: -12,
      });
      guitarFilter.connect(acousticReverb);

      guitarSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'sawtooth4', // String bite and high harmonic resonance
        },
        envelope: {
          attack: 0.003, // Crisp fingertip or plectrum pluck
          decay: 1.6,    // Plucked string vibration decay
          sustain: 0.05, // Low sustain for realistic acoustic guitar
          release: 0.9,  // Muting / open string release
        },
      });
      guitarSynth.volume.value = -3.5;
      guitarSynth.connect(guitarFilter);

      audioInitialized = true;
    } catch (err) {
      console.warn('Falha ao inicializar o motor de áudio:', err);
      // Mark initialized to not block subsequent attempts
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

  // Ensure AudioContext is running
  if (Tone.getContext().state !== 'running') {
    try {
      await Tone.start();
    } catch {
      // Ignora se não houver permissão ainda
    }
  }

  const synth = instrumento === 'piano' ? pianoSynth : guitarSynth;
  if (!synth) return;

  const intervalosFinais = obterIntervalosInvertidos(intervalos, inversaoAtiva);
  // Strumming delay: Violão has natural arpeggiated strum (40ms), Piano has natural hand strike (12ms)
  const delayEntreNotas = instrumento === 'violao' ? 0.042 : 0.012;

  const now = Tone.now();

  intervalosFinais.forEach((intervalo, i) => {
    const totalIdx = (tomIndice + intervalo) % 12;
    const notaNome = INDICE_NOME_SUSTENIDO[totalIdx];
    let oitava = 4 + Math.floor((tomIndice + intervalo) / 12);

    if (instrumento === 'violao') {
      oitava -= 1; // Guitar sounds in 3rd/4th octave naturally
    }

    const notaString = `${notaNome}${oitava}`;
    const triggerTime = now + (i * delayEntreNotas);

    try {
      synth.triggerAttackRelease(notaString, '1.6n', triggerTime);
    } catch {
      // Silently catch note edge cases
    }
  });
}
