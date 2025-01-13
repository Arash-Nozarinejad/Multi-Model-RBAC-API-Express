import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

@Entity('posts')
export class Post extends BaseEntity {
    @Column()
    title: string;

    @Column('text')
    content: string;
    
    @Column()
    userId: string;

    @ManyToOne(() => User, user => user.id)
    user: User;

    @Column({ default: false })
    isPublished: boolean;

    @Column({ nullable: true })
    publishedAt: Date;

    @Column({ nullable: true })
    publishedBy: string;
}