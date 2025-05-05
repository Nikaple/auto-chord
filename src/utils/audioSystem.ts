import * as Tone from 'tone'
import { Note, Chord } from './music'

interface AudioSettings {
  volume: number;       // 音量: 0 到 1
  attack: number;       // 起音时间（秒）
  decay: number;        // 衰减时间（秒）
  sustain: number;      // 延音级别: 0 到 1
  release: number;      // 释放时间（秒）
  oscillatorType: string; // 振荡器类型: 'sine', 'square', 'triangle', 'sawtooth'
  useSampler?: boolean;   // 是否使用采样器
}

export default class AudioSystem {
  private synth: Tone.PolySynth;
  private sampler: Tone.Sampler | null = null;
  private defaultSettings: AudioSettings = {
    volume: 0.7,
    attack: 0.05,
    decay: 0.3,
    sustain: 0.8,
    release: 2,
    oscillatorType: 'triangle',
    useSampler: true
  };

  // 存储当前正在播放的音符
  private activeNotes: Set<number | string> = new Set();
  // 标记采样器是否已加载
  private samplerLoaded: boolean = false;

  constructor() {
    // 初始化Tone.js
    Tone.start();
    
    // 创建合成器作为备用
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    // 应用默认设置
    this.applySettings(this.defaultSettings);
    
    // 初始化采样器
    this.initSampler();
  }

  // 初始化采样器
  private async initSampler() {
    try {
      // 加载钢琴采样
      this.sampler = new Tone.Sampler({
        urls: {
          "C4": "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          "A4": "A4.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => {
          console.log("钢琴采样器加载完成");
          this.samplerLoaded = true;
          
          // 设置采样器音量
          if (this.sampler) {
            this.sampler.volume.value = Tone.gainToDb(this.defaultSettings.volume);
            this.sampler.toDestination();
          }
        }
      });
    } catch (error) {
      console.error("采样器加载失败:", error);
      // 使用合成器作为备用
      this.samplerLoaded = false;
    }
  }

  // 应用音频设置
  applySettings(settings: Partial<AudioSettings>): void {
    const currentSettings = { ...this.defaultSettings, ...settings };
    
    // 设置音量
    this.synth.volume.value = Tone.gainToDb(currentSettings.volume);
    if (this.sampler && this.samplerLoaded) {
      this.sampler.volume.value = Tone.gainToDb(currentSettings.volume);
    }
    
    // 设置音色参数（仅对合成器有效）
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
    
    // 保存设置
    this.defaultSettings = currentSettings;
  }

  // 播放单个音符
  playNote(note: Note, duration: string = '4n'): void {
    // 先停止该音符以避免重叠
    if (this.activeNotes.has(note.frequency)) {
      this.stopNote(note.frequency);
    }
    
    // 添加到活跃音符集合
    this.activeNotes.add(note.fullName);
    
    // 根据设置选择使用采样器或合成器
    if (this.defaultSettings.useSampler && this.sampler && this.samplerLoaded) {
      this.sampler.triggerAttackRelease(note.fullName, duration);
    } else {
      this.synth.triggerAttackRelease(note.frequency, duration);
    }
  }

  // 播放和弦
  playChord(chord: Chord, duration: string = '2n'): void {
    // 停止当前活跃的音符以避免叠加
    this.stopActiveNotes();
    
    // 提取和弦音符名称
    const noteNames = chord.noteNames;
    
    // 添加到活跃音符集合
    noteNames.forEach(note => this.activeNotes.add(note));
    
    // 根据设置选择使用采样器或合成器
    if (this.defaultSettings.useSampler && this.sampler && this.samplerLoaded) {
      this.sampler.triggerAttackRelease(noteNames, duration);
    } else {
      this.synth.triggerAttackRelease(chord.frequencies, duration);
    }
  }

  // 停止特定音符
  private stopNote(noteOrFreq: string | number): void {
    if (this.defaultSettings.useSampler && this.sampler && this.samplerLoaded) {
      if (typeof noteOrFreq === 'string') {
        this.sampler.triggerRelease(noteOrFreq);
      }
    } else {
      this.synth.triggerRelease(noteOrFreq);
    }
    this.activeNotes.delete(noteOrFreq);
  }

  // 停止特定的活跃音符
  private stopActiveNotes(): void {
    if (this.activeNotes.size > 0) {
      const notesToRelease = Array.from(this.activeNotes);
      
      if (this.defaultSettings.useSampler && this.sampler && this.samplerLoaded) {
        notesToRelease.forEach(note => {
          if (typeof note === 'string') {
            this.sampler?.triggerRelease(note);
          }
        });
      } else {
        this.synth.triggerRelease(notesToRelease);
      }
      
      this.activeNotes.clear();
    }
  }

  // 停止所有声音
  stopAll(): void {
    if (this.defaultSettings.useSampler && this.sampler && this.samplerLoaded) {
      this.sampler.releaseAll();
    }
    this.synth.releaseAll();
    this.activeNotes.clear();
  }
  
  // 获取当前设置
  getSettings(): AudioSettings {
    return { ...this.defaultSettings };
  }
  
  // 检查采样器是否已加载
  isSamplerLoaded(): boolean {
    return this.samplerLoaded;
  }
} 