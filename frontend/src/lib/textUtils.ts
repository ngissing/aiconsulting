/**
 * Calculates the word count of a given text.
 * It splits the text by spaces and filters out empty strings.
 * @param text The input string.
 * @returns The number of words in the text.
 */
export const calculateWordCount = (text: string | null | undefined): number => {
  if (!text) {
    return 0;
  }
  // Remove HTML tags and Markdown syntax that might inflate word count.
  // This is a basic removal, more sophisticated parsing might be needed for complex content.
  const cleanedText = text
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/[#*`~_=\[\]()>{}+-]/g, ' ') // Remove common Markdown characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();

  if (!cleanedText) {
    return 0;
  }
  return cleanedText.split(/\s+/).filter(Boolean).length;
};

/**
 * Calculates the estimated reading time in minutes.
 * @param wordCount The total number of words.
 * @param wpm Words per minute (average reading speed). Defaults to 200.
 * @returns The estimated reading time in minutes, rounded up to the nearest minute.
 *          Returns 0 if wordCount is 0.
 */
export const calculateReadingTime = (wordCount: number, wpm: number = 200): number => {
  if (wordCount === 0) {
    return 0;
  }
  if (wpm <= 0) {
    return 0; // Avoid division by zero or negative wpm
  }
  const minutes = wordCount / wpm;
  return Math.ceil(minutes); // Round up to the nearest minute
};