import { ChordType } from './music'

// 获取和弦类型的中文说明
export function getChordTypeLabel(type: ChordType): string {
  switch (type) {
    case ChordType.MAJOR: return '大三和弦';
    case ChordType.MINOR: return '小三和弦';
    case ChordType.DIMINISHED: return '减三和弦';
    case ChordType.AUGMENTED: return '增三和弦';
    case ChordType.SUSPENDED_SECOND: return '挂二和弦';
    case ChordType.SUSPENDED_FOURTH: return '挂四和弦';
    case ChordType.DOMINANT_SEVENTH: return '属七和弦';
    case ChordType.MAJOR_SEVENTH: return '大七和弦';
    case ChordType.MINOR_SEVENTH: return '小七和弦';
    case ChordType.MINOR_MAJOR_SEVENTH: return '小大七和弦';
    case ChordType.HALF_DIMINISHED_SEVENTH: return '半减七和弦';
    case ChordType.SIXTH: return '大六和弦';
    case ChordType.MINOR_SIXTH: return '小六和弦';
    case ChordType.MAJOR_NINTH: return '大九和弦';
    case ChordType.MINOR_NINTH: return '小九和弦';
    default: return '未知和弦类型';
  }
}

// 获取和弦后缀（简短标记）
export function getChordSuffix(type: ChordType): string {
  switch (type) {
    case ChordType.MAJOR: return '';  // 大三和弦没有后缀
    case ChordType.MINOR: return 'm'; // 小三和弦显示m
    case ChordType.DIMINISHED: return 'dim'; // 减三和弦显示dim
    case ChordType.AUGMENTED: return 'aug'; // 增三和弦显示aug
    case ChordType.SUSPENDED_SECOND: return 'sus2';
    case ChordType.SUSPENDED_FOURTH: return 'sus4';
    case ChordType.DOMINANT_SEVENTH: return '7';
    case ChordType.MAJOR_SEVENTH: return 'M7';
    case ChordType.MINOR_SEVENTH: return 'm7';
    case ChordType.MINOR_MAJOR_SEVENTH: return 'mM7';
    case ChordType.HALF_DIMINISHED_SEVENTH: return 'm7b5';
    case ChordType.SIXTH: return '6';
    case ChordType.MINOR_SIXTH: return 'm6';
    case ChordType.MAJOR_NINTH: return '9';
    case ChordType.MINOR_NINTH: return 'm9';
    default: return '';
  }
}

// 格式化音符名称，将升降号转换为专业音乐符号的上下标
export function formatNoteName(note: string): string {
  return note
    .replace(/♯/g, '<sup>♯</sup>')
    .replace(/♭/g, '<sub>♭</sub>');
}

// 获取简短的音符名称
export function getShortNoteName(note: string): string {
  return note.replace('sharp', '#')
            .replace('flat', 'b');
} 