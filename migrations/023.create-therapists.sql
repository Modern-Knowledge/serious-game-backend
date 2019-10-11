CREATE TABLE IF NOT EXISTS `serious-game`.`therapists`
(
    `therapist_id` INT(11)   NOT NULL,
    `role`         TINYINT   NOT NULL COMMENT '0 ... user\n1 ... admin',
    `accepted`     TINYINT   NOT NULL DEFAULT 0,
    `created_at`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at`  TIMESTAMP NULL,
    PRIMARY KEY (`therapist_id`),
    CONSTRAINT `fk_therapists_users`
        FOREIGN KEY (`therapist_id`)
            REFERENCES `serious-game`.`users` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;
