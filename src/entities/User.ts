import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";

export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    OPERATOR = 'operator'
}

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.OPERATOR
    })
    role: UserRole

    @Column({ nullable: true })
    managerId: string;

    @ManyToOne(() => User, user => user.id, { nullable: true })
    manager: User;

    @Column({ default: true })
    isActive: Boolean;
}