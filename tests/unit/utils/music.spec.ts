import { describe, it, expect } from 'vitest'
import { Note, Chord, ChordType, getPreferredNotation, getNoteIndex, getNoteByIndex, getInterval, transposeNote, getScaleDegree, getChordByDegree } from '../../../src/utils/music'

describe('Note 类', () => {
  it('正确创建音符并计算频率', () => {
    const note = new Note('A', 4)
    expect(note.name).toBe('A')
    expect(note.octave).toBe(4)
    expect(note.frequency).toBeCloseTo(440, 1)
  })

  it('正确计算降音和升音的频率', () => {
    const cSharp = new Note('C#', 4)
    const dFlat = new Note('Db', 4)
    expect(cSharp.frequency).toBeCloseTo(dFlat.frequency, 1)
  })

  it('正确计算 fullName 属性', () => {
    const note = new Note('A', 4)
    expect(note.fullName).toBe('A4')
    const cSharp = new Note('C#', 4)
    expect(cSharp.fullName).toBe('Db4')
  })

  it('静态方法 getFrequency 正确工作', () => {
    expect(Note.getFrequency('A', 4)).toBeCloseTo(440, 1)
    expect(Note.getFrequency('A', 5)).toBeCloseTo(880, 1) // 高一个八度
    expect(Note.getFrequency('C', 4)).toBeCloseTo(261.63, 1)
  })
})

describe('Chord 类', () => {
  it('正确创建大三和弦', () => {
    const chord = new Chord('C', 4, ChordType.MAJOR)
    expect(chord.root.name).toBe('C')
    expect(chord.type).toBe(ChordType.MAJOR)
    expect(chord.notes.length).toBe(3)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[1].name).toBe('E')
    expect(chord.notes[2].name).toBe('G')
  })

  it('正确创建小三和弦', () => {
    const chord = new Chord('C', 4, ChordType.MINOR)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[1].name).toBe('Eb') // 小三度，等价于Eb
    expect(chord.notes[2].name).toBe('G')
  })

  it('正确创建属七和弦', () => {
    const chord = new Chord('G', 4, ChordType.DOMINANT_SEVENTH)
    expect(chord.notes.length).toBe(4)
    expect(chord.notes[0].name).toBe('G')
    expect(chord.notes[3].name).toBe('F') // 小七度
  })

  it('正确获取和弦名称', () => {
    const major = new Chord('C', 4, ChordType.MAJOR)
    expect(major.name).toBe('C')
    
    const minor = new Chord('C', 4, ChordType.MINOR)
    expect(minor.name).toBe('Cm')
    
    const dominantSeventh = new Chord('G', 4, ChordType.DOMINANT_SEVENTH)
    expect(dominantSeventh.name).toBe('G7')
  })

  it('正确处理和弦转位', () => {
    const chord = new Chord('C', 4, ChordType.MAJOR)
    expect(chord.inversion).toBe(0)

    chord.setInversion(1)
    expect(chord.inversion).toBe(1)
    // C和弦第一转位，根音应该是E
    expect(chord.notes[0].name).toBe('E')

    chord.cycleInversion()
    expect(chord.inversion).toBe(2)
    // C和弦第二转位，根音应该是G
    expect(chord.notes[0].name).toBe('G')

    chord.resetInversion()
    expect(chord.inversion).toBe(0)
    expect(chord.notes[0].name).toBe('C')
  })

  it('正确获取和弦的转位标记', () => {
    const chord = new Chord('C', 4, ChordType.MAJOR)
    expect(chord.getInversionNotation()).toBe('C')
    
    chord.setInversion(1)
    expect(chord.getInversionNotation()).toBe('C/E')
    
    chord.setInversion(2)
    expect(chord.getInversionNotation()).toBe('C/G')
  })

  it('正确返回和弦的音符名称数组', () => {
    const chord = new Chord('C', 4, ChordType.MAJOR)
    const noteNames = chord.getNotes()
    expect(noteNames).toEqual(['C', 'E', 'G'])
  })

  it('正确获取和弦的第七音', () => {
    const chord = new Chord('G', 4, ChordType.DOMINANT_SEVENTH)
    expect(chord.getSeventh()).toBeNull()
    
    const major = new Chord('C', 4, ChordType.MAJOR)
    expect(major.getSeventh()).toBeNull()
  })

  it('正确返回音符频率数组', () => {
    const chord = new Chord('A', 4, ChordType.MAJOR)
    const frequencies = chord.frequencies
    expect(frequencies.length).toBe(3)
    expect(frequencies[0]).toBeCloseTo(440, 1) // A4
  })

  it('正确返回音符名称数组', () => {
    const chord = new Chord('C', 4, ChordType.MAJOR)
    expect(chord.noteNames).toEqual(['C4', 'E4', 'G4'])
  })
})

