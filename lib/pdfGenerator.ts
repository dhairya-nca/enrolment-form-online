import jsPDF from 'jspdf';
import { LLNResponse, EnrollmentData } from '../utils/types';
import { LLN_QUESTIONS } from '../utils/constants';

export class PDFGenerator {
  private addHeader(doc: jsPDF, title: string) {
    // Add NCA logo and header
    doc.setFillColor(34, 54, 74); // NCA primary color
    doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('National College Australia', 20, 17);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 20, 35);
    
    // Add current date
    const date = new Date().toLocaleDateString('en-AU');
    doc.text(`Generated: ${date}`, doc.internal.pageSize.width - 60, 17);
    
    doc.setTextColor(0, 0, 0); // Reset to black
    return 45; // Return Y position for content
  }

  private addFooter(doc: jsPDF, pageNum: number) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${pageNum} | National College Australia | RTO Provider No. #91000`,
      20,
      pageHeight - 10
    );
  }

  generateLLNReport(data: LLNResponse): Uint8Array {
    const doc = new jsPDF();
    let yPos = this.addHeader(doc, 'LLN Assessment Report');
    
    // Student Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information', 20, yPos + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos += 25;
    
    const studentInfo = [
      `Name: ${data.responses.firstName} ${data.responses.lastName}`,
      `Email: ${data.responses.email}`,
      `Phone: ${data.responses.phone}`,
      `Date of Birth: ${data.responses.dateOfBirth}`,
      `Assessment Date: ${new Date(data.completedAt).toLocaleDateString('en-AU')}`
    ];
    
    studentInfo.forEach(info => {
      doc.text(info, 20, yPos);
      yPos += 6;
    });
    
    // Assessment Results
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Assessment Results', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Score: ${data.overallScore}%`, 20, yPos);
    doc.text(`Rating: ${data.rating}`, 120, yPos);
    
    yPos += 10;
    const eligibilityColor = data.eligible ? [0, 128, 0] : [255, 0, 0];
    doc.setTextColor(...eligibilityColor);
    doc.text(`Eligibility: ${data.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`, 20, yPos);
    doc.setTextColor(0, 0, 0);
    
    // Section Scores
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Section Breakdown', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const sections = [
      { name: 'Learning', score: data.scores.learning },
      { name: 'Reading', score: data.scores.reading },
      { name: 'Writing', score: data.scores.writing },
      { name: 'Numeracy', score: data.scores.numeracy },
      { name: 'Digital Literacy', score: data.scores.digitalLiteracy }
    ];
    
    sections.forEach(section => {
      doc.text(`${section.name}:`, 20, yPos);
      doc.text(`${section.score}%`, 70, yPos);
      
      // Progress bar
      doc.setFillColor(240, 240, 240);
      doc.rect(80, yPos - 3, 60, 6, 'F');
      doc.setFillColor(59, 130, 246);
      doc.rect(80, yPos - 3, (section.score / 100) * 60, 6, 'F');
      
      yPos += 12;
    });
    
    // Detailed Responses (new page)
    doc.addPage();
    yPos = this.addHeader(doc, 'Detailed Assessment Responses');
    
    LLN_QUESTIONS.forEach((question, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = this.addHeader(doc, 'Detailed Assessment Responses (continued)');
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${question.question}`, 20, yPos, { maxWidth: 170 });
      
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      const response = data.responses[question.id];
      const responseText = Array.isArray(response) ? response.join(', ') : response || 'No response';
      doc.text(`Answer: ${responseText}`, 25, yPos, { maxWidth: 165 });
      
      yPos += 15;
    });
    
    this.addFooter(doc, 1);
    return doc.output('arraybuffer') as Uint8Array;
  }

  generateEnrollmentForm(data: EnrollmentData): Uint8Array {
    const doc = new jsPDF();
    let yPos = this.addHeader(doc, 'Student Enrollment Form');
    
    // Personal Details Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Personal Details', 20, yPos + 10);
    
    yPos += 25;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const personalFields = [
      ['Title:', data.personalDetails.title],
      ['Gender:', data.personalDetails.gender],
      ['Full Name:', `${data.personalDetails.firstName} ${data.personalDetails.middleName || ''} ${data.personalDetails.lastName}`.trim()],
      ['Date of Birth:', data.personalDetails.dateOfBirth],
      ['Mobile:', data.personalDetails.mobile],
      ['Email:', data.personalDetails.email]
    ];
    
    personalFields.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '', 60, yPos);
      yPos += 8;
    });
    
    // Address Section
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Address', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const address = data.personalDetails.address;
    const addressText = `${address.houseNumber} ${address.streetName}, ${address.suburb} ${address.state} ${address.postcode}`;
    doc.text(addressText, 20, yPos);
    
    if (address.postalAddress) {
      yPos += 8;
      doc.text(`Postal Address: ${address.postalAddress}`, 20, yPos);
    }
    
    // Course Details Section
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Course Details', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const courseFields = [
      ['Course:', data.courseDetails.courseName],
      ['Delivery Mode:', data.courseDetails.deliveryMode],
      ['Start Date:', data.courseDetails.startDate]
    ];
    
    courseFields.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '', 60, yPos);
      yPos += 8;
    });
    
    // Background Information (new page if needed)
    if (yPos > 200) {
      doc.addPage();
      yPos = this.addHeader(doc, 'Student Enrollment Form (continued)');
    }
    
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Background Information', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const backgroundFields = [
      ['Emergency Contact:', data.background.emergencyContact],
      ['Country of Birth:', data.background.countryOfBirth],
      ['Country of Citizenship:', data.background.countryOfCitizenship],
      ['Main Language:', data.background.mainLanguage],
      ['English Proficiency:', data.background.englishProficiency],
      ['Australian Citizen:', data.background.australianCitizen ? 'Yes' : 'No'],
      ['Aboriginal Status:', data.background.aboriginalStatus],
      ['Employment Status:', data.background.employmentStatus],
      ['Secondary School:', data.background.secondarySchool ? 'Yes' : 'No'],
      ['School Level:', data.background.schoolLevel],
      ['Qualifications:', data.background.qualifications],
      ['Disability:', data.background.disability ? 'Yes' : 'No'],
      ['Course Reason:', data.background.courseReason]
    ];
    
    backgroundFields.forEach(([label, value]) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = this.addHeader(doc, 'Student Enrollment Form (continued)');
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '', 70, yPos, { maxWidth: 120 });
      yPos += 8;
    });
    
    // Compliance Section
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Legal Compliance', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const complianceFields = [
      ['USI:', data.compliance.usi || 'Not provided'],
      ['Privacy Declaration Signed:', data.compliance.privacyDate],
      ['Student Declaration Signed:', data.compliance.declarationDate],
      ['Policy Agreement Signed:', data.compliance.policyDate]
    ];
    
    complianceFields.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '', 70, yPos);
      yPos += 8;
    });
    
    // Digital signatures note
    yPos += 10;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Note: This document contains digital signatures captured during the online enrollment process.', 20, yPos);
    doc.text('All signatures are legally binding and have been electronically recorded with timestamps.', 20, yPos + 5);
    
    this.addFooter(doc, 1);
    return doc.output('arraybuffer') as Uint8Array;
  }
}