// 音符类
export class Note {
  name: string;
  octave: number;
  frequency: number;

  constructor(name: string, octave: number) {
    this.name = name;
    this.octave = octave;
    this.frequency = Note.getFrequency(name, octave);
  }

  // 获取音符频率
  static getFrequency(note: string, octave: number): number {
    // 将音乐符号转换为标准符号
    const standardNote = note
      .replace('♯', '#')
      .replace('♭', 'b');

    const notes: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    
    // A4 = 440Hz
    const A4 = 440;
    const A4_OCTAVE = 4;
    const A4_NOTE = 9; // A is the 9th note in the chromatic scale
    
    // 计算距离A4的半音数
    const semitones = (octave - A4_OCTAVE) * 12 + notes[standardNote] - A4_NOTE;
    
    // 使用等比关系计算频率: f = A4 * 2^(n/12)
    return A4 * Math.pow(2, semitones / 12);
  }

  // 获取音符完整名称
  get fullName(): string {
    // 将音乐符号转换为标准符号
    const standardName = this.name
      .replace('♯', '#')
      .replace('♭', 'b');
    return `${standardName}${this.octave}`;
  }
}

// 和弦类型枚举
export enum ChordType {
  MAJOR = 'major',
  MINOR = 'minor',
  DIMINISHED = 'diminished',
  AUGMENTED = 'augmented',
  SUSPENDED_SECOND = 'sus2',
  SUSPENDED_FOURTH = 'sus4',
  DOMINANT_SEVENTH = '7',
  MAJOR_SEVENTH = 'M7',
  MINOR_SEVENTH = 'min7',
  HALF_DIMINISHED_SEVENTH = 'm7b5',
  SIXTH = '6',
  MINOR_SIXTH = 'min6',
  NINTH = '9'
}

// 和弦类
export class Chord {
  root: Note;
  type: ChordType;
  notes: Note[];

  constructor(rootName: string, octave: number, type: ChordType = ChordType.MAJOR) {
    this.root = new Note(rootName, octave);
    this.type = type;
    this.notes = this.calculateChordNotes();
  }

  // 计算和弦包含的音符 - 修改为公开方法
  public calculateChordNotes(): Note[] {
    const notes: Note[] = [this.root];
    const rootName = this.root.name;
    const rootOctave = this.root.octave;
    
    // 所有音符名称
    const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // 找出根音在数组中的索引
    const rootIndex = allNotes.indexOf(rootName.replace('♯', '#').replace('♭', 'b'));
    
    // 根据和弦类型添加其他音符
    switch (this.type) {
      case ChordType.MAJOR:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 4)); // 大三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        break;
      case ChordType.MINOR:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 3)); // 小三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        break;
      case ChordType.DIMINISHED:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 3)); // 小三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 6)); // 减五度
        break;
      case ChordType.AUGMENTED:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 4)); // 大三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 8)); // 增五度
        break;
      case ChordType.SUSPENDED_SECOND:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 2)); // 大二度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        break;
      case ChordType.SUSPENDED_FOURTH:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 5)); // 纯四度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        break;
      case ChordType.DOMINANT_SEVENTH:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 4)); // 大三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 10)); // 小七度
        break;
      case ChordType.MAJOR_SEVENTH:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 4)); // 大三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 11)); // 大七度
        break;
      case ChordType.MINOR_SEVENTH:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 3)); // 小三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 10)); // 小七度
        break;
      case ChordType.HALF_DIMINISHED_SEVENTH:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 3)); // 小三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 6)); // 减五度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 10)); // 小七度
        break;
      case ChordType.SIXTH:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 4)); // 大三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 9)); // 大六度
        break;
      case ChordType.MINOR_SIXTH:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 3)); // 小三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 9)); // 大六度
        break;
      case ChordType.NINTH:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 4)); // 大三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 10)); // 小七度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 14)); // 大九度（跨越八度）
        break;
      default:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 4)); // 默认大三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 默认纯五度
    }
    
    return notes;
  }
  
  // 获取特定音程的音符
  private getNoteAtInterval(rootIndex: number, rootOctave: number, semitones: number): Note {
    const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // 计算新音符的索引和八度
    let newIndex = (rootIndex + semitones) % 12;
    let newOctave = rootOctave + Math.floor((rootIndex + semitones) / 12);
    
    return new Note(allNotes[newIndex], newOctave);
  }
  
  // 获取和弦名称
  get name(): string {
    return `${this.root.name}${this.getChordSuffix()}`;
  }
  
  // 获取和弦后缀
  private getChordSuffix(): string {
    switch (this.type) {
      case ChordType.MAJOR:
        return '';
      case ChordType.MINOR:
        return 'm';
      case ChordType.DIMINISHED:
        return 'dim';
      case ChordType.AUGMENTED:
        return 'aug';
      case ChordType.SUSPENDED_SECOND:
        return 'sus2';
      case ChordType.SUSPENDED_FOURTH:
        return 'sus4';
      case ChordType.DOMINANT_SEVENTH:
        return '7';
      case ChordType.MAJOR_SEVENTH:
        return 'M7';
      case ChordType.MINOR_SEVENTH:
        return 'm7';
      case ChordType.HALF_DIMINISHED_SEVENTH:
        return 'm7b5';
      case ChordType.SIXTH:
        return '6';
      case ChordType.MINOR_SIXTH:
        return 'm6';
      case ChordType.NINTH:
        return '9';
      default:
        return '';
    }
  }
  
  // 获取所有音符的频率
  get frequencies(): number[] {
    return this.notes.map(note => note.frequency);
  }
  
  // 获取所有音符的名称
  get noteNames(): string[] {
    return this.notes.map(note => note.fullName);
  }
} 