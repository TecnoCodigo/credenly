import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  usuario: string;

  @Column({ length: 255 })
  clave: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true, length: 100 })
  correo: string;

  @Column({ length: 20 })
  telefono: string;

  @Column({ length: 30, default: 'Usuario' })
  rol: string;

  @Column({ name: 'refresh_token_hash', nullable: true, length: 255 })
  refreshTokenHash: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn: Date;
}
