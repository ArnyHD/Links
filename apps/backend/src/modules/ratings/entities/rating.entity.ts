import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Node } from '../../nodes/entities/node.entity';

@Entity('ratings')
@Index(['nodeId', 'metricType'])
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Node, (node) => node.ratings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'nodeId' })
  node: Node;

  @Column()
  nodeId: string;

  // Type of metric: consistency, coherence, connectivity, overall
  @Column()
  metricType: 'consistency' | 'coherence' | 'connectivity' | 'overall';

  @Column({ type: 'float' })
  score: number;

  // Details of calculation
  @Column({ type: 'jsonb', default: {} })
  details: {
    supportingEdges?: number;
    contradictingEdges?: number;
    derivedNodes?: number;
    algorithm?: string;
    factors?: Record<string, number>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
