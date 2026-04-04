export class CreateAccountDto {
  constructor() {}

  email!: string;
  password!: string;
  role: string = 'User';
}
