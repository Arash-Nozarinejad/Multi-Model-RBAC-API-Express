import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSetup1701234567890 implements MigrationInterface {
    name = 'InitialSetup1701234567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for user roles
        await queryRunner.query(`
            CREATE TYPE "user_role_enum" AS ENUM ('admin', 'manager', 'operator')
        `);

        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "username" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "user_role_enum" NOT NULL DEFAULT 'operator',
                "manager_id" uuid,
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_users_username" UNIQUE ("username"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id"),
                CONSTRAINT "FK_users_manager" FOREIGN KEY ("manager_id") 
                    REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        // Create posts table
        await queryRunner.query(`
            CREATE TABLE "posts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "title" character varying NOT NULL,
                "content" text NOT NULL,
                "user_id" uuid NOT NULL,
                "is_published" boolean NOT NULL DEFAULT false,
                "published_at" TIMESTAMP WITH TIME ZONE,
                "published_by" uuid,
                CONSTRAINT "PK_posts" PRIMARY KEY ("id"),
                CONSTRAINT "FK_posts_user" FOREIGN KEY ("user_id") 
                    REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_posts_publisher" FOREIGN KEY ("published_by") 
                    REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}