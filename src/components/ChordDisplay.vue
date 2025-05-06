<template>
  <div class="chord-display">
    <h2>当前和弦</h2>
    
    <div v-if="currentChord" class="chord-info">
      <div class="chord-name">{{ getInversionNotation(currentChord) }}</div>
      
      <div class="chord-notes">
        <span>音符：</span>
        <span class="note" v-for="(note, index) in currentChord.noteNames" :key="index">
          {{ getShortNoteName(note) }}
        </span>
      </div>
      
      <div class="chord-type">
        <span>类型：</span>
        <span class="chord-type-label">{{ getChordTypeLabel(currentChord.type) }}</span>
      </div>
      
      <div class="chord-degree" v-if="getChordDegree(currentChord)">
        <span>级数：</span>
        <span class="chord-degree-label">{{ getChordDegree(currentChord) }}</span>
      </div>
      
      <div class="chord-function" v-if="getChordFunction(currentChord)">
        <span>性质：</span>
        <span class="chord-function-label" v-html="getChordFunction(currentChord)"></span>
      </div>
      
      <div class="chord-inversion">
        <span>转位：</span>
        <span class="chord-inversion-label">{{ getInversionLabel(currentChord) }}</span>
      </div>
      
      <div class="chord-alias" v-if="getChordAlias(currentChord)">
        <span>别名：</span>
        <span class="chord-alias-label">{{ getChordAlias(currentChord) }}</span>
      </div>
    </div>
    
    <div v-else class="no-chord">
      <p>点击或按键播放和弦</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChordType, Chord } from '@/utils/music'
import { useChordStore } from '@/stores/chordStore'
import { computed } from 'vue'
import { getInterval } from '@/utils/music'
import { getChordTypeLabel, getChordSuffix, getShortNoteName } from '@/utils/chordUtils'

// 使用和弦 store
const chordStore = useChordStore()
const currentChord = computed(() => chordStore.currentChord)

// 获取和弦转位标记
function getInversionNotation(chord: Chord | null): string {
  if (!chord) return '';
  const newChord = new Chord(chord.root.name, chord.octave, chord.type);
  newChord.setInversion(chordStore.currentInversion);
  return newChord.getInversionNotation();
}

// 获取转位状态说明
function getInversionLabel(chord: Chord | null): string {
  const inversionLabels = ['原位', '第一转位', '第二转位', '第三转位'];
  return inversionLabels[chordStore.currentInversion] || '未知转位';
}

// 获取简短的和弦名称
function getShortChordName(chord: Chord | null): string {
  if (!chord) return '';
  return `${chord.root.name}${getChordSuffix(chord.type)}`;
}

// 获取和弦级数
function getChordDegree(chord: Chord | null): string {
  if (!chord) return '';
  
  // 获取当前调性
  const currentKey = chordStore.currentKey;
  
  // 计算和弦根音相对于当前调性的音程
  const interval = getInterval(currentKey, chord.root.name);
  
  // 大调音阶的音程模式：2,2,1,2,2,2,1
  const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
  
  // 找出最接近的音阶级数
  let baseDegree = 1;
  let isHalfStep = false;
  
  // 如果音程正好在音阶上
  const scaleIndex = majorScaleIntervals.indexOf(interval);
  if (scaleIndex !== -1) {
    baseDegree = scaleIndex + 1;
  } else {
    // 找出最接近的下方音阶音
    for (let i = 0; i < majorScaleIntervals.length; i++) {
      if (majorScaleIntervals[i] > interval) {
        baseDegree = i;
        isHalfStep = true;
        break;
      }
    }
  }
  
  // 转换为罗马数字
  const romanNumerals = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ'];
  const baseRoman = romanNumerals[baseDegree - 1];
  
  // 根据和弦类型确定大小写
  let roman = baseRoman;
  if (chord.type === ChordType.MINOR || 
      chord.type === ChordType.DIMINISHED || 
      chord.type === ChordType.MINOR_SEVENTH ||
      chord.type === ChordType.HALF_DIMINISHED_SEVENTH) {
    roman = roman.toLowerCase();
  }
  
  // 添加升降记号
  if (isHalfStep) {
    roman = '♯' + roman;
  }
  
  // 获取中文表示
  const chineseNumerals = ['一', '二', '三', '四', '五', '六', '七'];
  let chineseDegree = chineseNumerals[baseDegree - 1] + '级';
  
  // 添加升降标记到中文级数
  if (isHalfStep) {
    chineseDegree = '升' + chineseDegree;
  }
  
  // 添加和弦类型描述
  let typeDesc = '';
  if (chord.type === ChordType.MINOR) typeDesc = '小';
  else if (chord.type === ChordType.DIMINISHED) typeDesc = '减';
  else if (chord.type === ChordType.AUGMENTED) typeDesc = '增';
  else if (chord.type === ChordType.MAJOR_SEVENTH) typeDesc = '大七';
  else if (chord.type === ChordType.MINOR_SEVENTH) typeDesc = '小七';
  else if (chord.type === ChordType.DOMINANT_SEVENTH) typeDesc = '属七';
  else if (chord.type === ChordType.HALF_DIMINISHED_SEVENTH) typeDesc = '半减七';
  else if (chord.type === ChordType.SUSPENDED_SECOND) typeDesc = '挂二';
  else if (chord.type === ChordType.SUSPENDED_FOURTH) typeDesc = '挂四';
  
  // 添加和弦类型后缀到罗马数字
  let suffix = '';
  if (chord.type === ChordType.MAJOR_SEVENTH) suffix = 'M7';
  else if (chord.type === ChordType.MINOR_SEVENTH) suffix = 'm7';
  else if (chord.type === ChordType.DOMINANT_SEVENTH) suffix = '7';
  else if (chord.type === ChordType.HALF_DIMINISHED_SEVENTH) suffix = 'ø7';
  
  return `${roman}${suffix} (${chineseDegree}${typeDesc})`;
}

