import * as Tone from 'tone'
import { Note, Chord } from './music'

interface AudioSettings {
  volume: number;      // 音量: 0 到 1
  release: number;     // 释音时间（秒）
  reverb: number;      // 混响: 0 到 1
  brightness: number;  // 音色亮度: 0 到 1
  dynamics: number;    // 演奏力度: 0 到 1
}

export default class AudioSystem {
  private sampler: Tone.Sampler | null = null;
  private reverb: Tone.Reverb;
  private eq: Tone.EQ3;
  private compressor: Tone.Compressor;
  
  private defaultSettings: AudioSettings = {
    volume: 0.7,
    release: 1.5,
    reverb: 0.3,
    brightness: 0.5,
    dynamics: 0.7
  };

  // 存储当前正在播放的音符
  private activeNotes: Set<string> = new Set();
  // 标记采样器是否已加载
  private samplerLoaded: boolean = false;

  constructor() {
    // 初始化Tone.js
    Tone.start();
    
    // 创建效果器
    this.reverb = new Tone.Reverb(2).toDestination();
    this.reverb.wet.value = this.defaultSettings.reverb;
    
    this.eq = new Tone.EQ3({
      low: 0,
      mid: 0,
      high: 0,
    }).connect(this.reverb);
    
    this.compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.1,
      release: 0.2
    }).connect(this.eq);
    
    // 初始化采样器
    this.initSampler();
    
    // 应用默认设置
    this.applySettings(this.defaultSettings);
  }

  // 初始化采样器
  private async initSampler() {
    try {
      // 加载钢琴采样
      this.sampler = new Tone.Sampler({
        urls: {
          "A0": "A0.mp3",
          "C1": "C1.mp3",
          "D#1": "Ds1.mp3",
          "F#1": "Fs1.mp3",
          "A1": "A1.mp3",
          "C2": "C2.mp3",
          "D#2": "Ds2.mp3",
          "F#2": "Fs2.mp3",
          "A2": "A2.mp3",
          "C3": "C3.mp3",
          "D#3": "Ds3.mp3",
          "F#3": "Fs3.mp3",
          "A3": "A3.mp3",
          "C4": "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          "A4": "A4.mp3",
          "C5": "C5.mp3",
          "D#5": "Ds5.mp3",
          "F#5": "Fs5.mp3",
          "A5": "A5.mp3",
          "C6": "C6.mp3",
          "D#6": "Ds6.mp3",
          "F#6": "Fs6.mp3",
          "A6": "A6.mp3",
          "C7": "C7.mp3",
          "D#7": "Ds7.mp3",
          "F#7": "Fs7.mp3",
          "A7": "A7.mp3",
          "C8": "C8.mp3"
        },
        release: this.defaultSettings.release,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => {
          console.log("钢琴采样器加载完成");
          this.samplerLoaded = true;
          
          // 设置采样器参数
          if (this.sampler) {
            this.sampler.volume.value = Tone.gainToDb(this.defaultSettings.volume);
            this.sampler.connect(this.compressor);
          }
        }
      });
    } catch (error) {
      console.error("采样器加载失败:", error);
      this.samplerLoaded = false;
    }
  }

  // 应用音频设置
  applySettings(settings: Partial<AudioSettings>): void {
    const currentSettings = { ...this.defaultSettings, ...settings };
    
    // 更新音量
    if (this.sampler && this.samplerLoaded) {
      this.sampler.volume.value = Tone.gainToDb(currentSettings.volume);
    }
    
    // 更新混响
    this.reverb.wet.value = currentSettings.reverb;
    
    // 更新释放时间
    if (this.sampler && this.samplerLoaded) {
      this.sampler.release = currentSettings.release;
    }
    
    // 更新亮度 (EQ高频调整)
    const brightnessValue = (currentSettings.brightness - 0.5) * 12; // 转换为-6dB到+6dB
    this.eq.high.value = brightnessValue;
    
    // 更新力度 (通过压缩比和增益调整)
    const dynamicsRatio = 6 - (currentSettings.dynamics * 5); // 压缩比从1到6
    this.compressor.set({ ratio: dynamicsRatio });
    
    // 保存设置
    this.defaultSettings = currentSettings;
  }

  // 播放单个音符
  playNote(note: Note, duration: string = '4n'): void {
    // 先停止该音符以避免重叠
    if (this.activeNotes.has(note.fullName)) {
      this.stopNote(note.fullName);
    }
    
    // 添加到活跃音符集合
    this.activeNotes.add(note.fullName);
    
    // 只有在采样器加载完成后才播放
    if (this.sampler && this.samplerLoaded) {
      // 根据力度设置调整音符的速度
      const velocity = 0.5 + (this.defaultSettings.dynamics * 0.5);
      this.sampler.triggerAttackRelease(note.fullName, duration, undefined, velocity);
    }
  }

  // 播放和弦
  playChord(chord: Chord, duration: string = '1n'): void {
    // 停止当前活跃的音符以避免叠加
    this.stopActiveNotes();
    
    // 提取和弦音符名称
    const noteNames = chord.noteNames;
    
    // 添加到活跃音符集合
    noteNames.forEach(note => this.activeNotes.add(note));
    
    // 只有在采样器加载完成后才播放
    if (this.sampler && this.samplerLoaded) {
      // The velocity also affects the attack and how long it takes for the sound to get up to full volume!
      const velocity = 0.5 + (this.defaultSettings.dynamics * 0.5);
      this.sampler.triggerAttackRelease(noteNames, duration, undefined, velocity);
    }
  }

  // 停止特定音符
  private stopNote(noteName: string): void {
    if (this.sampler && this.samplerLoaded) {
      this.sampler.triggerRelease(noteName);
    }
    this.activeNotes.delete(noteName);
  }

  // 停止特定的活跃音符
  private stopActiveNotes(): void {
    if (this.activeNotes.size > 0) {
      const notesToRelease = Array.from(this.activeNotes);
      
      if (this.sampler && this.samplerLoaded) {
        notesToRelease.forEach(note => {
          this.sampler?.triggerRelease(note);
        });
      }
      
      this.activeNotes.clear();
    }
  }

  // 停止所有声音
  stopAll(): void {
    if (this.sampler && this.samplerLoaded) {
      this.sampler.releaseAll();
    }
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