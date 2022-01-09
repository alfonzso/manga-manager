import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1641748375518 implements MigrationInterface {
    name = 'migration1641748375518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "manga" ("id" SERIAL NOT NULL, "name" character varying, "url" character varying NOT NULL, "pageNum" integer NOT NULL, "hidden" boolean NOT NULL, "order" integer, CONSTRAINT "PK_86e5c2b6f8bede099e2906579b4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "manga"`);
    }

}
