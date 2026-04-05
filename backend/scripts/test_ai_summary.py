#!/usr/bin/env python3
"""
Test script for AI medical summary functionality
"""

import os
import sys
from ai_server import generate_medical_summary

def test_ai_summary():
    """Test the AI summary generation"""

    # Sample patient email (you can change this to test with actual data)
    patient_email = "patient@test.com"

    print("Testing AI Medical Summary Generation")
    print("=" * 50)
    print(f"Patient Email: {patient_email}")
    print()

    try:
        print("Generating summary...")
        summary = generate_medical_summary(patient_email)

        print("Summary generated successfully!")
        print("-" * 30)
        print(summary)
        print("-" * 30)

        # Save to file
        with open('ai_summary_test_result.txt', 'w', encoding='utf-8') as f:
            f.write("ORIGINAL REPORT:\n")
            f.write("==================================================\n\n")
            f.write("Sample medical report content would be here...\n\n")
            f.write("AI SUMMARY:\n")
            f.write("==================================================\n")
            f.write(summary)

        print("Result saved to ai_summary_test_result.txt")

    except Exception as e:
        error_msg = f"Error generating summary: {str(e)}"
        print("ERROR:", error_msg)

        # Save error to file
        with open('ai_summary_test_result.txt', 'w', encoding='utf-8') as f:
            f.write("ORIGINAL REPORT:\n")
            f.write("==================================================\n\n")
            f.write("Sample medical report content would be here...\n\n")
            f.write("AI SUMMARY:\n")
            f.write("==================================================\n")
            f.write(error_msg)

if __name__ == "__main__":
    test_ai_summary()
