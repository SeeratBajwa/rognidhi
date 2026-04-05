import os
import sys
import fitz
import docx
import mysql.connector
from mysql.connector import Error
import re

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def get_db_connection():
    """Establish database connection"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='rognidhi',
            user='root',
            password='12344321'
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def extract_text_from_pdf(file_path):
    try:
        doc = fitz.open(file_path)
        texts = [page.get_text() for page in doc]
        return "\n".join(texts).strip()
    except Exception as e:
        print(f"PDF parse error for {file_path}: {e}", file=sys.stderr)
        return ""


def extract_text_from_docx(file_path):
    try:
        document = docx.Document(file_path)
        return "\n".join([paragraph.text for paragraph in document.paragraphs]).strip()
    except Exception as e:
        print(f"DOCX parse error for {file_path}: {e}", file=sys.stderr)
        return ""


def extract_text_from_file(file_path):
    lower_path = file_path.lower()
    if lower_path.endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    if lower_path.endswith('.docx'):
        return extract_text_from_docx(file_path)

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read().strip()
    except UnicodeDecodeError:
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                return f.read().strip()
        except Exception as e:
            print(f"Binary file parse error for {file_path}: {e}", file=sys.stderr)
            return ""
    except Exception as e:
        print(f"Error reading file {file_path}: {e}", file=sys.stderr)
        return ""


def get_patient_reports(patient_email, doctor_email=None):
    """Fetch medical reports for a patient, optionally only those shared with a doctor"""
    connection = get_db_connection()
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)
        if doctor_email:
            query = "SELECT d.file_path, d.document_type, d.created_at FROM documents d JOIN shared_records sr ON d.id = sr.file_id WHERE d.email = %s AND sr.doctor_email = %s ORDER BY sr.shared_at DESC"
            cursor.execute(query, (patient_email, doctor_email))
        else:
            query = "SELECT file_path, document_type, created_at FROM documents WHERE email = %s ORDER BY created_at DESC"
            cursor.execute(query, (patient_email,))

        reports = cursor.fetchall()

        report_texts = []
        for report in reports:
            file_path = os.path.join('uploads', report['file_path'])
            content = ""
            if os.path.exists(file_path):
                content = extract_text_from_file(file_path)
            else:
                print(f"Missing file: {file_path}", file=sys.stderr)

            report_texts.append({
                'content': content,
                'type': report['document_type'] or 'document',
                'date': report['created_at'],
                'file_path': report['file_path']
            })

        return report_texts
    except Error as e:
        print(f"Error fetching reports: {e}")
        return []
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def extract_section(content, section_name):
    """Extract a specific section from medical content"""
    lower_content = content.lower()
    if section_name.lower() not in lower_content:
        return ""
    
    start_idx = lower_content.find(section_name.lower())
    # Find the next section (all caps words ending with :)
    end_pattern = r'\n[A-Z][A-Z\s]+:'
    matches = list(re.finditer(end_pattern, lower_content[start_idx+len(section_name):]))
    
    if matches:
        end_idx = start_idx + len(section_name) + matches[0].start()
    else:
        end_idx = len(content)
    
    return content[start_idx:end_idx].strip()

def extract_chief_complaint(content):
    """Extract chief complaint from medical content"""
    
    # Look for the actual chief complaint (usually mentions the main symptom)
    complaint_patterns = [
        r"having (.+?) for",
        r"complains of (.+?)[\.\n]",
        r"chief complaint.*?(.+?)(?:for|since|history)",
        r"presents with (.+?)[\.\n]",
    ]
    
    complaints = []
    for pattern in complaint_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        if matches:
            complaint = matches[0].strip()
            # Clean up
            complaint = complaint.replace("Define the reason for the patient's visit as who has been\n", "")
            complaint = re.sub(r'\s+', ' ', complaint).strip()
            if len(complaint) > 5 and len(complaint) < 150 and 'define' not in complaint.lower():
                complaints.append(complaint)
                break
    
    return complaints[:1] if complaints else []

def extract_diagnoses(content):
    """Extract diagnoses from content"""
    lower_content = content.lower()
    diagnoses = []
    
    # Look for common diagnosed conditions
    condition_map = {
        'Hypertension/High Blood Pressure': ['hypertension', 'high blood pressure', 'htn'],
        'Type 2 Diabetes': ['type 2 diabetes', 'diabetes mellitus'],
        'High Cholesterol': ['hyperlipidemia', 'high cholesterol', 'dyslipidemia'],
        'Coronary Artery Disease': ['coronary artery disease', 'cad'],
        'Peptic Ulcer Disease': ['peptic ulcer'],
        'GERD': ['gerd', 'reflux esophagitis'],
        'Heart Disease': ['heart disease', 'cardiac disease'],
    }
    
    for condition, keywords in condition_map.items():
        for keyword in keywords:
            if keyword in lower_content:
                # Avoid negations
                idx = lower_content.find(keyword)
                context = lower_content[max(0, idx-50):idx]
                if 'no ' not in context and 'never ' not in context and 'denied' not in context:
                    diagnoses.append(condition)
                    break
    
    return diagnoses

def extract_medications(content):
    """Extract medications from content"""
    lower_content = content.lower()
    medications = []
    
    medication_map = {
        'Metformin': ['metformin'],
        'Lisinopril': ['lisinopril'],
        'Atorvastatin': ['atorvastatin'],
        'Aspirin': ['aspirin'],
        'Cimetidine': ['cimetidine'],
        'Omeprazole': ['omeprazole'],
        'Ibuprofen': ['ibuprofen'],
    }
    
    for drug, keywords in medication_map.items():
        for keyword in keywords:
            if keyword in lower_content:
                medications.append(drug)
                break
    
    return medications

def extract_allergies(content):
    """Extract allergies from content"""
    lower_content = content.lower()
    allergies = []
    
    if 'allergy' in lower_content or 'allergic' in lower_content:
        allergy_map = {
            'Penicillin': ['penicillin'],
            'Sulfa': ['sulfa'],
            'Aspirin': ['aspirin allergy', 'asa allergy'],
            'NSAID': ['nsaid'],
            'Latex': ['latex'],
        }
        
        for allergy_type, keywords in allergy_map.items():
            for keyword in keywords:
                if keyword in lower_content:
                    allergies.append(allergy_type)
                    break
    
    return allergies

def extract_risk_factors(content):
    """Extract risk factors from content"""
    lower_content = content.lower()
    risk_factors = []
    
    factor_map = {
        'Hypertension History': ['was diagnosed with hypertension'],
        'Diabetes History': ['was diagnosed with.*diabetes'],
        'Family History of Premature CAD': ['family history.*premature', 'family history.*cad'],
        'Smoking': ['cigarette smoking', 'currently smokes'],
    }
    
    for factor, patterns in factor_map.items():
        for pattern in patterns:
            if re.search(pattern, lower_content, re.IGNORECASE):
                risk_factors.append(factor)
                break
    
    return risk_factors

def generate_structured_summary(content):
    """Generate a structured medical summary from content text"""
    
    if not content or len(content.strip()) == 0:
        return "No content available for summarization."
    
    # Extract key sections
    chief_complaints = extract_chief_complaint(content)
    diagnoses = extract_diagnoses(content)
    medications = extract_medications(content)
    allergies = extract_allergies(content)
    risk_factors = extract_risk_factors(content)
    
    # Build structured summary
    summary_lines = []
    
    # Chief Complaint
    summary_lines.append("CHIEF COMPLAINT:")
    if chief_complaints:
        summary_lines.append(f"- {chief_complaints[0]}")
    else:
        summary_lines.append("- Not specified in record")
    summary_lines.append("")
    
    # Medical History
    summary_lines.append("MEDICAL HISTORY:")
    if diagnoses:
        summary_lines.append("Diagnoses:")
        for diagnosis in diagnoses:
            summary_lines.append(f"- {diagnosis}")
    else:
        summary_lines.append("- No chronic conditions documented")
    summary_lines.append("")
    
    # Risk Factors
    if risk_factors:
        summary_lines.append("RISK FACTORS:")
        for factor in risk_factors:
            summary_lines.append(f"- {factor}")
        summary_lines.append("")
    
    # Medications
    summary_lines.append("CURRENT MEDICATIONS:")
    if medications:
        for med in medications:
            summary_lines.append(f"- {med}")
    else:
        summary_lines.append("- No specific medications documented in this report")
    summary_lines.append("")
    
    # Allergies
    summary_lines.append("ALLERGIES:")
    if allergies:
        for allergy in allergies:
            summary_lines.append(f"- {allergy}")
    else:
        summary_lines.append("- No known allergies documented")
    summary_lines.append("")
    
    summary_lines.append("RECOMMENDATION:")
    summary_lines.append("- Please review the complete patient records for comprehensive clinical details and follow-up care instructions.")
    
    return "\n".join(summary_lines)

def generate_medical_summary(patient_email, doctor_email=None):
    """Generate AI summary of patient's medical reports"""
    try:
        # Get patient's reports that the doctor can access
        reports = get_patient_reports(patient_email, doctor_email)

        if not reports:
            return "No medical reports found for this patient."

        combined_summary = []
        
        for report in reports:
            content = report['content']
            
            if content:
                # Generate structured summary for each report
                summary = generate_structured_summary(content)
                combined_summary.append(f"REPORT: {report['file_path']}")
                combined_summary.append(summary)
                combined_summary.append("\n" + "="*60 + "\n")
        
        if not combined_summary:
            return "No readable content could be extracted from the uploaded files."
        
        return "\n".join(combined_summary)

    except Exception as e:
        error_msg = f"Error generating summary: {str(e)}"
        print(error_msg)
        return error_msg

if __name__ == "__main__":
    # Test the function
    if len(sys.argv) > 1:
        patient_email = sys.argv[1]
        doctor_email = sys.argv[2] if len(sys.argv) > 2 else None
        summary = generate_medical_summary(patient_email, doctor_email)
        print(summary)
    else:
        print("Usage: python ai_server.py <patient_email> [doctor_email]")