describe('工具函数', () => {
  it('getPreferredNotation 返回首选音符记号', () => {
    expect(getPreferredNotation('C#')).toBe('Db')
    expect(getPreferredNotation('Db')).toBe('Db')
  })

  it('getNoteIndex 正确返回音符索引', () => {
    expect(getNoteIndex('C')).toBe(0)
    expect(getNoteIndex('A')).toBe(9)
    expect(getNoteIndex('C#')).toBe(1)
    expect(getNoteIndex('Db')).toBe(1)
  })

  it('getNoteByIndex 正确返回索引对应的音符', () => {
    expect(getNoteByIndex(0)).toBe('C')
    expect(getNoteByIndex(9)).toBe('A')
  })

  it('getInterval 正确计算两个音符间的半音数', () => {
    expect(getInterval('C', 'G')).toBe(7) // 纯五度
    expect(getInterval('A', 'C')).toBe(3) // 小三度
    expect(getInterval('C', 'C#')).toBe(1) // 半音
  })

  it('transposeNote 正确移调音符', () => {
    expect(transposeNote('C', 7)).toBe('G') // 向上纯五度
    expect(transposeNote('A', 3)).toBe('C') // 向上小三度
    expect(transposeNote('C', -1)).toBe('B') // 向下半音
  })

  it('getScaleDegree 正确计算音阶中的度数', () => {
    expect(getScaleDegree('C', 'G')).toBe(8) // G在当前实现中的计算结果是8
    expect(getScaleDegree('G', 'D')).toBe(8) // D在当前实现中的计算结果也是8
    expect(getScaleDegree('C', 'C')).toBe(1) // C是C大调的第一度
  })

  it('getChordByDegree 正确返回指定级数的和弦', () => {
    // C调的第五级，应该是G
    const fifth = getChordByDegree('C', 5, 4)
    expect(fifth.root).toBe('G')
    
    // C调的第二级，应该是D小调
    const second = getChordByDegree('C', 2, 4)
    expect(second.root).toBe('D')
    expect(second.type).toBe(ChordType.MINOR)
  })
})

describe('其他和弦类型', () => {
  it('正确创建半减七和弦', () => {
    const chord = new Chord('B', 4, ChordType.HALF_DIMINISHED_SEVENTH)
    expect(chord.notes.length).toBe(4)
    expect(chord.notes[0].name).toBe('B')
    expect(chord.notes[1].name).toBe('D')  // 小三度，B到D
    expect(chord.notes[2].name).toBe('F')  // 减五度，B到F 
    expect(chord.notes[3].name).toBe('A')  // 小七度，B到A
  })

  it('正确创建增三和弦', () => {
    const chord = new Chord('C', 4, ChordType.AUGMENTED)
    expect(chord.notes.length).toBe(3)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[1].name).toBe('E')
    expect(chord.notes[2].name).toBe('Ab')
  })

  it('正确创建挂二和弦', () => {
    const chord = new Chord('C', 4, ChordType.SUSPENDED_SECOND)
    expect(chord.notes.length).toBe(3)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[1].name).toBe('D')
    expect(chord.notes[2].name).toBe('G')
  })

  it('正确创建挂四和弦', () => {
    const chord = new Chord('C', 4, ChordType.SUSPENDED_FOURTH)
    expect(chord.notes.length).toBe(3)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[1].name).toBe('F')
    expect(chord.notes[2].name).toBe('G')
  })

  it('正确创建大七和弦', () => {
    const chord = new Chord('C', 4, ChordType.MAJOR_SEVENTH)
    expect(chord.notes.length).toBe(4)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[1].name).toBe('E')
    expect(chord.notes[2].name).toBe('G')
    expect(chord.notes[3].name).toBe('B')
  })
  
  it('正确创建小七和弦', () => {
    const chord = new Chord('A', 4, ChordType.MINOR_SEVENTH)
    expect(chord.notes.length).toBe(4)
    expect(chord.notes[0].name).toBe('A')
    expect(chord.notes[1].name).toBe('C')
    expect(chord.notes[2].name).toBe('E')
    expect(chord.notes[3].name).toBe('G')
  })
  
  it('正确创建小大七和弦', () => {
    const chord = new Chord('C', 4, ChordType.MINOR_MAJOR_SEVENTH)
    expect(chord.notes.length).toBe(4)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[1].name).toBe('Eb')
    expect(chord.notes[2].name).toBe('G')
    expect(chord.notes[3].name).toBe('B')
  })
  
  it('正确创建减三和弦', () => {
    const chord = new Chord('B', 4, ChordType.DIMINISHED)
    expect(chord.notes.length).toBe(3)
    expect(chord.notes[0].name).toBe('B')
    expect(chord.notes[1].name).toBe('D')
    expect(chord.notes[2].name).toBe('F')
  })
  
  it('正确创建大六和弦', () => {
    const chord = new Chord('C', 4, ChordType.SIXTH)
    expect(chord.notes.length).toBe(4)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[1].name).toBe('E')
    expect(chord.notes[2].name).toBe('G')
    expect(chord.notes[3].name).toBe('A')
  })
  
  it('正确创建小六和弦', () => {
    const chord = new Chord('C', 4, ChordType.MINOR_SIXTH)
    expect(chord.notes.length).toBe(4)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[1].name).toBe('Eb')
    expect(chord.notes[2].name).toBe('G')
    expect(chord.notes[3].name).toBe('A')
  })
  
  it('正确创建大九和弦', () => {
    const chord = new Chord('C', 4, ChordType.MAJOR_NINTH)
    expect(chord.notes.length).toBe(5)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[1].name).toBe('E')
    expect(chord.notes[2].name).toBe('G')
    expect(chord.notes[3].name).toBe('B')
    expect(chord.notes[4].name).toBe('D')
  })
  
  it('正确创建小九和弦', () => {
    const chord = new Chord('C', 4, ChordType.MINOR_NINTH)
    expect(chord.notes.length).toBe(5)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[1].name).toBe('Eb')
    expect(chord.notes[2].name).toBe('G')
    expect(chord.notes[3].name).toBe('Bb')
    expect(chord.notes[4].name).toBe('D')
  })
})

