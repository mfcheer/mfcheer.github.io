---
title: 'maven的用途'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：maven的用途'
slug: legacy-article-5718f812cd
---

# maven的用途
maven是一个项目构建和管理的工具。可以将项目过程规范化、自动化、高效化以及强大的可扩展性。利用maven自身及其插件还可以获得代码检查报告、单元测试覆盖率、实现持续集成等等.
# 核心概念
## pom
pom是指project object Model。pom是一个xml文件。是maven工作的基础，maven会去项目根目录下读取pom.xml获得需要的配置信息。

pom文件中包含了项目的信息和maven build项目所需的配置信息，通常有项目信息(如版本、成员)、项目的依赖、插件和goal、build选项等等。

pom是可以继承的，通常对于一个大型的项目或是多个module的情况，子模块的pom需要指定父模块的pom。
pom文件中节点含义如下：
<!--more-->
```
project pom文件的顶级元素
modelVersion 所使用的object model版本，为了确保稳定的使用，这个元素是强制性的。除非maven开发者升级模板，否则不需要修改
groupId 是项目创建团体或组织的唯一标志符，通常是域名倒写，如groupId  org.apache.maven.plugins就是为所有maven插件预留的
artifactId 是项目artifact唯一的基地址名
packaging artifact打包的方式，如jar、war、ear等等。默认为jar。这个不仅表示项目最终产生何种后缀的文件，也表示build过程使用什么样的lifecycle。
version artifact的版本，通常能看见为类似0.0.1-SNAPSHOT，其中SNAPSHOT表示项目开发中，为开发版本
name 表示项目的展现名，在maven生成的文档中使用
url表示项目的地址，在maven生成的文档中使用
description 表示项目的描述，在maven生成的文档中使用
dependencies 表示依赖，在子节点dependencies中添加具体依赖的groupId artifactId和version
build 表示build配置
parent 表示父pom
```
## Artifact
一个项目将要产生的文件，可以是jar文件，源文件，二进制文件，war文件。每个artifact都由groupId:artifactId:version组成的标识符唯一识别
## Repositories
Repositories是用来存储Artifact的。在项目中需要使用某种工具时，在pom中声明dependency，编译代码时就会根据dependency去下载工具（Artifact），供自己使用。
对于自己的项目完成后可以通过mvn install命令将项目放到仓库（Repositories）中。
仓库分为本地仓库和远程仓库，远程仓库是指远程服务器上用于存储Artifact的仓库，本地仓库是指本机存储Artifact的仓库，对于windows机器本地仓库地址为系统用户的.m2/repository下面。

# 常用命令
将依赖包打包进一个文件夹
```
dependency:copy-dependencies
```
将依赖包打包成一个包
```
<build>
  <plugins>
    <plugin>
        <artifactId>maven-assembly-plugin</artifactId>
        <!-- <version>2.1</version> -->
        <configuration>
            <descriptorRefs>
                <descriptorRef>jar-with-dependencies</descriptorRef>
            </descriptorRefs>
        </configuration>
    </plugin>
  </plugins>
</build>
assembly::assembly
```
排除依赖包
```
<exclusions>
    <exclusion>
        <groupId>redis.clients</groupId>
        <artifactId>jedis</artifactId>
    </exclusion>
</exclusions>
```
设定编译jdk版本

```
<build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
        </plugins>
</build>
```