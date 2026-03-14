// Input validation utilities

export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254 && email.length >= 3;
}

export function isStrongPassword(password: string): boolean {
  // Minimum 8 characters, max 128 (bcrypt truncates at 72 bytes; cap to prevent DoS)
  // At least one uppercase, one lowercase, and one number
  return (
    password.length >= 8 &&
    password.length <= 128 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  // Trim and limit length
  return input.trim().substring(0, maxLength);
}

export function isValidDataURL(dataUrl: string, maxSizeBytes: number = 100 * 1024): boolean {
  // Check if it's a valid data URL format
  if (!dataUrl.startsWith('data:image/')) {
    return false;
  }

  // Check size (base64 encoding adds ~33% overhead, so approximate check)
  if (dataUrl.length > maxSizeBytes * 1.5) {
    return false;
  }

  return true;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateSignupInput(email: string, password: string, name?: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Invalid email address format' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!isStrongPassword(password)) {
    errors.push({ 
      field: 'password', 
      message: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
    });
  }

  if (name && name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be 100 characters or less' });
  }

  return errors;
}

export function validateFormSubmission(
  signerName: string,
  signerEmail: string,
  signature: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!signerName || signerName.trim().length === 0) {
    errors.push({ field: 'signer_name', message: 'Name is required' });
  } else if (signerName.length > 200) {
    errors.push({ field: 'signer_name', message: 'Name must be 200 characters or less' });
  }

  if (!signerEmail || !isValidEmail(signerEmail)) {
    errors.push({ field: 'signer_email', message: 'Valid email address is required' });
  }

  if (!signature || !isValidDataURL(signature)) {
    errors.push({ field: 'signature', message: 'Valid signature is required (max 100KB)' });
  }

  return errors;
}
