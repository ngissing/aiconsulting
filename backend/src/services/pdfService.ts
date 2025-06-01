import puppeteer, { Browser, Page } from 'puppeteer';
import { Buffer } from 'buffer'; // Explicit import for Node.js Buffer

interface PolicyData {
  title: string;
  sections: Array<{ title: string; content: string }>;
}

class PdfService {
  private async getBrowser(): Promise<Browser> {
    // TODO: Consider optimizing browser launch. 
    // For example, keep a single browser instance alive for multiple requests
    // or use puppeteer.connect if running a persistent browser instance elsewhere.
    // For now, launching a new browser for each PDF.
    return puppeteer.launch({
      headless: true, // Run in headless mode
      args: [
        '--no-sandbox', // Required for some environments (e.g., Docker)
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Recommended for Docker to prevent /dev/shm errors
      ],
    });
  }

  public async generatePdfFromHtml(htmlContent: string): Promise<Buffer> {
    let browser: Browser | null = null;
    try {
      browser = await this.getBrowser();
      const page: Page = await browser.newPage();

      // Set content
      // waitUntil: 'networkidle0' waits for network activity to be idle for 500ms
      // This is useful if the HTML content loads external resources like images or fonts.
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Generate PDF
      const puppeteerPdfBuffer = await page.pdf({ // This is likely a Uint8Array
        format: 'A4', // Common paper size
        printBackground: true, // Ensure background colors and images are printed
        margin: { // Standard margins
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        // Consider adding headerTemplate and footerTemplate for branding/page numbers later
      });

      return Buffer.from(puppeteerPdfBuffer); // Convert to Node.js Buffer
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Re-throw the error or handle it as per application's error handling strategy
      throw new Error('Failed to generate PDF document.');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // New method to handle PolicyData structure
  public async generatePdfFromPolicyData(policyData: PolicyData): Promise<Buffer> {
    // Simple HTML generation from policyData.
    // This can be made more sophisticated with templating engines later.
    let htmlContent = `<html><head><title>${policyData.title}</title></head><body>`;
    htmlContent += `<h1>${policyData.title}</h1>`;
    policyData.sections.forEach(section => {
      htmlContent += `<h2>${section.title}</h2>`;
      // Basic conversion of newlines to <br> for HTML.
      // A more robust HTML sanitizer/converter might be needed for complex content.
      htmlContent += `<p>${section.content.replace(/\n/g, '<br />')}</p>`;
    });
    htmlContent += `</body></html>`;

    return this.generatePdfFromHtml(htmlContent);
  }
}

// Export an instance of the service
export const pdfService = new PdfService();