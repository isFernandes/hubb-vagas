export class CreateUserDto {
  constructor() {}

  name!: string;
  bio: string | undefined;
  account_id!: string;
}
