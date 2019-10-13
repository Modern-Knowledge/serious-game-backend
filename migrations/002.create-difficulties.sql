CREATE TABLE IF NOT EXISTS `difficulties`
(
    `id`          INT(11)     NOT NULL AUTO_INCREMENT,
    `difficulty`  TINYINT(4)  NOT NULL,
    `created_at`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` VARCHAR(45) NULL     DEFAULT NULL,
    PRIMARY KEY (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;