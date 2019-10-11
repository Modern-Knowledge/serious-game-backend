CREATE TABLE IF NOT EXISTS `serious-game`.`logs`
(
    `id`          INT(11)      NOT NULL AUTO_INCREMENT,
    `logger`      VARCHAR(255) NOT NULL,
    `level`       VARCHAR(45)  NOT NULL,
    `method`      VARCHAR(45)  NOT NULL,
    `message`     VARCHAR(255) NOT NULL,
    `params`      VARCHAR(255) NOT NULL,
    `user_id`     INT(11)      NULL,
    `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP    NULL     DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `fk_logs_users1_idx` (`user_id` ASC),
    CONSTRAINT `fk_logs_users1`
        FOREIGN KEY (`user_id`)
            REFERENCES `serious-game`.`users` (`id`)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;