// 获取和弦性质（T, S, D等）
function getChordFunction(chord: Chord | null): string {
  if (!chord) return '';
  
  // 获取当前调性
  const currentKey = chordStore.currentKey;
  
  // 计算和弦根音相对于当前调性的音程
  const interval = getInterval(currentKey, chord.root.name);
  
  // 大调音阶的音程模式：2,2,1,2,2,2,1
  const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
  
  // 找出和弦在音阶中的级数
  let degree = 0;
  let isHalfStep = false;
  
  // 如果音程正好在音阶上
  const scaleIndex = majorScaleIntervals.indexOf(interval);
  if (scaleIndex !== -1) {
    degree = scaleIndex + 1;
  } else {
    // 找出最接近的下方音阶音
    for (let i = 0; i < majorScaleIntervals.length; i++) {
      if (majorScaleIntervals[i] > interval) {
        degree = i;
        isHalfStep = true;
        break;
      }
    }
  }
  
  // 根据和弦的级数和类型判断性质
  let functionNotation = '';
  
  // 主要和弦性质判断
  switch (degree) {
    case 1: // I级 - 主和弦
      functionNotation = 'T';
      break;
    case 4: // IV级 - 下属和弦
      functionNotation = 'S';
      break;
    case 5: // V级 - 属和弦
      functionNotation = 'D';
      break;
    case 2: // II级 - 下属和弦的平行小三和弦
      functionNotation = 'S II';
      break;
    case 6: // VI级 - 主和弦的平行小三和弦
      functionNotation = 'T VI';
      break;
    case 3: // III级 - 属和弦的平行小三和弦
      functionNotation = 'D III';
      break;
    case 7: // VII级 - 导七和弦
      if (chord.type === ChordType.DIMINISHED) {
        functionNotation = 'D VII<sup>o</sup>';
      } else {
        functionNotation = 'D VII';
      }
      break;
    default:
      functionNotation = '';
  }
  
  // 添加和弦类型标记
  switch(chord.type) {
    case ChordType.DOMINANT_SEVENTH:
      functionNotation += '<sup>7</sup>';
      break;
    case ChordType.MAJOR_SEVENTH:
      functionNotation += '<sup>M7</sup>';
      break;
    case ChordType.MINOR_SEVENTH:
      functionNotation += '<sup>m7</sup>';
      break;
    case ChordType.MINOR_MAJOR_SEVENTH:
      functionNotation += '<sup>mM7</sup>';
      break;
    case ChordType.HALF_DIMINISHED_SEVENTH:
      functionNotation += '<sup>ø7</sup>';
      break;
    case ChordType.SIXTH:
      functionNotation += '<sup>6</sup>';
      break;
    case ChordType.MINOR_SIXTH:
      functionNotation += '<sup>m6</sup>';
      break;
    case ChordType.MAJOR_NINTH:
      functionNotation += '<sup>9</sup>';
      break;
    case ChordType.MINOR_NINTH:
      functionNotation += '<sup>m9</sup>';
      break;
    case ChordType.AUGMENTED:
      if (degree !== 7) {
        functionNotation += '<sup>+</sup>';
      }
      break;
    case ChordType.DIMINISHED:
      if (degree !== 7) {
        functionNotation += '<sup>o</sup>';
      }
      break;
    case ChordType.SUSPENDED_SECOND:
      functionNotation += '<sup>sus2</sup>';
      break;
    case ChordType.SUSPENDED_FOURTH:
      functionNotation += '<sup>sus4</sup>';
      break;
  }
  
  // 添加转位标记（如果有）
  if (chordStore.currentInversion > 0) {
    functionNotation += `<sub>${chordStore.currentInversion}</sub>`;
  }
  
  // 如果有和弦性质，返回组合内容
  if (functionNotation) {
    return `${functionNotation}`;
  }
  
  return '';
}

