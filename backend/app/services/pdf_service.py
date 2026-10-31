import io
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def generate_interview_pdf_report(result_data: dict) -> io.BytesIO:
    """Generate professional PDF interview evaluation report with Vignan University branding"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    header_title = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#10102B'),
        alignment=TA_CENTER
    )
    
    header_subtitle = ParagraphStyle(
        'HeaderSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#8B5CF6'),
        alignment=TA_CENTER
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#16163F'),
        spaceBefore=10,
        spaceAfter=6
    )
    
    body_text = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1F2937')
    )

    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#374151'),
        leftIndent=12
    )

    elements = []

    # Check for logo asset
    logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/public/assets/vignan-logo.png"))
    if os.path.exists(logo_path):
        try:
            logo_img = Image(logo_path, width=55, height=55)
            # Create a header table with logo on the left and university titles
            title_p = Paragraph("<b>VIGNAN'S UNIVERSITY</b>", header_title)
            sub_p = Paragraph("AI Mock Interview Assessment Report", header_subtitle)
            header_table = Table([[logo_img, [title_p, sub_p]]], colWidths=[65, 475])
            header_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('ALIGN', (0,0), (0,0), 'CENTER'),
            ]))
            elements.append(header_table)
        except Exception:
            elements.append(Paragraph("<b>VIGNAN'S UNIVERSITY</b>", header_title))
            elements.append(Paragraph("AI Mock Interview Assessment Report", header_subtitle))
    else:
        elements.append(Paragraph("<b>VIGNAN'S UNIVERSITY</b>", header_title))
        elements.append(Paragraph("AI Mock Interview Assessment Report", header_subtitle))

    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#8B5CF6'), spaceAfter=12))

    # Candidate Profile & Meta Table
    student_name = result_data.get("student_name", "Student")
    reg_number = result_data.get("registration_number", "N/A")
    interview_date = str(result_data.get("interview_date", ""))[:10]
    duration = f"{result_data.get('duration_minutes', 20)} Minutes"
    overall_score = result_data.get("overall_score", 0.0)

    score_color = '#10B981' if overall_score >= 75 else ('#F59E0B' if overall_score >= 60 else '#EF4444')

    info_data = [
        [
            Paragraph("<b>Candidate Name:</b>", body_text),
            Paragraph(student_name, body_text),
            Paragraph("<b>Overall Score:</b>", body_text),
            Paragraph(f"<font color='{score_color}' size='13'><b>{overall_score} / 100</b></font>", body_text)
        ],
        [
            Paragraph("<b>Registration No:</b>", body_text),
            Paragraph(reg_number, body_text),
            Paragraph("<b>Interview Date:</b>", body_text),
            Paragraph(interview_date, body_text)
        ],
        [
            Paragraph("<b>Skills Assessed:</b>", body_text),
            Paragraph(", ".join(result_data.get("skills_assessed", [])), body_text),
            Paragraph("<b>Session Duration:</b>", body_text),
            Paragraph(duration, body_text)
        ]
    ]

    info_table = Table(info_data, colWidths=[110, 160, 110, 160])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 14))

    # Category Breakdown Table
    elements.append(Paragraph("Category Performance Breakdown", section_heading))
    breakdown_headers = ["Evaluation Category", "Weight", "Score (/100)", "Weighted Score", "Observations"]
    breakdown_rows = [breakdown_headers]

    for cat in result_data.get("category_breakdown", []):
        breakdown_rows.append([
            Paragraph(f"<b>{cat.get('category_name')}</b>", body_text),
            f"{cat.get('weight')}%",
            f"{cat.get('score')}",
            f"{cat.get('weighted_score')}",
            Paragraph(cat.get('feedback', ''), bullet_style)
        ])

    breakdown_table = Table(breakdown_rows, colWidths=[130, 45, 65, 75, 225])
    breakdown_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#16163F')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('ALIGN', (1,0), (3,-1), 'CENTER'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(breakdown_table)
    elements.append(Spacer(1, 14))

    # Evidence: Strong and Weak points
    elements.append(Paragraph("Key Observations & Detailed Evidence", section_heading))
    
    strong_items = result_data.get("strong_answers", [])
    if strong_items:
        elements.append(Paragraph("<b>Strong Demonstrations:</b>", body_text))
        for item in strong_items:
            elements.append(Paragraph(f"• {item}", bullet_style))
        elements.append(Spacer(1, 6))

    weak_items = result_data.get("weak_answers", [])
    if weak_items:
        elements.append(Paragraph("<b>Areas for Refinement:</b>", body_text))
        for item in weak_items:
            elements.append(Paragraph(f"• {item}", bullet_style))
        elements.append(Spacer(1, 6))

    # Recommended Practice Questions
    practice_qs = result_data.get("recommended_practice_questions", [])
    if practice_qs:
        elements.append(Paragraph("Recommended Practice Questions for Campus Placement", section_heading))
        for q in practice_qs:
            elements.append(Paragraph(f"• {q}", bullet_style))
        elements.append(Spacer(1, 6))

    # Suggested Career Roles
    roles = result_data.get("suggested_career_roles", [])
    if roles:
        elements.append(Paragraph("Recommended Career Roles", section_heading))
        elements.append(Paragraph(f"<b>Suggested Roles:</b> {', '.join(roles)}", body_text))
        elements.append(Spacer(1, 10))

    # Footer notice
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceAfter=8))
    footer_p = Paragraph(
        "<i>This report was generated through automated evaluation by the Vignan's University AI Mock Interview Platform. Confidential to student and authorized faculty.</i>",
        ParagraphStyle('Footer', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor('#64748B'), alignment=TA_CENTER)
    )
    elements.append(footer_p)

    doc.build(elements)
    buffer.seek(0)
    return buffer
