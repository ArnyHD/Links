import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Domain } from './domain.entity';
import { NodeType } from './node-type.entity';
import { User } from './user.entity';

export enum NodeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('nodes')
export class Node {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cover_image: string | null;

  @Column({
    type: 'jsonb',
    default: { blocks: [], version: '2.28.0' },
  })
  content: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  content_html: string | null;

  @Column({ type: 'integer', default: 0 })
  reading_time: number;

  @Column({ type: 'jsonb', default: {} })
  translations: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, any>;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({
    type: 'varchar',
    length: 20,
    default: NodeStatus.DRAFT,
  })
  status: NodeStatus;

  @Column({ type: 'uuid' })
  domain_id: string;

  @Column({ type: 'uuid' })
  type_id: string;

  @Column({ type: 'uuid' })
  creator_id: string;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Domain, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'domain_id' })
  domain: Domain;

  @ManyToOne(() => NodeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'type_id' })
  type: NodeType;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;
}
