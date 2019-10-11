CREATE TABLE IF NOT EXISTS `serious-game`.`words`
(
    `id`          INT(11)     NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(45) NOT NULL,
    `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP   NULL     DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `name_UNIQUE` (`name` ASC)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;