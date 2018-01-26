CREATE TABLE `future_fee` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patent_id` varchar(45) NOT NULL,
  `patent_apply_number` varchar(45) DEFAULT NULL,
  `patent_title` varchar(1000) DEFAULT NULL,
  `future_fee` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21406 DEFAULT CHARSET=utf8 COMMENT='专利未来应缴年费，通过爬虫从国知局获得'