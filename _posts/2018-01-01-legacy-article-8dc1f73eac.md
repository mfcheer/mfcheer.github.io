---
title: 'Java导出Excel'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：Java导出Excel'
slug: legacy-article-8dc1f73eac
---

## 前端代码
```
function exportData() {
    params = encodeURI(params);
    window.location.href = "interface?" + params
}
```

## 后端代码

maven依赖
```
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>3.15</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>3.15</version>
</dependency>
<dependency>
    <groupId>net.sf.json-lib</groupId>
    <artifactId>json-lib</artifactId>
    <version>2.4</version>
    <classifier>jdk15</classifier>
</dependency>
```
发送请求
```java
HttpServletResponse response
// 告诉浏览器用什么软件可以打开此文件
response.setHeader("content-Type", "application/vnd.ms-excel");
// 下载文件的默认名称
response.setHeader("Content-Disposition", "attachment;filename=" + new String(ExcelUtil.getExcelFileName(this.excelName).getBytes(),"iso-8859-1"));
response.setContentType("application/octet-stream;charset=utf-8");
logger.info("传入的头部链表："+this.excelHead.toString());
logger.info("传入的数据链表："+this.dataList.isEmpty());
Workbook workbook = ExcelUtil.createExcel(this.excelHead, this.dataList);
workbook.write(response.getOutputStream());
```
<!--more-->
构造Excel
```java
public class ExcelUtil {

    private static Log logger = LogFactory.getLog(ExcelUtil.class);

    public static Workbook createExcel(List<String> excelHead, List<List<String>> dataList){
        HSSFWorkbook excelFramwork = new HSSFWorkbook();
        HSSFSheet excelSheet = excelFramwork.createSheet("sheet");
        //创建表头
        HSSFRow excelHeadRow = excelSheet.createRow(0);
        logger.info("excelHead长度："+excelHead.size());
        for(int i = 0; i < excelHead.size(); i++){
            HSSFCell cell = excelHeadRow.createCell(i);
            cell.setCellValue(excelHead.get(i));
        }
        //插入数据
        logger.info("deliverList长度："+dataList.size());
        for(int i = 0; i < dataList.size(); i ++){
            List<String> data = dataList.get(i);
            HSSFRow excelDataRow = excelSheet.createRow(i + 1);
            for (int j = 0; j < data.size(); j++){
                excelDataRow.createCell(j).setCellValue(data.get(j));
            }
        } //for
        return excelFramwork;
    }

    public static String getExcelFileName(String prefix){
        StringBuilder retSb = new StringBuilder(prefix);
        //获取时间
        String curDateStr = DateUtil.parseDateToString(new Date(), "yyyy-MM-dd");
        retSb.append(curDateStr);
        retSb.append(".xls");
        return retSb.toString();
    }
}
```

<!--more-->
