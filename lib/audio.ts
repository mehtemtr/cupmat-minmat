/**
 * Web Audio API based Synthesized Sound Effects for Referee Whistles and Goals.
 * Works completely client-side, 100% offline, free, and robust.
 */

export function playWhistleSound(type: "start" | "half" | "end" = "start") {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    const now = audioCtx.currentTime;

    // A helper to play a single blow of the referee whistle.
    // Real whistle has two dominant frequencies close to each other (e.g., 2000Hz and 2150Hz)
    // producing a distinct beating/vibrating tone. We also apply high-frequency vibrato.
    const playSingleBlow = (startTime: number, duration: number) => {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(2000, startTime);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(2150, startTime);

      // Create Vibrato (Frequency Modulation)
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(32, startTime); // 32 Hz vibrato
      lfoGain.gain.setValueAtTime(40, startTime); // Vibrato depth (Hz)

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      // Gain Envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.03); // Quick attack
      gainNode.gain.setValueAtTime(0.25, startTime + duration - 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // Fade out

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      lfo.start(startTime);
      osc1.start(startTime);
      osc2.start(startTime);

      lfo.stop(startTime + duration);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    if (type === "start" || type === "half") {
      // Kick-off or Halftime: Double whistle (short, long)
      playSingleBlow(now, 0.15);
      playSingleBlow(now + 0.25, 0.5);
    } else if (type === "end") {
      // Full time: Triple whistle (short, short, long)
      playSingleBlow(now, 0.15);
      playSingleBlow(now + 0.22, 0.15);
      playSingleBlow(now + 0.44, 0.75);
    }
  } catch (err) {
    console.error("Failed to synthesize whistle sound:", err);
  }
}

export function playGoalSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    const now = audioCtx.currentTime;

    // 1. Synthesize a Horn/Fanfare Melody (Sawtooth notes with a lowpass filter)
    const playNote = (freq: number, startTime: number, duration: number, volume = 0.15) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
      gainNode.gain.setValueAtTime(volume, startTime + duration - 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Upward fanfare chords (C4, E4, G4, C5)
    playNote(261.63, now, 0.22); // C4
    playNote(329.63, now + 0.15, 0.22); // E4
    playNote(392.00, now + 0.30, 0.22); // G4
    playNote(523.25, now + 0.45, 0.9, 0.2); // C5 (Main high note sustained)

    // Parallel harmony for extra richness (E5)
    playNote(659.25, now + 0.45, 0.9, 0.1);

    // 2. Synthesize Stadium Crowd Cheer / Roar (Filter swept white noise)
    const bufferSize = audioCtx.sampleRate * 2.0; // 2 seconds duration
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    // Fill buffer with random values (white noise)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass filter to model acoustic room/stadium frequency response
    const bpFilter = audioCtx.createBiquadFilter();
    bpFilter.type = "bandpass";
    bpFilter.Q.setValueAtTime(1.2, now);
    bpFilter.frequency.setValueAtTime(350, now);
    // Dynamically sweep filter frequency up as cheer intensifies, then down
    bpFilter.frequency.exponentialRampToValueAtTime(850, now + 0.4);
    bpFilter.frequency.exponentialRampToValueAtTime(250, now + 2.0);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    // Attack and decay envelope for crowd swell
    noiseGain.gain.linearRampToValueAtTime(0.35, now + 0.35);
    noiseGain.gain.setValueAtTime(0.35, now + 0.8);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    noiseSource.connect(bpFilter);
    bpFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 2.0);

  } catch (err) {
    console.error("Failed to synthesize goal sound:", err);
  }
}
