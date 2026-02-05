import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Domain } from './domain.entity';

export enum SemanticType {
  SUPPORTS = 'supports',
  CONTRADICTS = 'contradicts',
  DERIVES_FROM = 'derives_from',
  PART_OF = 'part_of',
  REQUIRES = 'requires',
  CUSTOM = 'custom',
}

@Entity('edge_types')
@Unique(['domain_id', 'slug'])
export class EdgeType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: {} })
  translations: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 50,
    default: SemanticType.CUSTOM,
  })
  semantic_type: SemanticType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string | null;

  @Column({ type: 'varchar', length: 20, default: '#52c41a' })
  color: string;

  @Column({ type: 'float', default: 0 })
  weight: number;

  @Column({ type: 'boolean', default: true })
  is_directed: boolean;

  @Column({ type: 'uuid' })
  domain_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Domain, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'domain_id' })
  domain: Domain;
}
