// Shared by the Mail composer (instant feedback) and POST /api/contact (the
// check that counts). One schema, so the two can't drift apart.

export const CONTACT_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  subject: { min: 1, max: 150 },
  message: { min: 10, max: 5000 },
} as const;

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactField = keyof ContactInput;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export interface ContactResponse {
  success: boolean;
  /** Safe to show to visitors. Never contains provider details. */
  message: string;
  errors?: ContactFieldErrors;
}

export type ContactValidation =
  | { ok: true; data: ContactInput }
  | { ok: false; errors: ContactFieldErrors };

const EMAIL =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
// Control characters (including CR/LF) are never allowed in single-line fields: that blocks header injection.
const CONTROL = /[\u0000-\u001f\u007f]/;

export const isValidEmail = (value: string) => value.length <= CONTACT_LIMITS.email.max && EMAIL.test(value);

const asString = (value: unknown) => (typeof value === "string" ? value : "");

/** Trims and validates. Works on anything: unknown input yields field errors, never a throw. */
export function validateContact(input: unknown): ContactValidation {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const name = asString(raw.name).trim();
  const email = asString(raw.email).trim();
  const subject = asString(raw.subject).trim();
  const message = asString(raw.message).replace(/\r\n?/g, "\n").trim();
  const errors: ContactFieldErrors = {};
  const L = CONTACT_LIMITS;

  if (name.length < L.name.min) errors.name = `Enter your name (at least ${L.name.min} characters).`;
  else if (name.length > L.name.max) errors.name = `Name must be ${L.name.max} characters or fewer.`;
  else if (CONTROL.test(name)) errors.name = "Name can't contain line breaks or control characters.";

  if (!email) errors.email = "Enter your email address.";
  else if (CONTROL.test(email) || !isValidEmail(email)) errors.email = "Enter a valid email address.";

  if (subject.length < L.subject.min) errors.subject = "Enter a subject.";
  else if (subject.length > L.subject.max) errors.subject = `Subject must be ${L.subject.max} characters or fewer.`;
  else if (CONTROL.test(subject)) errors.subject = "Subject can't contain line breaks or control characters.";

  if (message.length < L.message.min) errors.message = `Write a message (at least ${L.message.min} characters).`;
  else if (message.length > L.message.max) errors.message = `Message must be ${L.message.max} characters or fewer.`;
  else if (message.includes("\u0000")) errors.message = "Message contains unsupported characters.";

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, data: { name, email, subject, message } };
}
