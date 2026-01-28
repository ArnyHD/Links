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
import { User } from '../../users/entities/user.entity';
import { NodeType } from '../../node-types/entities/node-type.entity';
import { EdgeType } from '../../edge-types/entities/edge-type.entity';
import { Node } from '../../nodes/entities/node.entity';

@Entity('domains')
export class Domain {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: {} })
  translations: Record<string, { name: string; description: string }>;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  settings: {
    allowComments?: boolean;
    requireModeration?: boolean;
    ratingAlgorithm?: string;
  };

  @ManyToOne(() => User, (user) => user.domains, { nullable: false })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  creatorId: string;

  @OneToMany(() => NodeType, (nodeType) => nodeType.domain)
  nodeTypes: NodeType[];

  @OneToMany(() => EdgeType, (edgeType) => edgeType.domain)
  edgeTypes: EdgeType[];

  @OneToMany(() => Node, (node) => node.domain)
  nodes: Node[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
