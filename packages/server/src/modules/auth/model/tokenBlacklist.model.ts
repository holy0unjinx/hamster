import prisma from '@config/database';
import jwt from 'jsonwebtoken';

export class TokenBlacklist {
  public token!: string;
  public expiresAt!: Date;

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    await this.cleanExpiredTokens();
    const found = await prisma.tokenBlacklist.findUnique({ where: { token } });
    return !!found;
  }

  static async addToBlacklist(token: string): Promise<void> {
    await this.cleanExpiredTokens();
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded == 'object' && decoded.exp) {
      await prisma.tokenBlacklist.create({
        data: {
          token,
          expires_at: new Date(decoded.exp * 1000),
        },
      });
    }
  }

  static async cleanExpiredTokens() {
    await prisma.tokenBlacklist.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
  }
}
