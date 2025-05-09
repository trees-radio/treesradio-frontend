/**
 * Type declarations for modules without their own type definitions
 */

// Declare disposable-email module
declare module 'disposable-email' {
  export function validate(email: string): boolean;
}