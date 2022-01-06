import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1641429815282 implements MigrationInterface {
    name = 'migration1641429815282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_manga" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "url" varchar NOT NULL, "pageNum" integer NOT NULL, "hidden" boolean NOT NULL, "name" varchar, "order" integer)`);
        await queryRunner.query(`INSERT INTO "temporary_manga"("id", "url", "pageNum", "hidden") SELECT "id", "url", "pageNum", "hidden" FROM "manga"`);
        await queryRunner.query(`DROP TABLE "manga"`);
        await queryRunner.query(`ALTER TABLE "temporary_manga" RENAME TO "manga"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "manga" RENAME TO "temporary_manga"`);
        await queryRunner.query(`CREATE TABLE "manga" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "url" varchar NOT NULL, "pageNum" integer NOT NULL, "hidden" boolean NOT NULL)`);
        await queryRunner.query(`INSERT INTO "manga"("id", "url", "pageNum", "hidden") SELECT "id", "url", "pageNum", "hidden" FROM "temporary_manga"`);
        await queryRunner.query(`DROP TABLE "temporary_manga"`);
    }

}
