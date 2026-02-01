import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('oauth_accounts')
export class OAuthAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  provider: string;

  @Column({ type: 'varchar', length: 255 })
  provider_user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  provider_email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  provider_username: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  display_name: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string | null;

  @Column({ type: 'text', nullable: true })
  access_token: string | null;

  @Column({ type: 'text', nullable: true })
  refresh_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  token_expires_at: Date | null;

  @Column({ type: 'text', array: true, nullable: true })
  scopes: string[] | null;

  @Column({ type: 'jsonb', default: {} })
  raw_data: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  last_used_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.oauth_accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
