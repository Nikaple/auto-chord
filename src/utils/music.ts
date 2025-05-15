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
      .replace('#', '#')
      .replace('b', 'b');

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
      .replace('#', '#')
      .replace('b', 'b');
    // 使用偏好的记号格式
    const preferredName = getPreferredNotation(standardName);
    return `${preferredName}${this.octave}`;
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
  inversion: number = 0;  // 添加转位属性

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
    // 首先确保根音使用了correct的octave
    const rootWithCorrectOctave = new Note(this.root.name, this.octave);
    const notes: Note[] = [rootWithCorrectOctave];
    
    const rootName = this.root.name;
    const rootOctave = this.octave; // 使用和弦的八度，而不是根音的八度
    
    // 所有音符名称
    const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // 将降号形式转换为升号形式以便查找索引
    const normalizedRoot = rootName
      .replace('Db', 'C#')
      .replace('Eb', 'D#')
      .replace('Gb', 'F#')
      .replace('Ab', 'G#')
      .replace('Bb', 'A#');
    
    // 找出根音在数组中的索引
    const rootIndex = allNotes.indexOf(normalizedRoot);
    
    if (rootIndex === -1) {
      console.error('无效的根音:', rootName, 'normalized:', normalizedRoot);
      // 如果找不到根音，返回只有根音的和弦
      return notes;
    }
    
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
    
    // 获取音符名称，并转换为偏好的记号格式
    const noteName = allNotes[newIndex];
    const preferredNoteName = getPreferredNotation(noteName);
    
    return new Note(preferredNoteName, newOctave);
  }
  
  // 获取和弦名称
  get name(): string {
    return `${getPreferredNotation(this.root.name)}${this.getChordSuffix()}`;
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

  // 获取和弦的最大转位数
  private getMaxInversion(): number {
    // 所有和弦都支持三个转位（0-3），三和弦的第三转位等同于原位但升高八度
    return 3;
  }

  // 设置和弦转位
  setInversion(inversion: number): void {
    const maxInversion = this.getMaxInversion();
    
    // 确保转位数在有效范围内
    if (inversion < 0) {
      this.inversion = 0;
    } else if (inversion > maxInversion) {
      this.inversion = maxInversion;
    } else {
      this.inversion = inversion;
    }
    
    // 重新计算音符列表
    this.notes = this.calculateInvertedNotes();
  }

  // 循环切换转位
  cycleInversion(): void {
    const maxInversion = this.getMaxInversion();
    this.setInversion((this.inversion + 1) % (maxInversion + 1));
  }

  // 重置为原位
  resetInversion(): void {
    this.setInversion(0);
  }

  // 计算转位后的音符列表
  private calculateInvertedNotes(): Note[] {
    if (this.inversion === 0) {
      return this.calculateChordNotes();
    }

    const baseNotes = this.calculateChordNotes();
    const invertedNotes = [...baseNotes];
    
    // 对于三和弦的第三转位，等同于原位但所有音符升高八度
    if (baseNotes.length === 3 && this.inversion === 3) {
      return baseNotes.map(note => new Note(note.name, note.octave + 1));
    }
    
    // 将指定数量的低音音符移动到高八度
    for (let i = 0; i < this.inversion; i++) {
      const note = invertedNotes.shift();
      if (note) {
        invertedNotes.push(new Note(note.name, note.octave + 1));
      }
    }
    
    return invertedNotes;
  }

  // 获取转位标记（如 C/E 表示 C 大三和弦的第一转位）
  getInversionNotation(): string {
    // 如果是原位或三和弦的第三转位（高八度原位），直接返回和弦名称
    if (this.inversion === 0 || (this.notes.length === 3 && this.inversion === 3)) {
      // 使用偏好的记号显示和弦名称
      return `${getPreferredNotation(this.root.name)}${this.getChordSuffix()}`;
    }
    // 使用偏好的记号显示和弦和低音
    return `${getPreferredNotation(this.root.name)}${this.getChordSuffix()}/${getPreferredNotation(this.notes[0].name)}`;
  }
}

// 所有音符（包括升降号）
export const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 音符偏好的显示方式，一些音符更常用降号形式表示
export const PREFERRED_NOTATION: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb'
};

// 将音符名称转换为偏好的记号格式
export function getPreferredNotation(note: string): string {
  if (PREFERRED_NOTATION[note]) {
    return PREFERRED_NOTATION[note];
  }
  return note;
}

// 获取音符在音阶中的位置（0-11）
export function getNoteIndex(note: string): number {
  // 如果是降号形式，先转换为升号形式以便查找索引
  const normalizedNote = note.replace('Db', 'C#').replace('Eb', 'D#')
                             .replace('Gb', 'F#').replace('Ab', 'G#')
                             .replace('Bb', 'A#');
  return ALL_NOTES.indexOf(normalizedNote);
}

// 根据位置获取音符，使用偏好的记号
export function getNoteByIndex(index: number): string {
  // 确保索引在0-11范围内
  const normalizedIndex = ((index % 12) + 12) % 12;
  const note = ALL_NOTES[normalizedIndex];
  return getPreferredNotation(note);
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
  const tonicIndex = getNoteIndex(tonic);
  const noteIndex = getNoteIndex(note);
  return ((noteIndex - tonicIndex + 12) % 12) + 1;
}

// 根据调性和级数获取和弦
export function getChordByDegree(tonic: string, degree: number, _octave: number = 4, forceType?: ChordType): { root: string, type: ChordType } {
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