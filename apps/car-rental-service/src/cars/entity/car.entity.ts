import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type Transmission = 'automatic' | 'manual';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ type: 'smallint' })
  year: number;

  @Column({ type: 'varchar' })
  transmission: Transmission;

  @Column({ name: 'fuel_type', type: 'varchar' })
  fuelType: FuelType;

  @Column({ type: 'smallint' })
  seats: number;

  // Цена за сутки в целых единицах валюты
  @Column({ name: 'price_per_day', type: 'integer' })
  pricePerDay: number;

  @Column({ name: 'image_url', default: '' })
  imageUrl: string;
}