// 获取和弦别名
function getChordAlias(chord: Chord | null): string {
  if (!chord) return '';
  
  // 获取当前转位
  const currentInversion = chordStore.currentInversion;
  
  // 如果是原位，没有特殊别名
  if (currentInversion === 0) return '';
  
  let alias = '';
  
  // 根据和弦类型和转位判断别名
  switch(chord.type) {
    case ChordType.MAJOR:
    case ChordType.MINOR:
    case ChordType.DIMINISHED:
    case ChordType.AUGMENTED:
    case ChordType.SUSPENDED_SECOND:
    case ChordType.SUSPENDED_FOURTH:
      if (currentInversion === 1) {
        alias = '六和弦';
      } else if (currentInversion === 2) {
        alias = '四六和弦';
      } else if (currentInversion === 3) {
        alias = '原位（高八度）';
      }
      break;
    case ChordType.MAJOR_SEVENTH:
      if (currentInversion === 1) {
        alias = '五六和弦';
      } else if (currentInversion === 2) {
        alias = '三四和弦';
      } else if (currentInversion === 3) {
        alias = '二四和弦';
      }
      break;
    case ChordType.DOMINANT_SEVENTH:
      if (currentInversion === 1) {
        alias = '五六属七和弦';
      } else if (currentInversion === 2) {
        alias = '三四属七和弦';
      } else if (currentInversion === 3) {
        alias = '二四属七和弦';
      }
      break;
    case ChordType.MINOR_SEVENTH:
      if (currentInversion === 1) {
        alias = '五六小七和弦';
      } else if (currentInversion === 2) {
        alias = '三四小七和弦';
      } else if (currentInversion === 3) {
        alias = '二四小七和弦';
      }
      break;
    case ChordType.MINOR_MAJOR_SEVENTH:
      if (currentInversion === 1) {
        alias = '五六小大七和弦';
      } else if (currentInversion === 2) {
        alias = '三四小大七和弦';
      } else if (currentInversion === 3) {
        alias = '二四小大七和弦';
      }
      break;
    case ChordType.HALF_DIMINISHED_SEVENTH:
      if (currentInversion === 1) {
        alias = '五六半减七和弦';
      } else if (currentInversion === 2) {
        alias = '三四半减七和弦';
      } else if (currentInversion === 3) {
        alias = '二四半减七和弦';
      }
      break;
    case ChordType.SIXTH:
      if (currentInversion === 1) {
        alias = '五六大六和弦';
      } else if (currentInversion === 2) {
        alias = '三四大六和弦';
      } else if (currentInversion === 3) {
        alias = '二四大六和弦';
      }
      break;
    case ChordType.MINOR_SIXTH:
      if (currentInversion === 1) {
        alias = '五六小六和弦';
      } else if (currentInversion === 2) {
        alias = '三四小六和弦';
      } else if (currentInversion === 3) {
        alias = '二四小六和弦';
      }
      break;
    case ChordType.MAJOR_NINTH:
      if (currentInversion === 1) {
        alias = '五六大九和弦';
      } else if (currentInversion === 2) {
        alias = '三四大九和弦';
      } else if (currentInversion === 3) {
        alias = '二四大九和弦';
      }
      break;
    case ChordType.MINOR_NINTH:
      if (currentInversion === 1) {
        alias = '五六小九和弦';
      } else if (currentInversion === 2) {
        alias = '三四小九和弦';
      } else if (currentInversion === 3) {
        alias = '二四小九和弦';
      }
      break;
  }
  
  return alias;
}

// 在ChordDisplay.vue中添加和弦转位检测函数
function getChordInversion(chord: Chord | null): string {
  if (!chord || !chord.notes || chord.notes.length < 3) return '原位';
  
  // 获取和弦的根音名称
  const rootName = chord.root.name;
  
  // 获取和弦的最低音符名称
  const bassNote = chord.notes[0].name;
  
  // 如果最低音是根音，则是原位
  if (bassNote === rootName) {
    return '原位';
  }
  
  // 根据和弦类型和最低音找出是哪种转位
  const chordNotes = chord.notes.map(note => note.name);
  const rootIndex = chordNotes.indexOf(rootName);
  
  // 计算转位次数（三和弦有两种转位，七和弦有三种转位）
  const inversions = ['原位', '第一转位', '第二转位', '第三转位'];
  
  // 找出转位数（根据最低音的位置）
  let inversionNum = chordNotes.length - rootIndex;
  if (inversionNum >= chordNotes.length) {
    inversionNum = 0; // 这是原位
  }
  
  return inversions[inversionNum];
}
</script>

<style scoped>
.chord-display {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.chord-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chord-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.chord-notes, .chord-type, .chord-degree, .chord-function, .chord-inversion, .chord-alias {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
  width: 100%;
}

.chord-function-label {
  word-break: keep-all;
  white-space: nowrap;
  font-weight: 500;
  color: #34495e;
}

.note {
  background-color: #e0e0e0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-right: 0.3rem;
}

.chord-type-label, .chord-degree-label, .chord-inversion-label, .chord-alias-label {
  font-weight: 500;
  color: #34495e;
}

.chord-shortcuts {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.shortcut-hint {
  margin-right: 1rem;
  background-color: #e0e0e0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.no-chord {
  color: #666;
  font-style: italic;
}
</style> 