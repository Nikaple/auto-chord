import * as Tone from 'tone'
import { Note, Chord } from './music'

interface AudioSettings {
  volume: number;       // 音量: 0 到 1
  attack: number;       // 起音时间（秒）
  decay: number;        // 衰减时间（秒）
  sustain: number;      // 延音级别: 0 到 1
  release: number;      // 释放时间（秒）
  oscillatorType: string; // 振荡器类型: 'sine', 'square', 'triangle', 'sawtooth'
}

export default class AudioSystem {
  private synth: Tone.PolySynth;
  private defaultSettings: AudioSettings = {
    volume: 0.7,
    attack: 0.05,
    decay: 0.1,
    sustain: 0.3,
    release: 1,
    oscillatorType: 'triangle'
  };

  constructor() {
    // 初始化Tone.js
    Tone.start();
    
    // 创建合成器
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    // 应用默认设置
    this.applySettings(this.defaultSettings);
  }

  // 应用音频设置
  applySettings(settings: Partial<AudioSettings>): void {
    const currentSettings = { ...this.defaultSettings, ...settings };
    
    // 设置音量
    this.synth.volume.value = Tone.gainToDb(currentSettings.volume);
    
    // 设置音色参数
    this.synth.set({
      envelope: {
        attack: currentSettings.attack,
        decay: currentSettings.decay,
        sustain: currentSettings.sustain,
        release: currentSettings.release
      },
      oscillator: {
        type: currentSettings.oscillatorType as Tone.ToneOscillatorType
      }
    });
  }

  // 播放单个音符
  playNote(note: Note, duration: string = '4n'): void {
    this.synth.triggerAttackRelease(note.frequency, duration);
  }

  // 播放和弦
  playChord(chord: Chord, duration: string = '4n'): void {
    const frequencies = chord.frequencies;
    this.synth.triggerAttackRelease(frequencies, duration);
  }

  // 通过音符名称播放和弦
  playChordByNotes(noteNames: string[], duration: string = '4n'): void {
    this.synth.triggerAttackRelease(noteNames, duration);
  }

  // 停止所有声音
  stopAll(): void {
    this.synth.releaseAll();
  }
  
  // 获取当前设置
  getSettings(): AudioSettings {
    return {
      volume: Tone.dbToGain(this.synth.volume.value),
      attack: this.synth.get().envelope.attack as number,
      decay: this.synth.get().envelope.decay as number,
      sustain: this.synth.get().envelope.sustain as number,
      release: this.synth.get().envelope.release as number,
      oscillatorType: this.synth.get().oscillator.type as string
    };
  }
} 