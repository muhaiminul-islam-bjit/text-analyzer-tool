import { TextAnalyzer } from '../../src/application/TextAnalyzer';

describe('TextAnalyzer', () => {
  const exampleText = "The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun.";

  describe('analyzeText', () => {
    it('should return zero counts for empty text', () => {
      const result = TextAnalyzer.analyzeText('');
      
      expect(result).toEqual({
        wordCount: 0,
        characterCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        longestWords: [],
      });
    });

    it('should return zero counts for whitespace-only text', () => {
      const result = TextAnalyzer.analyzeText('   \n\t  ');
      
      expect(result).toEqual({
        wordCount: 0,
        characterCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        longestWords: [],
      });
    });

    it('should count words correctly', () => {
      const result = TextAnalyzer.analyzeText(exampleText);
      expect(result.wordCount).toBe(16); // Updated to correct count
    });

    it('should count characters correctly (excluding whitespace)', () => {
      const result = TextAnalyzer.analyzeText(exampleText);
      expect(result.characterCount).toBe(60); // excluding spaces and punctuation
    });

    it('should count sentences correctly', () => {
      const result = TextAnalyzer.analyzeText(exampleText);
      expect(result.sentenceCount).toBe(2);
    });

    it('should count paragraphs correctly for single paragraph', () => {
      const result = TextAnalyzer.analyzeText(exampleText);
      expect(result.paragraphCount).toBe(1);
    });

    it('should count paragraphs correctly for multiple paragraphs', () => {
      const multiParagraphText = `First paragraph here.

Second paragraph here.

Third paragraph here.`;
      
      const result = TextAnalyzer.analyzeText(multiParagraphText);
      expect(result.paragraphCount).toBe(3);
    });

    it('should find longest words in paragraphs', () => {
      const result = TextAnalyzer.analyzeText(exampleText);
      expect(result.longestWords).toContain('quick');
      expect(result.longestWords).toContain('brown');
      expect(result.longestWords).toContain('jumps');
      expect(result.longestWords).toContain('slept');
      expect(result.longestWords.length).toBe(4);
    });

    it('should handle text with different punctuation', () => {
      const punctuatedText = "Hello! How are you? I'm fine. What about you...";
      const result = TextAnalyzer.analyzeText(punctuatedText);
      
      expect(result.wordCount).toBe(10);
      expect(result.sentenceCount).toBe(4);
    });

    it('should handle case insensitive longest word detection', () => {
      const mixedCaseText = "HELLO world. Hello WORLD again.";
      const result = TextAnalyzer.analyzeText(mixedCaseText);
      
      expect(result.longestWords).toEqual(['hello', 'world', 'again']);
    });

    it('should handle text with extra whitespace', () => {
      const spacedText = "  The   quick    brown   fox  ";
      const result = TextAnalyzer.analyzeText(spacedText);
      
      expect(result.wordCount).toBe(4);
      expect(result.characterCount).toBe(15); // "thequickbrownfox"
    });

    it('should return complete analysis for example text', () => {
      const result = TextAnalyzer.analyzeText(exampleText);
      
      expect(result).toEqual({
        wordCount: 16,
        characterCount: 60,
        sentenceCount: 2,
        paragraphCount: 1,
        longestWords: expect.arrayContaining(['quick', 'brown', 'jumps', 'slept']),
      });
      expect(result.longestWords.length).toBe(4);
    });

    it('should handle multiple paragraphs with different longest words', () => {
      const multiParaText = `Short words here.

This paragraph has extraordinary words.

Simple text.`;
      
      const result = TextAnalyzer.analyzeText(multiParaText);
      
      expect(result.paragraphCount).toBe(3);
      expect(result.longestWords).toContain('extraordinary');
      expect(result.longestWords).toContain('paragraph');
      expect(result.longestWords).toContain('simple');
    });

    it('should not duplicate longest words across paragraphs', () => {
      const duplicateWordsText = `The longest word here.

The longest word there.`;
      
      const result = TextAnalyzer.analyzeText(duplicateWordsText);
      
      // Should only contain "longest" once, even though it appears in both paragraphs
      const longestCount = result.longestWords.filter(word => word === 'longest').length;
      expect(longestCount).toBe(1);
    });

    it('should handle single word text', () => {
      const result = TextAnalyzer.analyzeText('Hello');
      
      expect(result).toEqual({
        wordCount: 1,
        characterCount: 5,
        sentenceCount: 0, // No sentence-ending punctuation
        paragraphCount: 1,
        longestWords: ['hello'],
      });
    });

    it('should handle text with numbers and special characters', () => {
      const specialText = "Test123 with @special #characters & numbers!";
      const result = TextAnalyzer.analyzeText(specialText);
      
      expect(result.wordCount).toBe(6);
      expect(result.sentenceCount).toBe(1);
    });
  });
});
