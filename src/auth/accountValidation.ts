export const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,64}$/u;
export const MINIMUM_PASSWORD_LENGTH = 15;
export const MAXIMUM_PASSWORD_LENGTH = 128;

export function isValidUsername(username: string): boolean {
    return USERNAME_PATTERN.test(username.trim());
}

export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email.trim());
}

export function isValidPassword(password: string): boolean {
    return password.length >= MINIMUM_PASSWORD_LENGTH && password.length <= MAXIMUM_PASSWORD_LENGTH;
}
