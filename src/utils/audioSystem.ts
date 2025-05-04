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
    decay: 0.3,         // 增加衰减时间
    sustain: 0.8,       // 增加延音级别，使声音保持更长时间
    release: 2,         // 增加释放时间
    oscillatorType: 'triangle'
  };

  // 存储当前正在播放的音符
  private activeNotes: Set<number | string> = new Set();

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
      }
    });
    
    // 单独设置振荡器类型，避免类型错误
    this.synth.set({
      oscillator: {
        type: currentSettings.oscillatorType
      }
    } as any);
  }

  // 播放单个音符
  playNote(note: Note, duration: string = '4n'): void {
    // 先停止该音符以避免重叠
    if (this.activeNotes.has(note.frequency)) {
      this.synth.triggerRelease(note.frequency);
    }
    
    // 添加到活跃音符集合
    this.activeNotes.add(note.frequency);
    
    // 播放音符
    this.synth.triggerAttackRelease(note.frequency, duration);
  }

  // 播放和弦
  playChord(chord: Chord, duration: string = '2n'): void {
    const frequencies = chord.frequencies;
    
    // 停止当前活跃的音符以避免叠加
    this.stopActiveNotes();
    
    // 添加到活跃音符集合
    frequencies.forEach(freq => this.activeNotes.add(freq));
    
    // 播放和弦 - 使用较长的持续时间
    this.synth.triggerAttackRelease(frequencies, duration);
  }

  // 通过音符名称播放和弦
  playChordByNotes(noteNames: string[], duration: string = '2n'): void {
    // 停止当前活跃的音符
    this.stopActiveNotes();
    
    // 添加到活跃音符集合
    noteNames.forEach(note => this.activeNotes.add(note));
    
    // 播放和弦
    this.synth.triggerAttackRelease(noteNames, duration);
  }

  // 停止特定的活跃音符
  private stopActiveNotes(): void {
    if (this.activeNotes.size > 0) {
      const notesToRelease = Array.from(this.activeNotes);
      this.synth.triggerRelease(notesToRelease);
      this.activeNotes.clear();
    }
  }

  // 停止所有声音
  stopAll(): void {
    this.synth.releaseAll();
    this.activeNotes.clear();
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