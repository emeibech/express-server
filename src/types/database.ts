export interface CreateNewUser {
  firstname: string;
  lastname: string | null;
  email: string;
  hashedPassword: string;
  dateOfBirth: string;
}

export interface QueryParams {
  text: string;
  values?: unknown[];
}
