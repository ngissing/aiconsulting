import { Request, Response } from 'express';
import { pdfService } from '../services/pdfService'; // Import pdfService for direct use
// import { generatePolicyDocx } from '../services/docxService'; // No longer directly used
import { addDocumentJob } from '../services/queueService'; // Import queue service

interface PolicySection {
  title: string;
  content: string;
}

interface PolicyDataRequestBody {
  title: string;
  sections: PolicySection[];
}

export const createPdfPolicy = async (req: Request, res: Response): Promise<void> => {
  try {
    const policyData = req.body as PolicyDataRequestBody;

    if (!policyData || !policyData.title || !Array.isArray(policyData.sections) || policyData.sections.length === 0) {
      res.status(400).json({ message: 'Invalid policy data provided. Ensure title and sections are present.' });
      return;
    }

    for (const section of policyData.sections) {
      if (typeof section.title !== 'string' || typeof section.content !== 'string') {
        res.status(400).json({ message: 'Invalid section format. Each section must have a title and content as strings.' });
        return;
      }
    }
    
    const job = await addDocumentJob('pdf', policyData);
    res.status(202).json({
      message: 'PDF generation job accepted.',
      jobId: job.id,
      customJobId: job.data.jobId // The custom ID we created
    });

    // Old direct generation code:
    // const pdfBuffer = await generatePolicyPdf(policyData);
    // if (pdfBuffer) {
    //   res.setHeader('Content-Type', 'application/pdf');
    //   res.setHeader('Content-Disposition', `attachment; filename="${policyData.title.replace(/\s+/g, '_') || 'policy'}.pdf"`);
    //   res.send(pdfBuffer);
    // } else {
    //   res.status(500).json({ message: 'Failed to generate PDF buffer.' });
    // }
  } catch (error) {
    console.error('Error creating PDF policy:', error);
    if (error instanceof Error) {
        res.status(500).json({ message: `Failed to queue PDF policy generation: ${error.message}` });
    } else {
        res.status(500).json({ message: 'An unknown error occurred while queuing PDF policy generation.' });
    }
  }
};

export const createDocxPolicy = async (req: Request, res: Response): Promise<void> => {
  try {
    const policyData = req.body as PolicyDataRequestBody;

    if (!policyData || !policyData.title || !Array.isArray(policyData.sections) || policyData.sections.length === 0) {
      res.status(400).json({ message: 'Invalid policy data provided. Ensure title and sections are present.' });
      return;
    }

    for (const section of policyData.sections) {
      if (typeof section.title !== 'string' || typeof section.content !== 'string') {
        res.status(400).json({ message: 'Invalid section format. Each section must have a title and content as strings.' });
        return;
      }
    }

    const job = await addDocumentJob('docx', policyData);
    res.status(202).json({
      message: 'DOCX generation job accepted.',
      jobId: job.id,
      customJobId: job.data.jobId // The custom ID we created
    });

    // Old direct generation code:
    // const docxBuffer = await generatePolicyDocx(policyData);
    // if (docxBuffer) {
    //   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    //   res.setHeader('Content-Disposition', `attachment; filename="${policyData.title.replace(/\s+/g, '_') || 'policy'}.docx"`);
    //   res.send(docxBuffer);
    // } else {
    //   res.status(500).json({ message: 'Failed to generate DOCX buffer.' });
    // }
  } catch (error) {
    console.error('Error creating DOCX policy:', error);
    if (error instanceof Error) {
        res.status(500).json({ message: `Failed to queue DOCX policy generation: ${error.message}` });
    } else {
        res.status(500).json({ message: 'An unknown error occurred while queuing DOCX policy generation.' });
    }
  }
};

interface RawPdfRequestBody {
  htmlContent: string;
  filename?: string; // Optional filename for download
}

export const generateRawPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const { htmlContent, filename = 'document' } = req.body as RawPdfRequestBody;

    if (!htmlContent || typeof htmlContent !== 'string') {
      res.status(400).json({ message: 'Invalid request. "htmlContent" (string) is required in the request body.' });
      return;
    }

    const pdfBuffer = await pdfService.generatePdfFromHtml(htmlContent);

    if (pdfBuffer) {
      res.setHeader('Content-Type', 'application/pdf');
      const safeFilename = filename.replace(/[^a-z0-9_.-]/gi, '_');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.pdf"`);
      res.send(pdfBuffer);
    } else {
      // This case should ideally not be reached if pdfService.generatePdfFromHtml throws on error
      res.status(500).json({ message: 'Failed to generate PDF buffer from raw HTML.' });
    }
  } catch (error) {
    console.error('Error generating raw PDF:', error);
    if (error instanceof Error) {
        res.status(500).json({ message: `Failed to generate PDF from raw HTML: ${error.message}` });
    } else {
        res.status(500).json({ message: 'An unknown error occurred while generating PDF from raw HTML.' });
    }
  }
};