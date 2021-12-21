import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1640119723382 implements MigrationInterface {
    name = 'migration1640119723382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "manga" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "url" varchar NOT NULL, "pageNum" integer NOT NULL, "hidden" boolean NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "manga"`);
    }

}
