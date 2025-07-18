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
    doc.text(`Student ID: ${data.studentId}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Name: ${data.personalInfo.firstName} ${data.personalInfo.lastName}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Email: ${data.personalInfo.email}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Phone: ${data.personalInfo.phone}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Date of Birth: ${data.personalInfo.dateOfBirth}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Assessment Date: ${new Date(data.completedAt).toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // Assessment Results
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment Results', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Overall Score: ${data.overallScore}%`, 20, yPosition);
    yPosition += 7;
    doc.text(`Rating: ${data.rating}`, 20, yPosition);
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

    // Detailed Scores
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Scores by Category', 20, yPosition);
    yPosition += 10;

    const scores = [
      { category: 'Learning Skills', score: data.scores.learning },
      { category: 'Reading Comprehension', score: data.scores.reading },
      { category: 'Writing Skills', score: data.scores.writing },
      { category: 'Numeracy Skills', score: data.scores.numeracy },
      { category: 'Digital Literacy', score: data.scores.digitalLiteracy }
    ];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    scores.forEach(item => {
      doc.text(`${item.category}: ${item.score}%`, 20, yPosition);
      yPosition += 7;
    });
    yPosition += 10;

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

    this.createFooter(doc);

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
    yPosition += 10;

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Background Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Background Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const backgroundDetails = [
      `Emergency Contact: ${data.background.emergencyContact}`,
      `Country of Birth: ${data.background.countryOfBirth}`,
      `Country of Citizenship: ${data.background.countryOfCitizenship}`,
      `Main Language: ${data.background.mainLanguage}`,
      `English Proficiency: ${data.background.englishProficiency}`,
      `Australian Citizen: ${data.background.australianCitizen ? 'Yes' : 'No'}`,
      `Aboriginal Status: ${data.background.aboriginalStatus}`,
      `Employment Status: ${data.background.employmentStatus}`,
      `Secondary School Completed: ${data.background.secondarySchool ? 'Yes' : 'No'}`,
      `School Level: ${data.background.schoolLevel}`,
      `Qualifications: ${data.background.qualifications}`,
      `Disability: ${data.background.disability ? 'Yes' : 'No'}`,
      `Course Reason: ${data.background.courseReason}`
    ];

    backgroundDetails.forEach(detail => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(detail, 20, yPosition);
      yPosition += 7;
    });

    this.createFooter(doc);
    return Buffer.from(doc.output('arraybuffer'));
  }

  generateDeclarationForm(data: EnrollmentData): Buffer {
    const doc = new jsPDF();
    let yPosition = this.createHeader(doc, 'Student Declaration and Compliance Forms');

    // Student Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student ID: ${data.studentId}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Name: ${data.personalDetails.firstName} ${data.personalDetails.lastName}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Email: ${data.personalDetails.email}`, 20, yPosition);
    yPosition += 15;

    // Privacy Declaration
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Privacy Declaration', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const privacyText = 'I acknowledge that I have read and understood the Privacy Policy and consent to the collection, use, and disclosure of my personal information as outlined in the policy.';
    const splitPrivacyText = doc.splitTextToSize(privacyText, 170);
    doc.text(splitPrivacyText, 20, yPosition);
    yPosition += splitPrivacyText.length * 7 + 5;
    
    doc.text(`Signature Date: ${data.compliance.privacyDate}`, 20, yPosition);
    yPosition += 7;
    doc.text('Digital Signature: Accepted', 20, yPosition);
    yPosition += 15;

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
    
    doc.text(`Signature Date: ${data.compliance.declarationDate}`, 20, yPosition);
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
    
    doc.text(`Signature Date: ${data.compliance.policyDate}`, 20, yPosition);
    yPosition += 7;
    doc.text('Digital Signature: Accepted', 20, yPosition);
    yPosition += 15;

    // USI Information
    if (data.compliance.usi) {
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
      `Enrollment Status: ${data.status}`,
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
      { name: 'Passport Bio Page', status: data.documents.passportBio ? 'Submitted' : 'Pending' },
      { name: 'Visa Copy', status: data.documents.visaCopy ? 'Submitted' : 'Pending' },
      { name: 'Photo ID', status: data.documents.photoId ? 'Submitted' : 'Pending' },
      { name: 'USI Email Screenshot', status: data.documents.usiEmail ? 'Submitted' : 'Pending' },
      { name: 'Recent Photo', status: data.documents.recentPhoto ? 'Submitted' : 'Pending' }
    ];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    documents.forEach(docItem => {
      doc.text(`${docItem.name}: ${docItem.status}`, 20, yPosition);
      yPosition += 7;
    });
    yPosition += 10;

    // Next Steps
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Next Steps', 20, yPosition);
    yPosition += 10;

    const nextSteps = [
      '1. Your enrollment application has been submitted successfully.',
      '2. Our admissions team will review your application and documents.',
      '3. You will receive a confirmation email within 2-3 business days.',
      '4. If approved, you will receive course commencement details.',
      '5. For any queries, please contact our admissions team.'
    ];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    nextSteps.forEach(step => {
      doc.text(step, 20, yPosition);
      yPosition += 7;
    });

    this.createFooter(doc);
    return Buffer.from(doc.output('arraybuffer'));
  }
}