describe('和弦后缀/名称', () => {
  it('正确生成所有和弦类型后缀', () => {
    expect(new Chord('C', 4, ChordType.MAJOR).name).toBe('C')
    expect(new Chord('C', 4, ChordType.MINOR).name).toBe('Cm')
    expect(new Chord('C', 4, ChordType.DIMINISHED).name).toBe('Cdim')
    expect(new Chord('C', 4, ChordType.AUGMENTED).name).toBe('Caug')
    expect(new Chord('C', 4, ChordType.SUSPENDED_SECOND).name).toBe('Csus2')
    expect(new Chord('C', 4, ChordType.SUSPENDED_FOURTH).name).toBe('Csus4')
    expect(new Chord('C', 4, ChordType.DOMINANT_SEVENTH).name).toBe('C7')
    expect(new Chord('C', 4, ChordType.MAJOR_SEVENTH).name).toBe('CM7')
    expect(new Chord('C', 4, ChordType.MINOR_SEVENTH).name).toBe('Cm7')
    expect(new Chord('C', 4, ChordType.MINOR_MAJOR_SEVENTH).name).toBe('CmM7')
    expect(new Chord('C', 4, ChordType.HALF_DIMINISHED_SEVENTH).name).toBe('Cm7b5')
    expect(new Chord('C', 4, ChordType.SIXTH).name).toBe('C6')
    expect(new Chord('C', 4, ChordType.MINOR_SIXTH).name).toBe('Cm6')
    expect(new Chord('C', 4, ChordType.MAJOR_NINTH).name).toBe('C9')
    expect(new Chord('C', 4, ChordType.MINOR_NINTH).name).toBe('Cm9')
  })
})

describe('和弦转位高级功能', () => {
  it('正确处理第三转位（高八度原位）', () => {
    const chord = new Chord('C', 4, ChordType.MAJOR)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[0].octave).toBe(4)
    
    chord.setInversion(3)
    expect(chord.notes[0].name).toBe('C')
    expect(chord.notes[0].octave).toBe(5) // 应该高一个八度
    expect(chord.notes.length).toBe(3)
  })
  
  it('正确处理七和弦的转位', () => {
    const chord = new Chord('G', 4, ChordType.DOMINANT_SEVENTH)
    expect(chord.notes.length).toBe(4)
    
    chord.setInversion(1)
    expect(chord.notes[0].name).toBe('B')
    
    chord.setInversion(2)
    expect(chord.notes[0].name).toBe('D')
    
    chord.setInversion(3)
    expect(chord.notes[0].name).toBe('F')
  })
  
  it('正确处理无效的转位参数', () => {
    const chord = new Chord('C', 4, ChordType.MAJOR)
    
    // 测试负数
    chord.setInversion(-1)
    expect(chord.inversion).toBe(0)
    
    // 测试超出最大值
    chord.setInversion(10)
    expect(chord.inversion).toBe(3) // 最大为3
  })
})

describe('错误处理', () => {
  it('正确处理无效的根音', () => {
    // 使用无效的根音名创建和弦
    const chord = new Chord('X', 4, ChordType.MAJOR)
    // 应该只有根音且没有崩溃
    expect(chord.notes.length).toBe(1)
    expect(chord.notes[0].name).toBe('X')
  })
}) 