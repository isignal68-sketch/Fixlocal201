'use server';

import { z } from 'zod';
import { getResendClient } from '@/lib/email/resend-client';
import { siteConfig } from '@/lib/site-config';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  subject: z.string().trim().min(3, 'Enter a subject').max(150),
  message: z.string().trim().min(10, 'Tell us a bit more (at least 10 characters)').max(2000),
});

export interface ContactActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitContactFormAction(input: unknown): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { success: false, fieldErrors };
  }

  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? `FixLocal <notifications@fixlocal.com>`,
      to: siteConfig.supportEmail,
      replyTo: parsed.data.email,
      subject: `[Contact form] ${parsed.data.subject}`,
      text: `From: ${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
    });
  } catch (error) {
    console.error('submitContactFormAction email error', error);
    return {
      success: false,
      message: 'We could not send your message right now. Please try again shortly.',
    };
  }

  return { success: true };
}
