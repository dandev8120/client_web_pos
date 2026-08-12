import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import seedVatJson from "./src/seed/seedVat.json";
import seedOrderDetailsJson from "./src/seed/seedOrderDetails.json";
import seedOrdersJson from "./src/seed/seedOrders.json";
import { VatInvoiceMapper } from "./src/dtos/VatDto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Proxy for /api/receipts-center to bypass browser CORS / ngrok restrictions
  app.use("/api/receipts-center", async (req, res) => {
    const backendBaseUrl = process.env.VITE_POS_CENTER_API_URL || process.env.POS_CENTER_API_URL || 'https://46f2-115-79-139-93.ngrok-free.app';
    const cleanBaseUrl = backendBaseUrl.replace(/\/+$/, '');
    const targetUrl = `${cleanBaseUrl}/api/receipts-center${req.url}`;

    // Read timeout from environment variable (VITE_POS_CENTER_TIMEOUT, POS_CENTER_TIMEOUT, or TIMEOUT)
    const rawTimeout = Number(
      process.env.VITE_POS_CENTER_TIMEOUT || 
      process.env.POS_CENTER_TIMEOUT || 
      process.env.TIMEOUT || 
      '60000'
    );
    // If value is under 1000, treat it as seconds and convert to ms, default to 60000ms if invalid/0
    const timeoutMs = (rawTimeout > 0 && rawTimeout < 1000) ? rawTimeout * 1000 : (rawTimeout || 60000);

    const controller = new AbortController();
    let isTimedOut = false;
    let isClientClosed = false;

    // Track client socket aborts when client closes connection before server sends response
    res.on('close', () => {
      if (!res.writableEnded) {
        isClientClosed = true;
        controller.abort();
      }
    });

    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      controller.abort();
    }, timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept': req.headers['accept'] || 'application/json',
        'X-Client-App': 'POS-CENTER-BITIS',
        'ngrok-skip-browser-warning': 'true',
      };

      const options: RequestInit = {
        method: req.method,
        headers,
        signal: controller.signal,
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase()) && req.body && Object.keys(req.body).length > 0) {
        options.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, options);
      clearTimeout(timeoutId);

      if (res.writableEnded) return;

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return res.status(response.status).json(data);
      } else {
        const text = await response.text();
        return res.status(response.status).send(text);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (res.writableEnded) return;

      if (isClientClosed) {
        console.info(`[Proxy] Client closed connection for ${req.method} ${targetUrl}`);
        return;
      }

      if (isTimedOut || err.name === 'AbortError' || err.message?.includes('aborted')) {
        console.warn(`[Proxy] Request timed out after ${timeoutMs}ms for ${req.method} ${targetUrl}`);
        return res.status(504).json({
          success: false,
          isSuccess: false,
          code: 504,
          message: `Quá thời gian kết nối tới máy chủ POS Center (${Math.round(timeoutMs / 1000)}s)`
        });
      }

      console.error(`[Proxy] Error forwarding request to ngrok backend (${targetUrl}):`, err.message || err);
      return res.status(502).json({
        success: false,
        isSuccess: false,
        code: 502,
        message: `Không thể kết nối đến máy chủ POS Center: ${err.message || 'Lỗi mạng'}`
      });
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock OAuth2 URL - in a real app, this would construct a real provider URL
  app.get("/api/auth/url", (req, res) => {
    const authUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback?code=mock_code`;
    res.json({ url: authUrl });
  });

  // In-memory VAT Invoice database seeded from seedVat.json
  const issuedVatInvoices = new Map<string, any>();

  if (Array.isArray(seedVatJson.sampleInvoices)) {
    seedVatJson.sampleInvoices.forEach((inv: any) => {
      const key = `${inv.orderId}_${inv.storeId}_${inv.registerId}`;
      issuedVatInvoices.set(key, {
        formData: inv.formData,
        issuedAt: inv.issuedAt,
        amount: inv.amount
      });
    });
  }

  // VAT Form configurations initialized & mapped via VatInvoiceMapper from seedVat.json
  let vatFormConfig = VatInvoiceMapper.toFormConfigDto(seedVatJson.vatFormConfig);

  // API to get VAT Form Config
  app.get("/api/vat/config", (req, res) => {
    res.json(vatFormConfig);
  });

  // API to update VAT Form Config
  app.post("/api/vat/config", (req, res) => {
    const newConfig = req.body;
    if (newConfig && (newConfig.individual || newConfig.enterprise)) {
      vatFormConfig = VatInvoiceMapper.toFormConfigDto({
        ...vatFormConfig,
        ...newConfig
      });
      return res.json({ success: true, config: vatFormConfig });
    }
    return res.status(400).json({ success: false, error: "Dữ liệu cấu hình không hợp lệ." });
  });

  // API to verify URL parameters and return form configuration or issued state
  app.get("/api/vat/verify", (req, res) => {
    const { oid, sid, rid, o, sig, a, ct } = req.query;

    if (!oid || !sid || !rid || !sig) {
      return res.status(400).json({
        valid: false,
        error: "Tham số không đầy đủ hoặc chữ ký bảo mật (sig) bị thiếu. Vui lòng kiểm tra lại liên kết."
      });
    }

    const invoiceKey = `${oid}_${sid}_${rid}`;

    // Case 2: Invoice is already issued
    if (issuedVatInvoices.has(invoiceKey)) {
      const data = issuedVatInvoices.get(invoiceKey);
      const responseDto = VatInvoiceMapper.toIssuedResponseDto(
        String(oid),
        String(sid),
        String(rid),
        String(sig),
        String(a || '0'),
        data
      );
      return res.json(responseDto);
    }

    // Case 1: Invoice has not been issued yet - return Form JSONB config
    return res.json({
      valid: true,
      status: "pending",
      amount: a || "0",
      orderId: oid,
      formConfig: vatFormConfig
    });
  });

  // API to submit VAT invoice information
  app.post("/api/vat/submit", (req, res) => {
    const { oid, sid, rid, o, sig, a, ct, formData } = req.body;

    if (!oid || !sid || !rid || !sig || !formData) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin xác thực hoặc dữ liệu biểu mẫu."
      });
    }

    const invoiceKey = `${oid}_${sid}_${rid}`;
    
    // Store in our in-memory DB
    issuedVatInvoices.set(invoiceKey, {
      formData,
      issuedAt: new Date().toISOString(),
      amount: a,
      ct
    });

    const responseDto = VatInvoiceMapper.toIssuedResponseDto(
      String(oid),
      String(sid),
      String(rid),
      String(sig),
      String(a || '0'),
      { formData, issuedAt: new Date().toISOString() }
    );

    return res.json({
      success: true,
      downloadUrl: responseDto.downloadUrl
    });
  });

  // API to download issued invoice as PDF
  app.get("/api/vat/download", (req, res) => {
    const { oid, sid, rid, a } = req.query;

    if (!oid || !sid || !rid) {
      return res.status(400).send("Yêu cầu tải xuống không hợp lệ.");
    }

    const invoiceKey = `${oid}_${sid}_${rid}`;
    const invoiceData = issuedVatInvoices.get(invoiceKey);

    const companyName = invoiceData ? invoiceData.formData.companyName : "Khách hàng Vãng lai";
    const taxCode = invoiceData ? invoiceData.formData.taxCode : "Chưa đăng ký";
    const email = invoiceData ? invoiceData.formData.email : "N/A";
    const amount = (a as string) || (invoiceData ? invoiceData.amount : "5000000");

    // Clear accents/diacritics for basic PDF text generation to guarantee no raw unicode crashes
    const cleanText = (str: string) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^\x20-\x7E]/g, "");
    };

    const cleanCompany = cleanText(companyName);
    const cleanEmail = cleanText(email);

    const formattedAmount = Number(amount).toLocaleString('vi-VN');

    // Generate a minimal but valid PDF 1.4 layout
    const pdfBody = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources 4 0 R /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >>
endobj
5 0 obj
<< /Length 1000 >>
stream
BT
/F1 18 Tf
70 750 Td
(HOA DON GTGT DIEN TU - VAT INVOICE) Tj
/F1 12 Tf
0 -40 Td
(Ma don hang (Order ID): ${oid}) Tj
0 -25 Td
(So tien (Amount): ${formattedAmount} VND) Tj
0 -25 Td
(Don vi mua hang (Company): ${cleanCompany}) Tj
0 -25 Td
(Ma so thue (Tax Code): ${taxCode}) Tj
0 -25 Td
(Email nhan (Email): ${cleanEmail}) Tj
0 -40 Td
(Trang thai: Da phat hanh hoa don dien tu hop le.) Tj
0 -20 Td
(Hoa don nay duoc phat hanh tu dong qua Cong Thong Tin VAT.) Tj
0 -30 Td
(Cam on quy khach da tin tuong va mua hang!) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000222 00000 n 
0000000305 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
450
%%EOF`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Hoa_Don_VAT_${oid}.pdf"`);
    res.send(Buffer.from(pdfBody, 'utf-8'));
  });

  // OAuth2 Callback Handler
  app.get("/auth/callback", (req, res) => {
    // In a real app, you'd exchange the code for tokens here
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: { name: 'Admin User', role: 'admin' } }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
