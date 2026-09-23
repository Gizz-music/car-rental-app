import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Car } from '../../cars/entity/car.entity';

export enum BookingStatus {
  Active = 'active',
  Cancelled = 'cancelled',
}

@Entity('bookings')
@Index(['carId', 'status'])
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'car_id' })
  carId: number;

  @ManyToOne(() => Car, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'car_id' })
  car: Car;

  // id пользователя из auth-service: внешнего ключа нет, у сервисов разные БД
  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  // Полуоткрытый интервал [startDate, endDate)
  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.Active })
  status: BookingStatus;

  // Цена фиксируется в момент брони и не зависит от будущих изменений тарифа
  @Column({ name: 'total_price', type: 'integer' })
  totalPrice: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
