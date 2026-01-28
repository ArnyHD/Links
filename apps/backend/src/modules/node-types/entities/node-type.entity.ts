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
import { Node } from '../../nodes/entities/node.entity';

@Entity('node_types')
export class NodeType {
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

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  // JSON schema for custom fields
  @Column({ type: 'jsonb', default: {} })
  schema: {
    properties?: Record<string, {
      type: string;
      required?: boolean;
      label?: string;
      description?: string;
    }>;
  };

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Domain, (domain) => domain.nodeTypes, { nullable: false })
  @JoinColumn({ name: 'domainId' })
  domain: Domain;

  @Column()
  domainId: string;

  @OneToMany(() => Node, (node) => node.type)
  nodes: Node[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
