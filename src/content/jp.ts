export type JpEntry = { text: string; reading: string; meaning: string; decorative: boolean };

// Valores da tabela do DESIGN.md §4
export const JP: Record<'rain' | 'caseFile' | 'solved' | 'nextEpisode' | 'partner' | 'end', JpEntry> = {
  rain: { text: 'ザアア…', reading: 'zaaa', meaning: 'sound of rain', decorative: true },
  caseFile: { text: '事件ファイル・第七十七号', reading: 'jiken fairu dai 77 gō', meaning: 'case file no. 77', decorative: false },
  solved: { text: '解決', reading: 'kaiketsu', meaning: 'resolved', decorative: false },
  nextEpisode: { text: '次回予告', reading: 'jikai yokoku', meaning: 'next episode preview', decorative: false },
  partner: { text: '相棒', reading: 'aibō', meaning: 'partner', decorative: false },
  end: { text: '終', reading: 'owari', meaning: 'the end', decorative: false },
};
