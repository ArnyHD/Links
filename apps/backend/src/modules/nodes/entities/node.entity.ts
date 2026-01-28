import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Domain } from '../../domains/entities/domain.entity';
import { NodeType } from '../../node-types/entities/node-type.entity';
import { User } from '../../users/entities/user.entity';
import { Edge } from '../../edges/entities/edge.entity';
import { Rating } from '../../ratings/entities/rating.entity';

@Entity('nodes')
@Index(['domainId', 'typeId'])
export class Node {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'jsonb', default: {} })
  translations: Record<string, { title: string; content: string }>;

  // Custom data according to NodeType schema
  @Column({ type: 'jsonb', default: {} })
  data: Record<string, any>;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @Column({ default: 'draft' })
  status: 'draft' | 'published' | 'archived';

  @ManyToOne(() => Domain, (domain) => domain.nodes, { nullable: false })
  @JoinColumn({ name: 'domainId' })
  domain: Domain;

  @Column()
  domainId: string;

  @ManyToOne(() => NodeType, (nodeType) => nodeType.nodes, { nullable: false })
  @JoinColumn({ name: 'typeId' })
  type: NodeType;

  @Column()
  typeId: string;

  @ManyToOne(() => User, (user) => user.nodes, { nullable: false })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: string;

  @OneToMany(() => Edge, (edge) => edge.source)
  outgoingEdges: Edge[];

  @OneToMany(() => Edge, (edge) => edge.target)
  incomingEdges: Edge[];

  @OneToMany(() => Rating, (rating) => rating.node)
  ratings: Rating[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
