/** Błąd naruszenia reguły domenowej — bezpieczny do pokazania użytkownikowi. */
export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}
