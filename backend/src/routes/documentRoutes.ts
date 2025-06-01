import express from 'express';
import { createPdfPolicy, createDocxPolicy, generateRawPdf } from '../controllers/documentController'; // Adjust path as necessary
// import { authMiddleware } from '../middleware/authMiddleware'; // Assuming you want to protect this route

const router = express.Router();

// POST /api/documents/policy/pdf - Generate a PDF policy document
// Body should contain: { title: string, sections: Array<{ title: string, content: string }> }
router.post('/policy/pdf', /* authMiddleware, */ createPdfPolicy); // Uncomment authMiddleware if needed

// POST /api/documents/policy/docx - Generate a DOCX policy document
// Body should contain: { title: string, sections: Array<{ title: string, content: string }> }
router.post('/policy/docx', /* authMiddleware, */ createDocxPolicy); // Uncomment authMiddleware if needed

// POST /api/documents/raw-pdf - Generate a PDF from raw HTML content
// Body should contain: { htmlContent: string }
router.post('/raw-pdf', /* authMiddleware, */ generateRawPdf); // Uncomment authMiddleware if needed

export default router;