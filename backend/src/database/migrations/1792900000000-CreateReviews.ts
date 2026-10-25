import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviews1792900000000 implements MigrationInterface {
  name = 'CreateReviews1792900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "rating" smallint NOT NULL,
        "comment" text,
        "tags" text array NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "request_id" uuid NOT NULL,
        CONSTRAINT "PK_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_reviews_request" UNIQUE ("request_id"),
        CONSTRAINT "CHK_reviews_rating" CHECK ("rating" BETWEEN 1 AND 5),
        CONSTRAINT "FK_reviews_request" FOREIGN KEY ("request_id")
          REFERENCES "requests"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reviews"`);
  }
}
