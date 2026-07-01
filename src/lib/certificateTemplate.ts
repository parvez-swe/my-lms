export interface CertificateTemplateData {
  studentName: string;
  courseName: string;
  completionDate: Date | string;
  certificateId: string;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generateCertificateHTML(data: CertificateTemplateData): string {
  const studentName = escapeHtml(data.studentName);
  const courseName = escapeHtml(data.courseName);
  const certificateId = escapeHtml(data.certificateId);
  const completionDate = escapeHtml(formatDate(data.completionDate));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Certificate of Completion</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 landscape; margin: 0; }
    html, body {
      width: 1123px;
      height: 794px;
      margin: 0;
      padding: 0;
      background: #f8f6f1;
      font-family: Arial, Helvetica, sans-serif;
      color: #1a2744;
    }
    .page {
      width: 1123px;
      height: 794px;
      padding: 48px;
      position: relative;
      background: #ffffff;
    }
    .outer-border {
      width: 100%;
      height: 100%;
      border: 3px solid #c9a84c;
      padding: 10px;
      position: relative;
    }
    .inner-border {
      width: 100%;
      height: 100%;
      border: 1px solid #1a2744;
      padding: 48px 56px;
      position: relative;
      text-align: center;
    }
    .corner {
      position: absolute;
      width: 48px;
      height: 48px;
      border-color: #c9a84c;
      border-style: solid;
    }
    .corner-tl { top: 24px; left: 24px; border-width: 4px 0 0 4px; }
    .corner-tr { top: 24px; right: 24px; border-width: 4px 4px 0 0; }
    .corner-bl { bottom: 24px; left: 24px; border-width: 0 0 4px 4px; }
    .corner-br { bottom: 24px; right: 24px; border-width: 0 4px 4px 0; }
    .divider {
      width: 120px;
      height: 3px;
      background: #c9a84c;
      margin: 18px auto;
    }
    .divider-wide {
      width: 280px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
      margin: 24px auto;
    }
    .eyebrow {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #c9a84c;
      margin-bottom: 8px;
    }
    h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 46px;
      font-weight: 700;
      color: #1a2744;
      letter-spacing: 2px;
      line-height: 1.1;
    }
    .subtitle {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 22px;
      color: #1a2744;
      letter-spacing: 6px;
      text-transform: uppercase;
      margin-top: 6px;
    }
    .body-text {
      font-size: 18px;
      color: #3d4f6f;
      line-height: 1.6;
      margin-top: 28px;
    }
    .student-name {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 52px;
      font-weight: 700;
      color: #1a2744;
      margin: 18px 0 8px;
      line-height: 1.2;
    }
    .course-name {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 30px;
      font-weight: 600;
      color: #1a2744;
      margin: 10px 0 6px;
      line-height: 1.3;
    }
    .meta {
      margin-top: 36px;
      display: flex;
      justify-content: center;
      gap: 80px;
      font-size: 15px;
      color: #3d4f6f;
    }
    .meta-label {
      font-size: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #c9a84c;
      margin-bottom: 6px;
    }
    .meta-value {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 18px;
      color: #1a2744;
      font-weight: 600;
    }
    .certificate-id {
      position: absolute;
      bottom: 28px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 11px;
      color: #6b7c99;
      letter-spacing: 1px;
    }
    .seal {
      width: 72px;
      height: 72px;
      border: 3px solid #c9a84c;
      border-radius: 50%;
      margin: 28px auto 0;
      position: relative;
    }
    .seal::before {
      content: "";
      position: absolute;
      inset: 8px;
      border: 1px solid #1a2744;
      border-radius: 50%;
    }
    .seal::after {
      content: "★";
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #c9a84c;
      line-height: 72px;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="outer-border">
      <div class="inner-border">
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>

        <div class="eyebrow">Learning Platform</div>
        <h1>Certificate of Completion</h1>
        <div class="divider"></div>
        <div class="subtitle">Awarded To</div>

        <p class="body-text">This certifies that</p>
        <div class="student-name">${studentName}</div>
        <div class="divider-wide"></div>
        <p class="body-text">has successfully completed the course</p>
        <div class="course-name">${courseName}</div>

        <div class="seal"></div>

        <div class="meta">
          <div>
            <div class="meta-label">Completion Date</div>
            <div class="meta-value">${completionDate}</div>
          </div>
        </div>

        <div class="certificate-id">Certificate ID: ${certificateId}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
