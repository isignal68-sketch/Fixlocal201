import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createAdminClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceData {
  invoiceNumber: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  providerName: string;
  serviceTitle: string;
  scheduledAt: string;
  subtotalCents: number;
  feeCents: number;
  taxCents: number;
  totalCents: number;
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const primary = rgb(0.145, 0.388, 0.922); // #2563EB
  const dark = rgb(0.05, 0.05, 0.06);
  const gray = rgb(0.45, 0.45, 0.47);

  let y = 740;

  page.drawText('FixLocal', { x: 50, y, size: 22, font: boldFont, color: primary });
  page.drawText('Invoice', { x: 500, y, size: 22, font: boldFont, color: dark });

  y -= 40;
  page.drawText(`Invoice #: ${data.invoiceNumber}`, { x: 50, y, size: 10, font, color: gray });
  page.drawText(`Date: ${formatDate(new Date())}`, { x: 500, y, size: 10, font, color: gray });

  y -= 50;
  page.drawText('Billed to', { x: 50, y, size: 10, font: boldFont, color: dark });
  page.drawText('Service provider', { x: 300, y, size: 10, font: boldFont, color: dark });
  y -= 16;
  page.drawText(data.customerName, { x: 50, y, size: 10, font, color: dark });
  page.drawText(data.providerName, { x: 300, y, size: 10, font, color: dark });
  y -= 14;
  page.drawText(data.customerEmail, { x: 50, y, size: 10, font, color: gray });

  y -= 40;
  page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });

  y -= 24;
  page.drawText('Description', { x: 50, y, size: 10, font: boldFont, color: dark });
  page.drawText('Date', { x: 350, y, size: 10, font: boldFont, color: dark });
  page.drawText('Amount', { x: 480, y, size: 10, font: boldFont, color: dark });

  y -= 20;
  page.drawText(data.serviceTitle, { x: 50, y, size: 10, font, color: dark });
  page.drawText(formatDate(data.scheduledAt), { x: 350, y, size: 10, font, color: dark });
  page.drawText(formatCurrency(data.subtotalCents), { x: 480, y, size: 10, font, color: dark });

  y -= 40;
  page.drawLine({ start: { x: 50, y }, end: { x: 562, y }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });

  y -= 24;
  page.drawText('Subtotal', { x: 400, y, size: 10, font, color: gray });
  page.drawText(formatCurrency(data.subtotalCents), { x: 480, y, size: 10, font, color: dark });

  y -= 18;
  page.drawText('Service fee', { x: 400, y, size: 10, font, color: gray });
  page.drawText(formatCurrency(data.feeCents), { x: 480, y, size: 10, font, color: dark });

  if (data.taxCents > 0) {
    y -= 18;
    page.drawText('Tax', { x: 400, y, size: 10, font, color: gray });
    page.drawText(formatCurrency(data.taxCents), { x: 480, y, size: 10, font, color: dark });
  }

  y -= 22;
  page.drawLine({ start: { x: 400, y }, end: { x: 562, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

  y -= 20;
  page.drawText('Total', { x: 400, y, size: 12, font: boldFont, color: dark });
  page.drawText(formatCurrency(data.totalCents), { x: 480, y, size: 12, font: boldFont, color: primary });

  page.drawText('Thank you for using FixLocal.', { x: 50, y: 60, size: 9, font, color: gray });

  return doc.save();
}

export async function createAndStoreInvoice(bookingId: string): Promise<string | null> {
  const supabase = createAdminClient();

  const { data: booking } = await supabase
    .from('bookings')
    .select(
      '*, customer:users!bookings_customer_id_fkey(full_name, email), provider:providers(business_name), service:services(title)'
    )
    .eq('id', bookingId)
    .single();

  if (!booking) return null;

  const bookingRow = booking as unknown as {
    id: string;
    price_cents: number;
    platform_fee_cents: number;
    scheduled_at: string;
    customer: { full_name: string; email: string } | null;
    provider: { business_name: string } | null;
    service: { title: string } | null;
  };

  const subtotalCents = bookingRow.price_cents - bookingRow.platform_fee_cents;

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      booking_id: bookingId,
      subtotal_cents: subtotalCents,
      fee_cents: bookingRow.platform_fee_cents,
      tax_cents: 0,
      total_cents: bookingRow.price_cents,
    })
    .select('id, invoice_number')
    .single();

  if (invoiceError || !invoice) return null;

  const pdfBytes = await generateInvoicePdf({
    invoiceNumber: invoice.invoice_number,
    bookingId: bookingRow.id,
    customerName: bookingRow.customer?.full_name ?? 'Customer',
    customerEmail: bookingRow.customer?.email ?? '',
    providerName: bookingRow.provider?.business_name ?? 'Provider',
    serviceTitle: bookingRow.service?.title ?? 'Service',
    scheduledAt: bookingRow.scheduled_at,
    subtotalCents,
    feeCents: bookingRow.platform_fee_cents,
    taxCents: 0,
    totalCents: bookingRow.price_cents,
  });

  const path = `${bookingId}/${invoice.invoice_number}.pdf`;
  await supabase.storage.from('invoices').upload(path, Buffer.from(pdfBytes), {
    contentType: 'application/pdf',
    upsert: true,
  });

  await supabase.from('invoices').update({ pdf_url: path }).eq('id', invoice.id);

  return invoice.id;
}
