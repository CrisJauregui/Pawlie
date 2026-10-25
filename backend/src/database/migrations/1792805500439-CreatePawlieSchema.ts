import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePawlieSchema1792805500439 implements MigrationInterface {
  name = 'CreatePawlieSchema1792805500439';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "caregiver_profiles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "city" character varying(100) NOT NULL, "bio" text, "years_experience" integer NOT NULL DEFAULT '0', "photo_url" character varying(300), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "REL_94b42eaaf8275cc39c3a49c5b2" UNIQUE ("user_id"), CONSTRAINT "PK_df07e42fc3f8dca242c162b82d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "availability" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "day_of_week" integer NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "caregiver_id" uuid NOT NULL, CONSTRAINT "PK_05a8158cf1112294b1c86e7f1d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pets" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(100) NOT NULL, "species" character varying(50) NOT NULL, "breed" character varying(100), "age" integer, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "owner_id" uuid NOT NULL, CONSTRAINT "PK_d01e9e7b4ada753c826720bee8b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_type" AS ENUM('PASEO', 'CUIDADO_EN_CASA', 'BANO')`,
    );
    await queryRunner.query(
      `CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying(100) NOT NULL, "type" "public"."service_type" NOT NULL, "price" numeric(10,2) NOT NULL, "duration_minutes" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "caregiver_id" uuid NOT NULL, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."request_status" AS ENUM('PENDIENTE', 'ACEPTADA', 'EN_CURSO', 'FINALIZADA', 'RECHAZADA', 'CANCELADA')`,
    );
    await queryRunner.query(
      `CREATE TABLE "requests" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "start_at" TIMESTAMP WITH TIME ZONE NOT NULL, "end_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."request_status" NOT NULL DEFAULT 'PENDIENTE', "notes" text, "total_price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "owner_id" uuid NOT NULL, "caregiver_id" uuid NOT NULL, "pet_id" uuid NOT NULL, "service_id" uuid NOT NULL, CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_updates" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "message" text NOT NULL, "photo_url" character varying(500), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "request_id" uuid NOT NULL, CONSTRAINT "PK_bca53f09928847429fb85faa9de" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "caregiver_profiles" ADD CONSTRAINT "FK_94b42eaaf8275cc39c3a49c5b24" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "availability" ADD CONSTRAINT "FK_1465756270b61ad25854f14f7ee" FOREIGN KEY ("caregiver_id") REFERENCES "caregiver_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pets" ADD CONSTRAINT "FK_d6c565fded8031d4cdd54fe1043" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_2803e975395e60ed71486e8265c" FOREIGN KEY ("caregiver_id") REFERENCES "caregiver_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_6188acb1c47a8e58b7058293642" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_ccf448442868116e0a0c391585e" FOREIGN KEY ("caregiver_id") REFERENCES "caregiver_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_97483a4267e29dc0b2994d4af69" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_140e12c5bdfdb1d58cbb59fdd9b" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_updates" ADD CONSTRAINT "FK_2a0d6993f38ef1ae14a435f87a7" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_updates" DROP CONSTRAINT "FK_2a0d6993f38ef1ae14a435f87a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_140e12c5bdfdb1d58cbb59fdd9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_97483a4267e29dc0b2994d4af69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_ccf448442868116e0a0c391585e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_6188acb1c47a8e58b7058293642"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_2803e975395e60ed71486e8265c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pets" DROP CONSTRAINT "FK_d6c565fded8031d4cdd54fe1043"`,
    );
    await queryRunner.query(
      `ALTER TABLE "availability" DROP CONSTRAINT "FK_1465756270b61ad25854f14f7ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "caregiver_profiles" DROP CONSTRAINT "FK_94b42eaaf8275cc39c3a49c5b24"`,
    );
    await queryRunner.query(`DROP TABLE "service_updates"`);
    await queryRunner.query(`DROP TABLE "requests"`);
    await queryRunner.query(`DROP TYPE "public"."request_status"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TYPE "public"."service_type"`);
    await queryRunner.query(`DROP TABLE "pets"`);
    await queryRunner.query(`DROP TABLE "availability"`);
    await queryRunner.query(`DROP TABLE "caregiver_profiles"`);
  }
}
