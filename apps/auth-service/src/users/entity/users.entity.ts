import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Users {
  // Уникальный идентификатор
  @PrimaryGeneratedColumn()
  id: number;

  // Email используется как логин и должен быть уникален
  @Column({ unique: true })
  email: string;

  // Отображаемое имя пользователя
  @Column()
  name: string;

  // Зашифрованный пароль (не храним raw пароль)
  @Column()
  passwordHash: string;

  // Дата создания (заполняется автоматически при INSERT)
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  // Дата обновления (обновляется автоматически при UPDATE)
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
