// Import pdfjs-dist - using dynamic import for better compatibility
let pdfjsLib = null

const loadPdfJs = async () => {
  if (!pdfjsLib) {
    try {
      // Import from the main package - it will resolve to build/pdf.js
      const pdfjsModule = await import('pdfjs-dist')
      pdfjsLib = pdfjsModule.default || pdfjsModule
      
      // Set worker source - using CDN for compatibility
      if (typeof window !== 'undefined' && pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
        const version = pdfjsLib.version || '3.11.174'
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`
      }
    } catch (error) {
      console.error('Failed to load pdfjs-dist:', error)
      throw new Error('PDF.js library failed to load. Please restart the dev server and ensure pdfjs-dist is installed.')
    }
  }
  return pdfjsLib
}

/**
 * Extract text content from a PDF file
 * @param {File} file - PDF file object
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPDF = async (file) => {
  try {
    const pdfjs = await loadPdfJs()
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // Combine all text items from the page
      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ')
      
      fullText += pageText + '\n\n'
    }
    
    return fullText.trim()
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.')
  }
}

/**
 * Summarize text content (simple implementation - can be enhanced with AI)
 * @param {string} text - Text to summarize
 * @param {number} maxLength - Maximum length of summary
 * @returns {string} - Summarized text
 */
export const summarizeText = (text, maxLength = 500) => {
  if (!text || text.length === 0) {
    return 'No content found in the document.'
  }

  // Remove extra whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim()
  
  // If text is shorter than maxLength, return as is
  if (cleanText.length <= maxLength) {
    return cleanText
  }

  // Simple summarization: take first few sentences and last few sentences
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || []
  
  if (sentences.length <= 3) {
    // If few sentences, just truncate
    return cleanText.substring(0, maxLength) + '...'
  }

  // Take first 40% and last 20% of sentences
  const firstPart = Math.ceil(sentences.length * 0.4)
  const lastPart = Math.ceil(sentences.length * 0.2)
  
  const summary = [
    ...sentences.slice(0, firstPart),
    '...',
    ...sentences.slice(-lastPart)
  ].join(' ')

  // If still too long, truncate
  if (summary.length > maxLength) {
    return summary.substring(0, maxLength) + '...'
  }

  return summary
}

/**
 * Extract and summarize PDF content
 * @param {File} file - PDF file object
 * @returns {Promise<{fullText: string, summary: string}>}
 */
export const extractAndSummarizePDF = async (file) => {
  const fullText = await extractTextFromPDF(file)
  const summary = summarizeText(fullText, 800)
  
  return {
    fullText,
    summary,
    pageCount: await getPDFPageCount(file)
  }
}

/**
 * Get page count of PDF
 * @param {File} file - PDF file object
 * @returns {Promise<number>}
 */
const getPDFPageCount = async (file) => {
  try {
    const pdfjs = await loadPdfJs()
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    return pdf.numPages
  } catch (error) {
    return 0
  }
}

