import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Domain } from '../../domains/entities/domain.entity';
import { Edge } from '../../edges/entities/edge.entity';

@Entity('edge_types')
export class EdgeType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: {} })
  translations: Record<string, { name: string; description: string }>;

  // Semantic meaning: supports, contradicts, derives_from, etc.
  @Column()
  semanticType: 'supports' | 'contradicts' | 'derives_from' | 'part_of' | 'custom';

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  // Weight for rating calculation (-1 for contradicts, +1 for supports, etc.)
  @Column({ type: 'float', default: 0 })
  weight: number;

  @Column({ default: false })
  isDirected: boolean;

  @ManyToOne(() => Domain, (domain) => domain.edgeTypes, { nullable: false })
  @JoinColumn({ name: 'domainId' })
  domain: Domain;

  @Column()
  domainId: string;

  @OneToMany(() => Edge, (edge) => edge.type)
  edges: Edge[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
