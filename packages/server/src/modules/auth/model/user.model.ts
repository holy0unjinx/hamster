import {
  Model,
  DataTypes,
  Optional,
  HasOneCreateAssociationMixin,
} from 'sequelize';
import sequelize from '@/shared/config/database';

interface UserAttributes {
  userId: number;
  identifier: string;
  passwordHash: string;
  role: 'student' | 'teacher' | 'john';
  name: string;
  isActive: boolean;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, 'userId' | 'isActive'> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public userId!: number;
  public identifier!: string;
  public passwordHash!: string;
  public role!: 'student' | 'teacher' | 'john';
  public name!: string;
  public isActive!: boolean;

  // Association methods
  public createStudentProfile!: HasOneCreateAssociationMixin<StudentProfile>;
  public createTeacherProfile!: HasOneCreateAssociationMixin<TeacherProfile>;
}

User.init(
  {
    userId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    identifier: { type: DataTypes.STRING(255), unique: true, allowNull: false },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'john'),
      allowNull: false,
    },
    name: { type: DataTypes.STRING(50), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: 'user' },
);

// 학생 프로필 모델
export class StudentProfile extends Model {
  public userId!: number;
  public grade!: number;
  public class!: number;
  public number!: number;
  public guardianContact?: string;
}

StudentProfile.init(
  {
    grade: { type: DataTypes.INTEGER, allowNull: false },
    class: { type: DataTypes.INTEGER, allowNull: false },
    number: { type: DataTypes.INTEGER, allowNull: false },
    guardianContact: { type: DataTypes.STRING(20) },
  },
  { sequelize, modelName: 'student_profile' },
);

// 교사 프로필 모델
export class TeacherProfile extends Model {
  public userId!: number;
  public subject!: string;
  public officeLocation?: string;
  public homeroomClass?: string;
}

TeacherProfile.init(
  {
    subject: { type: DataTypes.STRING(50), allowNull: false },
    officeLocation: { type: DataTypes.STRING(50) },
    homeroomClass: { type: DataTypes.STRING(50) },
  },
  { sequelize, modelName: 'teacher_profile' },
);

// 관계 설정
User.hasOne(StudentProfile, { foreignKey: 'userId' });
User.hasOne(TeacherProfile, { foreignKey: 'userId' });

export default User;
