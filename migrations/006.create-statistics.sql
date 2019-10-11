CREATE TABLE IF NOT EXISTS `serious-game`.`statistics`
(
    `id`          INT(11)   NOT NULL AUTO_INCREMENT,
    `starttime`   TIMESTAMP NULL     DEFAULT NULL,
    `endtime`     TIMESTAMP NULL     DEFAULT NULL,
    `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified_at` TIMESTAMP NULL     DEFAULT NULL,
    PRIMARY KEY (`id`)
)
    ENGINE = InnoDB
    DEFAULT CHARACTER SET = latin1;