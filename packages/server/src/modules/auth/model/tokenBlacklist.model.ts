import { Model, DataTypes, Op } from 'sequelize';
import sequelize from '@config/database';
import jwt from 'jsonwebtoken';

export class TokenBlacklist extends Model {
  public token!: string;
  public expiresAt!: Date;

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    await this.cleanExpiredTokens();
    const found = await this.findOne({ where: { token } });
    return !!found;
  }

  static async addToBlacklist(token: string): Promise<void> {
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded == 'object' && decoded.exp) {
      await this.create({
        token,
        expiresAt: new Date(decoded.exp * 1000),
      });
    }
  }

  static async cleanExpiredTokens() {
    await this.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
  }
}

TokenBlacklist.init(
  {
    token: { type: DataTypes.STRING, primaryKey: true },
    expiresAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'token_blacklist' },
);
