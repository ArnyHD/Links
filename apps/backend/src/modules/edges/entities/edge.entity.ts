import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Node } from '../../nodes/entities/node.entity';
import { EdgeType } from '../../edge-types/entities/edge-type.entity';

@Entity('edges')
@Unique(['sourceId', 'targetId', 'typeId'])
@Index(['sourceId', 'typeId'])
@Index(['targetId', 'typeId'])
export class Edge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Node, (node) => node.outgoingEdges, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sourceId' })
  source: Node;

  @Column()
  sourceId: string;

  @ManyToOne(() => Node, (node) => node.incomingEdges, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'targetId' })
  target: Node;

  @Column()
  targetId: string;

  @ManyToOne(() => EdgeType, (edgeType) => edgeType.edges, { nullable: false })
  @JoinColumn({ name: 'typeId' })
  type: EdgeType;

  @Column()
  typeId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Additional metadata for the edge
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
