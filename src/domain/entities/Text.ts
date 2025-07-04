export interface Text {
  id?: string;
  title: string;
  content: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTextRequest {
  title: string;
  content: string;
}

export interface UpdateTextRequest {
  title?: string;
  content?: string;
}

export interface TextAnalysis {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  longestWords: string[];
}

export interface TextAnalysisResponse {
  textId: string;
  analysis: TextAnalysis;
}
