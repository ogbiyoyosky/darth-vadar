export class CreateTokenInput {
  value?: string;
  ownerId: string;
  type: string;
  expiresAt: Date;
}

export class CreatePasswordResetTokenInput {
  value: string;
  ownerId: string;
}
