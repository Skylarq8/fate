interface PromoCodeEmailProps {
  email: string
  code: string
  discountValue: number
  discountType: "percentage" | "amount"
  expiresAt: Date
}

function fmt(amount: number) {
  return new Intl.NumberFormat("mn-MN").format(amount) + "₮"
}

export function promoCodeHtml({ code, discountValue, discountType, expiresAt }: PromoCodeEmailProps) {
  const discountLabel =
    discountType === "percentage" ? `${discountValue}%` : fmt(discountValue)

  const expiry = new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(expiresAt)

  return `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Таны хямдралын код</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:20px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#b91c1c;padding:40px 40px 30px;text-align:center;border-bottom:1px solid rgba(239,68,68,0.2);">
              <p style="margin:0 0 8px; color:#ffffff; font-size:13px;letter-spacing:3px;text-transform:uppercase;color:rgba(239,68,68,0.8);">FATE STORE</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">🎁 Таны онцгой хямдрал</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.6;">
                Анхны захиалгадаа зориулсан <strong style="color:#fff;">${discountLabel} хямдрал</strong>-ын код амжилттай бэлдлээ.
                Доорх кодыг захиалга хийхдээ ашиглана уу.
              </p>

              <!-- Code box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:linear-gradient(135deg,rgba(239,68,68,0.15),rgba(239,68,68,0.05));border:1.5px dashed rgba(239,68,68,0.5);border-radius:14px;padding:24px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.4);">Таны код</p>
                    <p style="margin:0;font-size:30px;font-weight:800;letter-spacing:6px;color:#ef4444;font-family:'Courier New',Courier,monospace;">${code}</p>
                    <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.5);">${discountLabel} хямдрал</p>
                  </td>
                </tr>
              </table>

              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:rgba(255,255,255,0.04);border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.45);">Хямдрал</td>
                        <td style="font-size:13px;color:#fff;font-weight:600;text-align:right;">${discountLabel}</td>
                      </tr>
                    </table>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.45);">Ашиглах хязгаар</td>
                        <td style="font-size:13px;color:#fff;font-weight:600;text-align:right;">1 удаа</td>
                      </tr>
                    </table>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:rgba(255,255,255,0.45);">⏳ Дуусах хугацаа</td>
                        <td style="font-size:13px;color:#f97316;font-weight:600;text-align:right;">${expiry}</td>
                      </tr>
                    </table>
                  </td>
                  <td></td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center">
                    <a href="${"https://fate.mn"}/products"
                       style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:12px;letter-spacing:0.3px;">
                      Дэлгүүр хэсэх →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);text-align:center;line-height:1.6;">
                Код нэг удаа ашиглах боломжтой бөгөөд ${expiry} хүртэл хүчинтэй.<br/>
                Та энэ мейлийг захиалаагүй гэж үзвэл үл тоомсорлоно уу.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">© 2026 FATE Store · fatestore8@gmail.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
