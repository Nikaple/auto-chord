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
  SUSPENDED_SECOND = 'suspended_second',
  SUSPENDED_FOURTH = 'suspended_fourth',
  DOMINANT_SEVENTH = 'dominant_seventh',
  MAJOR_SEVENTH = 'major_seventh',
  MINOR_SEVENTH = 'minor_seventh',
  MINOR_MAJOR_SEVENTH = 'minor_major_seventh',
  HALF_DIMINISHED_SEVENTH = 'half_diminished_seventh',
  SIXTH = 'sixth',
  MINOR_SIXTH = 'minor_sixth',
  MAJOR_NINTH = 'major_ninth',
  MINOR_NINTH = 'minor_ninth'
}

// 和弦类
export class Chord {
  root: Note;
  type: ChordType;
  notes: Note[];
  octave: number;

  constructor(rootName: string, octave: number = 4, type: ChordType = ChordType.MAJOR) {
    this.root = new Note(rootName, octave);
    this.type = type;
    this.octave = octave;
    this.notes = this.calculateChordNotes();
  }

  // 获取和弦的音符名称数组
  getNotes(): string[] {
    return this.notes.map(note => note.name);
  }

  // 获取和弦的第七音
  getSeventh(): string | null {
    if (this.type.includes('7')) {
      const seventhNote = this.notes[3]; // 第七音是第四个音符
      return seventhNote ? seventhNote.name : null;
    }
    return null;
  }

  // 计算和弦包含的音符
  private calculateChordNotes(): Note[] {
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
      case ChordType.MINOR_MAJOR_SEVENTH:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 3)); // 小三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 11)); // 大七度
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
      case ChordType.MAJOR_NINTH:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 4)); // 大三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 11)); // 大七度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 14)); // 大九度
        break;
      case ChordType.MINOR_NINTH:
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 3)); // 小三度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 7)); // 纯五度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 10)); // 小七度
        notes.push(this.getNoteAtInterval(rootIndex, rootOctave, 14)); // 小九度
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
      case ChordType.MINOR_MAJOR_SEVENTH:
        return 'mM7';
      case ChordType.HALF_DIMINISHED_SEVENTH:
        return 'm7b5';
      case ChordType.SIXTH:
        return '6';
      case ChordType.MINOR_SIXTH:
        return 'm6';
      case ChordType.MAJOR_NINTH:
        return '9';
      case ChordType.MINOR_NINTH:
        return 'm9';
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

// 所有音符（包括升降号）
export const ALL_NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

// 获取音符在音阶中的位置（0-11）
export function getNoteIndex(note: string): number {
  return ALL_NOTES.indexOf(note);
}

// 根据位置获取音符
export function getNoteByIndex(index: number): string {
  // 确保索引在0-11范围内
  const normalizedIndex = ((index % 12) + 12) % 12;
  return ALL_NOTES[normalizedIndex];
}

// 计算音程
export function getInterval(note1: string, note2: string): number {
  const index1 = getNoteIndex(note1);
  const index2 = getNoteIndex(note2);
  return ((index2 - index1 + 12) % 12);
}

// 根据音程获取新音符
export function transposeNote(note: string, semitones: number): string {
  const index = getNoteIndex(note);
  return getNoteByIndex(index + semitones);
}

// 获取大调音阶的级数
export function getScaleDegree(tonic: string, note: string): number {
  const interval = getInterval(tonic, note);
  // 大调音阶的音程模式：2,2,1,2,2,2,1
  const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
  return majorScaleIntervals.indexOf(interval) + 1;
}

// 根据调性和级数获取和弦
export function getChordByDegree(tonic: string, degree: number, octave: number = 4, forceType?: ChordType): { root: string, type: ChordType } {
  // 大调音阶的和弦类型模式
  const chordTypes = [
    ChordType.MAJOR,        // I
    ChordType.MINOR,        // ii
    ChordType.MINOR,        // iii
    ChordType.MAJOR,        // IV
    ChordType.MAJOR,        // V
    ChordType.MINOR,        // vi
    ChordType.DIMINISHED    // vii°
  ];

  // 大调音阶的音程
  const intervals = [0, 2, 4, 5, 7, 9, 11];
  
  // 处理半音级数
  const isHalfStep = degree % 1 !== 0;
  const baseDegree = Math.floor(degree);
  
  // 计算根音
  let rootIndex;
  if (isHalfStep) {
    // 对于半音级数，我们取基础级数的音程，然后升高半音
    const baseInterval = intervals[(baseDegree - 1) % 7];
    rootIndex = getNoteIndex(tonic) + baseInterval + 1;
  } else {
    rootIndex = getNoteIndex(tonic) + intervals[(degree - 1) % 7];
  }
  
  // 获取根音名称
  const root = getNoteByIndex(rootIndex % 12);
  
  // 确定和弦类型
  let type: ChordType;
  if (forceType) {
    type = forceType;
  } else if (isHalfStep) {
    // 半音级数默认为减和弦
    type = ChordType.DIMINISHED;
  } else {
    type = chordTypes[(degree - 1) % 7];
  }
  
  return { root, type };
}

// 获取和弦音程
function getChordIntervals(type: ChordType): number[] {
  switch (type) {
    case ChordType.MAJOR:
      return [0, 4, 7];  // 大三和弦：根音、大三度、纯五度
    case ChordType.MINOR:
      return [0, 3, 7];  // 小三和弦：根音、小三度、纯五度
    case ChordType.DIMINISHED:
      return [0, 3, 6];  // 减三和弦：根音、小三度、减五度
    case ChordType.AUGMENTED:
      return [0, 4, 8];  // 增三和弦：根音、大三度、增五度
    case ChordType.SUSPENDED_SECOND:
      return [0, 2, 7];  // sus2和弦：根音、大二度、纯五度
    case ChordType.SUSPENDED_FOURTH:
      return [0, 5, 7];  // sus4和弦：根音、纯四度、纯五度
    case ChordType.DOMINANT_SEVENTH:
      return [0, 4, 7, 10];  // 属七和弦：根音、大三度、纯五度、小七度
    case ChordType.MAJOR_SEVENTH:
      return [0, 4, 7, 11];  // 大七和弦：根音、大三度、纯五度、大七度
    case ChordType.MINOR_SEVENTH:
      return [0, 3, 7, 10];  // 小七和弦：根音、小三度、纯五度、小七度
    case ChordType.MINOR_MAJOR_SEVENTH:
      return [0, 3, 7, 11];  // 小大七和弦：根音、小三度、纯五度、大七度
    case ChordType.HALF_DIMINISHED_SEVENTH:
      return [0, 3, 6, 10];  // 半减七和弦：根音、小三度、减五度、小七度
    case ChordType.SIXTH:
      return [0, 4, 7, 9];   // 大六和弦：根音、大三度、纯五度、大六度
    case ChordType.MINOR_SIXTH:
      return [0, 3, 7, 9];   // 小六和弦：根音、小三度、纯五度、大六度
    case ChordType.MAJOR_NINTH:
      return [0, 4, 7, 11, 14];  // 大九和弦：根音、大三度、纯五度、大七度、大九度
    case ChordType.MINOR_NINTH:
      return [0, 3, 7, 10, 14];  // 小九和弦：根音、小三度、纯五度、小七度、大九度
    default:
      return [0, 4, 7];  // 默认返回大三和弦
  }
} 