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
import { Node } from './node.entity';
import { EdgeType } from './edge-type.entity';

@Entity('edges')
@Unique(['source_id', 'target_id', 'type_id'])
export class Edge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  source_id: string;

  @Column({ type: 'uuid' })
  target_id: string;

  @Column({ type: 'uuid' })
  type_id: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Node, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source_id' })
  source: Node;

  @ManyToOne(() => Node, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_id' })
  target: Node;

  @ManyToOne(() => EdgeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'type_id' })
  type: EdgeType;
}
