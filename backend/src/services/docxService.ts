import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'; // Added AlignmentType
import fs from 'fs'; // Or use a stream to send to client

interface PolicySection {
  title: string;
  content: string;
}

interface PolicyData {
  title: string;
  sections: PolicySection[];
}

/**
 * Generates a DOCX document from policy data.
 * @param policyData The data to include in the DOCX.
 * @param outputPath Optional path to save the DOCX. If not provided, returns a buffer.
 * @returns A Promise that resolves to a Buffer containing the DOCX data, or void if outputPath is provided.
 */
export const generatePolicyDocx = async (
  policyData: PolicyData,
  outputPath?: string
): Promise<Buffer | void> => {
  try {
    const paragraphs: Paragraph[] = [];

    // Document Title
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: policyData.title, bold: true, size: 48 })], // size is in half-points
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }, // spacing in twentieths of a point
      })
    );

    // Document Sections
    policyData.sections.forEach((section) => {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: section.title, bold: true, size: 36 })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 150 },
        })
      );
      // Split content by newlines to create separate paragraphs
      const contentParagraphs = section.content.split('\n').map(line => 
        new Paragraph({
          children: [new TextRun({ text: line, size: 24 })],
          spacing: { after: 100 },
          alignment: AlignmentType.BOTH,
        })
      );
      paragraphs.push(...contentParagraphs);
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch in twentieths of a point
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs,
      }],
      creator: 'AI Policy Generator',
      title: policyData.title,
      description: `Policy document: ${policyData.title}`,
    });

    if (outputPath) {
      const buffer = await Packer.toBuffer(doc);
      return new Promise((resolve, reject) => {
        fs.writeFile(outputPath, buffer, (err) => {
          if (err) {
            reject(new Error(`Error writing DOCX to file: ${err.message}`));
          } else {
            resolve();
          }
        });
      });
    } else {
      const buffer = await Packer.toBuffer(doc);
      return buffer;
    }
  } catch (error) {
    console.error('Failed to generate DOCX:', error);
    if (error instanceof Error) {
      throw new Error(`DOCX generation failed: ${error.message}`);
    } else {
      throw new Error('DOCX generation failed due to an unknown error.');
    }
  }
};

// Example Usage (for testing, can be removed or moved to a test file)
/*
const examplePolicyData: PolicyData = {
  title: 'Sample Policy Document (DOCX)',
  sections: [
    { title: 'Introduction', content: 'This is the introduction section of the policy.\nIt outlines the purpose and scope of this document.' },
    { title: 'Section 1: Key Principles', content: 'This section details the key principles that underpin this policy.\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    { title: 'Section 2: Procedures', content: 'This section outlines the specific procedures to be followed.\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
    { title: 'Conclusion', content: 'This is the conclusion of the policy document.\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
  ],
};

generatePolicyDocx(examplePolicyData, 'sample_policy.docx')
  .then(() => console.log('Sample DOCX generated successfully.'))
  .catch(err => console.error('Error generating sample DOCX:', err));

generatePolicyDocx(examplePolicyData)
  .then(buffer => {
    if (buffer) {
      console.log('Sample DOCX generated to buffer successfully. Size:', buffer.length);
      // fs.writeFileSync('sample_policy_from_buffer.docx', buffer); // Example: save buffer to file
    }
  })
  .catch(err => console.error('Error generating sample DOCX to buffer:', err));
*/