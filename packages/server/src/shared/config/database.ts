import { Sequelize } from 'sequelize';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { logger } from '@utils/logger';
import dotenv from 'dotenv';
import { ServerError } from '../types/error.type';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new ServerError(
    'ENVIRONMENT_NOT_DEFINE',
    500,
    'DATABASE_URL 환경 변수가 필요합니다.',
  );
}

const sslConfig = {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
};

class NeonSequelize extends Sequelize {
  private pool?: Pool;

  constructor() {
    super(process.env.DATABASE_URL!, {
      dialect: 'postgres',
      dialectModule: {
        ...require('pg'),
        Pool: Pool,
      },
      dialectOptions: {
        ...sslConfig,
        connection: {
          options: `-c search_path=public`,
          application_name: 'hamster-app',
        },
        wsConstructor: ws,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    });

    this.initPool();
  }

  private initPool() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ...sslConfig,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
  }

  async close() {
    await super.close();
    if (this.pool) {
      await this.pool.end();
    }
  }
}

const sequelize = new NeonSequelize();

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('데이터베이스 연결에 성공하였습니다.');
  } catch (error: any) {
    logger.error(`데이버베이스 연결 중 오류가 발생했습니다: ${error.message}`);
    process.exit(1);
  }
};

export default sequelize;
