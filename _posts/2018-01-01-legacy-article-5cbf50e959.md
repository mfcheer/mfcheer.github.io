---
title: 'Java：HttpServletRequest对象'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：Java：HttpServletRequest对象'
slug: legacy-article-5cbf50e959
---

HttpServletRequest对象代表客户端的请求，当客户端通过HTTP协议访问服务器时，HTTP请求头中的所有信息都封装在这个对象中，通过这个对象的方法，可以获得请求信息。

## HttpServletRequest常用方法

```
getRequestURL方法返回客户端发出请求时的完整URL。
getRequestURI方法返回请求行中的资源名部分。
getQueryString 方法返回请求行中的参数部分。
getPathInfo方法返回请求URL中的额外路径信息。额外路径信息是请求URL中的位于Servlet的路径之后和查询参数之前的内容，它以“/”开头。
getRemoteAddr方法返回发出请求的客户机的IP地址。
getRemoteHost方法返回发出请求的客户机的完整主机名。
getRemotePort方法返回客户机所使用的网络端口号。
getLocalAddr方法返回WEB服务器的IP地址。
getLocalName方法返回WEB服务器的主机名。
getHeader(string name)方法:String 
getHeaders(String name)方法:Enumeration 
getHeaderNames()方法

获得客户机请求参数:
getParameter(String)方法(常用)
getParameterValues(String name)方法(常用)
getParameterNames()方法(不常用)
getParameterMap()方法(编写框架时常用)

参数放入request域对象：
setAttribute(String name,Object o)方法，将数据作为request对象的一个属性存放到request对象中，例如：request.setAttribute("data", data);
getAttribute(String name)方法，获取request对象的name属性的属性值，例如：request.getAttribute("data")
removeAttribute(String name)方法，移除request对象的name属性，例如：request.removeAttribute("data")
getAttributeNames方法，获取request对象的所有属性名，返回的是一个，例如：Enumeration<String> attrNames = request.getAttributeNames();
```

## 请求重定向和请求转发的区别
- 一个web资源收到客户端请求后，通知服务器去调用另外一个web资源进行处理，称之为请求转发/307。
- 一个web资源收到客户端请求后，通知浏览器去访问另外一个web资源进行处理，称之为请求重定向/302。

参考:[http://www.cnblogs.com/xdp-gacl/p/3798347.html](http://www.cnblogs.com/xdp-gacl/p/3798347.html)
<!--more-->
