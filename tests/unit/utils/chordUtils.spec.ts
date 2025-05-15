import { describe, it, expect } from 'vitest'
import { ChordType } from '../../../src/utils/music'
import { getChordTypeLabel, getChordSuffix, formatNoteName, getShortNoteName } from '../../../src/utils/chordUtils'

describe('和弦工具函数', () => {
  describe('getChordTypeLabel', () => {
    it('返回正确的和弦类型中文标签', () => {
      expect(getChordTypeLabel(ChordType.MAJOR)).toBe('大三和弦')
      expect(getChordTypeLabel(ChordType.MINOR)).toBe('小三和弦')
      expect(getChordTypeLabel(ChordType.DIMINISHED)).toBe('减三和弦')
      expect(getChordTypeLabel(ChordType.AUGMENTED)).toBe('增三和弦')
      expect(getChordTypeLabel(ChordType.SUSPENDED_SECOND)).toBe('挂二和弦')
      expect(getChordTypeLabel(ChordType.SUSPENDED_FOURTH)).toBe('挂四和弦')
      expect(getChordTypeLabel(ChordType.DOMINANT_SEVENTH)).toBe('属七和弦')
      expect(getChordTypeLabel(ChordType.MAJOR_SEVENTH)).toBe('大七和弦')
      expect(getChordTypeLabel(ChordType.MINOR_SEVENTH)).toBe('小七和弦')
      expect(getChordTypeLabel(ChordType.MINOR_MAJOR_SEVENTH)).toBe('小大七和弦')
      expect(getChordTypeLabel(ChordType.HALF_DIMINISHED_SEVENTH)).toBe('半减七和弦')
      expect(getChordTypeLabel(ChordType.SIXTH)).toBe('大六和弦')
      expect(getChordTypeLabel(ChordType.MINOR_SIXTH)).toBe('小六和弦')
      expect(getChordTypeLabel(ChordType.MAJOR_NINTH)).toBe('大九和弦')
      expect(getChordTypeLabel(ChordType.MINOR_NINTH)).toBe('小九和弦')
      // @ts-expect-error 测试未知和弦类型
      expect(getChordTypeLabel('UNKNOWN')).toBe('未知和弦类型')
    })
  })

  describe('getChordSuffix', () => {
    it('返回正确的和弦类型后缀', () => {
      expect(getChordSuffix(ChordType.MAJOR)).toBe('')
      expect(getChordSuffix(ChordType.MINOR)).toBe('m')
      expect(getChordSuffix(ChordType.DIMINISHED)).toBe('dim')
      expect(getChordSuffix(ChordType.AUGMENTED)).toBe('aug')
      expect(getChordSuffix(ChordType.SUSPENDED_SECOND)).toBe('sus2')
      expect(getChordSuffix(ChordType.SUSPENDED_FOURTH)).toBe('sus4')
      expect(getChordSuffix(ChordType.DOMINANT_SEVENTH)).toBe('7')
      expect(getChordSuffix(ChordType.MAJOR_SEVENTH)).toBe('M7')
      expect(getChordSuffix(ChordType.MINOR_SEVENTH)).toBe('m7')
      expect(getChordSuffix(ChordType.MINOR_MAJOR_SEVENTH)).toBe('mM7')
      expect(getChordSuffix(ChordType.HALF_DIMINISHED_SEVENTH)).toBe('m7b5')
      expect(getChordSuffix(ChordType.SIXTH)).toBe('6')
      expect(getChordSuffix(ChordType.MINOR_SIXTH)).toBe('m6')
      expect(getChordSuffix(ChordType.MAJOR_NINTH)).toBe('9')
      expect(getChordSuffix(ChordType.MINOR_NINTH)).toBe('m9')
      // @ts-expect-error 测试未知和弦类型
      expect(getChordSuffix('UNKNOWN')).toBe('')
    })
  })

  describe('formatNoteName', () => {
    it('正确将音符名称中的升降号转换为HTML格式', () => {
      expect(formatNoteName('C')).toBe('C')
      expect(formatNoteName('C#')).toBe('C<sup>#</sup>')
      expect(formatNoteName('Db')).toBe('D<sub>b</sub>')
      expect(formatNoteName('F#m')).toBe('F<sup>#</sup>m')
      expect(formatNoteName('Bbmaj7')).toBe('B<sub>b</sub>maj7')
    })
  })

  describe('getShortNoteName', () => {
    it('正确将音符名称转换为短名称形式', () => {
      expect(getShortNoteName('C')).toBe('C')
      expect(getShortNoteName('Csharp')).toBe('C#')
      expect(getShortNoteName('Dflat')).toBe('Db')
      expect(getShortNoteName('Fsharp minor')).toBe('F# minor')
    })
  })
}) 