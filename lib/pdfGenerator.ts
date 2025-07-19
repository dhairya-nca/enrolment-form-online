// lib/pdfGenerator.ts
import jsPDF from 'jspdf';
import { LLNResponse, EnrollmentData } from '../utils/types';

export class PDFGenerator {
  private createHeader(doc: jsPDF, title: string) {
    // Add logo/header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('National College Australia', 20, 20);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 20, 35);
    
    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);
    
    return 55; // Return the Y position for content to start
  }

  private createFooter(doc: jsPDF) {
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 20;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('This document was generated automatically.', 105, footerY, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, footerY + 10, { align: 'center' });
  }

  // FIXED METHOD - Handle proper data structure and edge cases
  generateLLNReport(data: LLNResponse & { personalInfo: any }): Buffer {
    const doc = new jsPDF();
    let yPosition = this.createHeader(doc, 'Language, Literacy and Numeracy (LLN) Assessment Report');

    // Student Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Handle potential undefined values safely
    const studentId = data.studentId || 'N/A';
    const firstName = data.personalInfo?.firstName || 'N/A';
    const lastName = data.personalInfo?.lastName || 'N/A';
    const email = data.personalInfo?.email || 'N/A';
    const phone = data.personalInfo?.phone || 'N/A';
    const dateOfBirth = data.personalInfo?.dateOfBirth || 'N/A';
    const assessmentDate = data.completedAt ? new Date(data.completedAt).toLocaleDateString() : 'N/A';

    doc.text(`Student ID: ${studentId}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Name: ${firstName} ${lastName}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Email: ${email}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Phone: ${phone}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Date of Birth: ${dateOfBirth}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Assessment Date: ${assessmentDate}`, 20, yPosition);
    yPosition += 15;

    // Assessment Results
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment Results', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const overallScore = data.overallScore || 0;
    const rating = data.rating || 'Not Rated';
    
    doc.text(`Overall Score: ${overallScore}%`, 20, yPosition);
    yPosition += 7;
    doc.text(`Rating: ${rating}`, 20, yPosition);
    yPosition += 7;
    
    // Highlight eligibility status
    doc.setFont('helvetica', 'bold');
    if (data.eligible) {
      doc.setTextColor(0, 150, 0); // Green
      doc.text('Eligibility Status: ELIGIBLE', 20, yPosition);
    } else {
      doc.setTextColor(200, 0, 0); // Red
      doc.text('Eligibility Status: NOT ELIGIBLE', 20, yPosition);
    }
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont('helvetica', 'normal');
    yPosition += 15;

    // Detailed Scores - Handle undefined scores safely
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Scores by Category', 20, yPosition);
    yPosition += 10;

    const scores = [
      { category: 'Learning Skills', score: data.scores?.learning || 0 },
      { category: 'Reading Comprehension', score: data.scores?.reading || 0 },
      { category: 'Writing Skills', score: data.scores?.writing || 0 },
      { category: 'Numeracy Skills', score: data.scores?.numeracy || 0 },
      { category: 'Digital Literacy', score: data.scores?.digitalLiteracy || 0 }
    ];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    scores.forEach(item => {
      doc.text(`${item.category}: ${item.score}%`, 20, yPosition);
      yPosition += 7;
    });
    yPosition += 10;

    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    // Recommendations
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations', 20, yPosition);
    yPosition += 10;

    let recommendations = '';
    if (data.eligible) {
      recommendations = 'Student has demonstrated sufficient language, literacy, and numeracy skills to undertake the chosen course. No additional support required.';
    } else {
      recommendations = 'Student requires additional support in language, literacy, and numeracy skills before commencing the course. We recommend enrolling in foundation courses or seeking tutoring support.';
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(recommendations, 170);
    doc.text(splitText, 20, yPosition);
    yPosition += splitText.length * 7 + 10;

    // Assessment Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment Summary', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const summaryText = `This Language, Literacy and Numeracy assessment was completed on ${assessmentDate}. The student achieved an overall score of ${overallScore}% and received a rating of "${rating}". ${data.eligible ? 'The student is eligible to proceed with their chosen course.' : 'Additional support is recommended before course commencement.'}`;
    
    const splitSummary = doc.splitTextToSize(summaryText, 170);
    doc.text(splitSummary, 20, yPosition);

    this.createFooter(doc);

    // Return the PDF as a Buffer
    return Buffer.from(doc.output('arraybuffer'));
  }
  
  generatePersonalDetailsForm(data: EnrollmentData): Buffer {
    const doc = new jsPDF();
    let yPosition = this.createHeader(doc, 'Student Personal Details Form');

    // Personal Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Personal Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const personalDetails = [
      `Student ID: ${data.studentId}`,
      `Title: ${data.personalDetails.title}`,
      `Gender: ${data.personalDetails.gender}`,
      `First Name: ${data.personalDetails.firstName}`,
      `Middle Name: ${data.personalDetails.middleName || 'N/A'}`,
      `Last Name: ${data.personalDetails.lastName}`,
      `Date of Birth: ${data.personalDetails.dateOfBirth}`,
      `Mobile: ${data.personalDetails.mobile}`,
      `Email: ${data.personalDetails.email}`
    ];

    personalDetails.forEach(detail => {
      doc.text(detail, 20, yPosition);
      yPosition += 7;
    });
    yPosition += 10;

    // Address Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Address Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const addressDetails = [
      `House Number: ${data.personalDetails.address.houseNumber}`,
      `Street Name: ${data.personalDetails.address.streetName}`,
      `Suburb: ${data.personalDetails.address.suburb}`,
      `Postcode: ${data.personalDetails.address.postcode}`,
      `State: ${data.personalDetails.address.state}`,
      `Postal Address: ${data.personalDetails.address.postalAddress || 'Same as above'}`
    ];

    addressDetails.forEach(detail => {
      doc.text(detail, 20, yPosition);
      yPosition += 7;
    });
    yPosition += 10;

    // Course Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Course Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const courseDetails = [
      `Course Name: ${data.courseDetails.courseName}`,
      `Delivery Mode: ${data.courseDetails.deliveryMode}`,
      `Start Date: ${data.courseDetails.startDate}`
    ];

    courseDetails.forEach(detail => {
      doc.text(detail, 20, yPosition);
      yPosition += 7;
    });

    this.createFooter(doc);
    return Buffer.from(doc.output('arraybuffer'));
  }

  generateDeclarationForm(data: EnrollmentData): Buffer {
    const doc = new jsPDF();
    let yPosition = this.createHeader(doc, 'Declaration and Compliance Forms');

    // Student Declaration
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Declaration', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const declarationText = 'I declare that the information provided in this application is true and complete. I understand that providing false or misleading information may result in the rejection of my application or cancellation of my enrollment.';
    const splitDeclarationText = doc.splitTextToSize(declarationText, 170);
    doc.text(splitDeclarationText, 20, yPosition);
    yPosition += splitDeclarationText.length * 7 + 5;
    
    doc.text(`Signature Date: ${data.compliance?.declarationDate || new Date().toISOString().split('T')[0]}`, 20, yPosition);
    yPosition += 7;
    doc.text('Digital Signature: Accepted', 20, yPosition);
    yPosition += 15;

    // Policy Acknowledgment
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Policy Acknowledgment', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const policyText = 'I acknowledge that I have read and understood all relevant policies including the Student Handbook, Code of Conduct, and Assessment Policy.';
    const splitPolicyText = doc.splitTextToSize(policyText, 170);
    doc.text(splitPolicyText, 20, yPosition);
    yPosition += splitPolicyText.length * 7 + 5;
    
    doc.text(`Signature Date: ${data.compliance?.policyDate || new Date().toISOString().split('T')[0]}`, 20, yPosition);
    yPosition += 7;
    doc.text('Digital Signature: Accepted', 20, yPosition);
    yPosition += 15;

    // USI Information
    if (data.compliance?.usi) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Unique Student Identifier (USI)', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`USI: ${data.compliance.usi}`, 20, yPosition);
    }

    this.createFooter(doc);
    return Buffer.from(doc.output('arraybuffer'));
  }

  generateEnrollmentSummary(data: EnrollmentData): Buffer {
    const doc = new jsPDF();
    let yPosition = this.createHeader(doc, 'Enrollment Summary Report');

    // Summary Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Enrollment Summary', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const summaryDetails = [
      `Student ID: ${data.studentId}`,
      `Student Name: ${data.personalDetails.firstName} ${data.personalDetails.lastName}`,
      `Email: ${data.personalDetails.email}`,
      `Course: ${data.courseDetails.courseName}`,
      `Delivery Mode: ${data.courseDetails.deliveryMode}`,
      `Start Date: ${data.courseDetails.startDate}`,
      `Enrollment Status: ${data.status || 'Submitted'}`,
      `Submission Date: ${new Date().toLocaleDateString()}`
    ];

    summaryDetails.forEach(detail => {
      doc.text(detail, 20, yPosition);
      yPosition += 7;
    });
    yPosition += 10;

    // Document Checklist
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Required Documents', 20, yPosition);
    yPosition += 10;

    const documents = [
      { name: 'Passport Bio Page', status: data.documents?.passportBio ? 'Uploaded' : 'Pending' },
      { name: 'Visa Copy', status: data.documents?.visaCopy ? 'Uploaded' : 'Pending' },
      { name: 'Photo ID', status: data.documents?.photoId ? 'Uploaded' : 'Pending' },
      { name: 'USI Email', status: data.documents?.usiEmail ? 'Uploaded' : 'Pending' },
      { name: 'Recent Photo', status: data.documents?.recentPhoto ? 'Uploaded' : 'Pending' }
    ];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    documents.forEach(doc_item => {
      const statusColor = doc_item.status === 'Uploaded' ? [0, 150, 0] : [200, 0, 0];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(`${doc_item.name}: ${doc_item.status}`, 20, yPosition);
      doc.setTextColor(0, 0, 0); // Reset to black
      yPosition += 7;
    });

    this.createFooter(doc);
    return Buffer.from(doc.output('arraybuffer'));
  }
}