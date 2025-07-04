export class TextAnalyzer {
  static analyzeText(content: string): {
    wordCount: number;
    characterCount: number;
    sentenceCount: number;
    paragraphCount: number;
    longestWords: string[];
  } {
    if (!content || content.trim() === '') {
      return {
        wordCount: 0,
        characterCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        longestWords: [],
      };
    }

    const cleanedContent = content.trim();

    // Count characters (excluding whitespace)
    const characterCount = cleanedContent.replace(/\s/g, '').length;

    // Count words (split by whitespace and filter empty strings)
    const words = cleanedContent
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    const wordCount = words.length;

    // Count sentences (split by . ! ?)
    const sentences = cleanedContent
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0);
    
    const sentenceCount = sentences.length;

    // Count paragraphs (split by double newlines or more)
    const paragraphs = cleanedContent
      .split(/\n\s*\n/)
      .filter(paragraph => paragraph.trim().length > 0);
    
    const paragraphCount = paragraphs.length;

    // Find longest words in each paragraph
    const longestWords: string[] = [];
    
    paragraphs.forEach(paragraph => {
      const paragraphWords = paragraph
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0);
      
      if (paragraphWords.length > 0) {
        // Find the maximum length in this paragraph
        const maxLength = Math.max(...paragraphWords.map(word => word.length));
        
        // Get all words with the maximum length
        const longestInParagraph = paragraphWords.filter(word => word.length === maxLength);
        
        // Add unique longest words
        longestInParagraph.forEach(word => {
          if (!longestWords.includes(word)) {
            longestWords.push(word);
          }
        });
      }
    });

    return {
      wordCount,
      characterCount,
      sentenceCount,
      paragraphCount,
      longestWords,
    };
  }
}
