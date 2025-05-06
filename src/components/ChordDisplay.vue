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
      
      <div class="chord-inversion">
        <span>转位：</span>
        <span class="chord-inversion-label">{{ getInversionLabel(currentChord) }}</span>
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

.chord-notes, .chord-type, .chord-degree, .chord-inversion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.note {
  background-color: #e0e0e0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-right: 0.3rem;
}

.chord-type-label, .chord-degree-label, .chord-inversion-label {
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