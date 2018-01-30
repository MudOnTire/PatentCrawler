CREATE TABLE `zg_patent_task` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patent_apply_number` varchar(45) DEFAULT NULL,
  `is_done` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=202389 DEFAULT CHARSET=utf8 COMMENT='专利应缴年费爬取任务'