const EMAIL_KEY = 'tryvoga_email';

export function saveUserEmail(email: string) {
  localStorage.setItem(EMAIL_KEY, email.toLowerCase().trim());
}

export function getUserEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY);
}
