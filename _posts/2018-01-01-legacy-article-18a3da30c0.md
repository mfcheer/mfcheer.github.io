---
title: 'SpringBoot-MyBatis-Web开发笔记'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：SpringBoot-MyBatis-Web开发笔记'
slug: legacy-article-18a3da30c0
---

一直使用公司的http和ORM框架开发web服务，所以想试试Spring。
使用SpringBoot+MyBatis的代码Demo，详细代码：[Demo代码地址](https://github.com/mfcheer/springboot-mybatis-Demo)

## Mysql表

```
CREATE TABLE `message_board` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `text` varchar(256) NOT NULL,
  `username` varchar(64) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
```

## application.yml

```
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mfcheer?uuseUnicode=true&characterEncoding=utf-8&useSSL=true
    username: root
    password: 123456
    driver-class-name: com.mysql.jdbc.Driver

mybatis:
  configuration:
   map-underscore-to-camel-case: true

logging:
  level:
   com.hehe.mapper: debug

```

## Maven pom.xml

```
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.mfcheer.learn</groupId>
  <artifactId>springboot</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  
  <parent>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-parent</artifactId>
      <version>2.0.4.RELEASE</version>
  </parent>
    
  <dependencies>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-core</artifactId>
        <version>2.9.1</version><!--$NO-MVN-MAN-VER$-->
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.9.1</version><!--$NO-MVN-MAN-VER$-->
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-annotations</artifactId>
        <version>2.9.1</version><!--$NO-MVN-MAN-VER$-->
    </dependency>
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>1.2.0</version>
    </dependency>
  	<dependency>
    	<groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
  	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-tomcat</artifactId>
	</dependency>
	<dependency>
      <groupId>org.mybatis</groupId>
      <artifactId>mybatis</artifactId>
      <version>3.4.6</version>
    </dependency>
    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
    </dependency>
    <dependency> 
      <groupId>com.alibaba</groupId> 
      <artifactId>fastjson</artifactId> 
      <version>1.2.40</version> 
    </dependency> 
  </dependencies>
  
  <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
  </build>
  
</project>
```
<!--more-->
## mybatis注解方式
例子

```
package dao;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import entity.MessageBoard;

public interface MessageBoardDao {
	
	@Select("select * from message_board where id = #{id}")
	public MessageBoard queryMessage(@Param("id")int id);

	@Update("update message_board set text=#{text}, username=#{username} where id=#{id}")
	public void updateMessage(int id, String text, String username);

}
```
## 对外接口

```
@RestController
@RequestMapping("/message")
public class MessageBoardController {
	
	@Autowired
	MessageBoardDao messageBoardDao;

	@RequestMapping("/hello")
	public String hello() {
		return "res Hello!!!";
	}
	
	@GetMapping("/hello")
	public String gethello() {
		return "get Hello!!!";
	}
	
	@RequestMapping("/detail")
	public String detail(HttpServletRequest request) {
		String id = request.getParameter("id");
		MessageBoard messageBoard = messageBoardDao.queryMessage(Integer.valueOf(id));
		if (messageBoard == null) {
			messageBoard = new MessageBoard();
		}
		
		String jsonString = JSON.toJSONString(messageBoard);
		return jsonString;
	}
	
	@RequestMapping("/update")
	public String update(HttpServletRequest request) {
		String id = request.getParameter("id");
		String text = request.getParameter("text");
		String username = request.getParameter("username");
		messageBoardDao.updateMessage(Integer.valueOf(id), text, username);
		return "ok";
	}
	
}
```

## 测试url

```
url：http://localhost:8080/message/detail?id=1
返回数据：{"id":1,"text":"test2","username":"mengfanqiang"}
```
