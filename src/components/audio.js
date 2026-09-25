let context;
let soundEnabled = false;
let preloaderVoices = [];

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!context) context = new AudioContextClass();
  return context;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  if (soundEnabled) {
    getAudioContext()?.resume();
  } else {
    stopPreloaderMusic();
  }
}

export function playScrollChime(frequencies) {
  if (!soundEnabled) return;
  const audio = getAudioContext();
  if (!audio || audio.state !== "running") return;

  const now = audio.currentTime;
  frequencies.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const volume = audio.createGain();
    const start = now + index * 0.055;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    volume.gain.setValueAtTime(0.0001, start);
    volume.gain.exponentialRampToValueAtTime(0.025, start + 0.035);
    volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
    oscillator.connect(volume);
    volume.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.44);
  });
}

export function startPreloaderMusic() {
  if (!soundEnabled) return;
  const audio = getAudioContext();
  if (!audio) return;

  audio.resume().then(() => {
    if (!soundEnabled) return;
    stopPreloaderMusic();
    const start = audio.currentTime + 0.04;
    const notes = [392, 493.88, 587.33, 493.88, 659.25, 587.33, 783.99];

    notes.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const volume = audio.createGain();
      const noteStart = start + index * 0.48;
      const noteEnd = noteStart + 0.44;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      volume.gain.setValueAtTime(0.0001, noteStart);
      volume.gain.exponentialRampToValueAtTime(0.018, noteStart + 0.04);
      volume.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
      oscillator.connect(volume);
      volume.connect(audio.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd + 0.02);
      preloaderVoices.push({ oscillator, volume, end: noteEnd + 0.02 });
    });

    const pad = audio.createOscillator();
    const padVolume = audio.createGain();
    const padEnd = start + 3.55;
    pad.type = "sine";
    pad.frequency.setValueAtTime(146.83, start);
    padVolume.gain.setValueAtTime(0.0001, start);
    padVolume.gain.exponentialRampToValueAtTime(0.004, start + 0.35);
    padVolume.gain.setValueAtTime(0.004, padEnd - 0.4);
    padVolume.gain.exponentialRampToValueAtTime(0.0001, padEnd);
    pad.connect(padVolume);
    padVolume.connect(audio.destination);
    pad.start(start);
    pad.stop(padEnd + 0.02);
    preloaderVoices.push({ oscillator: pad, volume: padVolume, end: padEnd + 0.02 });
  });
}

export function stopPreloaderMusic() {
  if (!context) return;
  const now = context.currentTime;
  for (const voice of preloaderVoices) {
    if (voice.end <= now) continue;
    voice.volume.gain.cancelScheduledValues(now);
    voice.volume.gain.setValueAtTime(Math.max(voice.volume.gain.value, 0.0001), now);
    voice.volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    voice.oscillator.stop(now + 0.2);
  }
  preloaderVoices = [];
}
