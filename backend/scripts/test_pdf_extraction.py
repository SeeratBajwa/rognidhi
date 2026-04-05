import os
import sys
import fitz

# Test extracting text from the PDF
pdf_path = r"c:\Users\jasno\rognidhi\backend\uploads\1775140655350-UEC310_MST_E_MAR25.pdf"

if os.path.exists(pdf_path):
    print(f"✅ File exists: {pdf_path}")
    print(f"📊 File size: {os.path.getsize(pdf_path):,} bytes\n")
    
    try:
        doc = fitz.open(pdf_path)
        print(f"📄 PDF has {doc.page_count} page(s)\n")
        
        for page_num in range(min(2, doc.page_count)):  # First 2 pages
            page = doc[page_num]
            text = page.get_text()
            print(f"--- Page {page_num + 1} ---")
            print(text[:500] if text else "[No text found on this page]")
            print()
    except Exception as e:
        print(f"❌ Error reading PDF: {e}")
else:
    print(f"❌ File not found: {pdf_path}")
