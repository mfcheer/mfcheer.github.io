---
title: Linux基本网络命令
date: 2015-11-18 22:10:31
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-2efc4113bd
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/49913859

##  ping

ping发送ECHO_REQUEST包到你指定的地址。这样你可以很方便确认你的电脑和Internet或是一个指定的IP地址是不是通的。使用 -c
开关，可以指定发送ECHO_REQUEST包的个数。

##  whois

whois命令输出指定站点的whois记录，可以查看到更多如谁注册和持有这个站点这样的信息。

##  ifconfig

ifconfig用于输出网络接口配置、调优和debug的各种选项。可以快捷地查看IP地址和其它网络接口的信息。键入ifconfig查看所有启用的网络接口的状态，包括它们的名字。可以指定网络接口的名字来只显示这一个接口的信息。

##  ifdown & ifup

ifdown和ifup命令和运行ifconfig up，ifconfig
down的功能一样。给定网络接口的名字可以只禁用或启用这一个接口。需要root权限，所以在Ubuntu上需要使用sudo来运行。

##  route

可以使用route命令来配置并查看内核路由表的配置情况。  
例如：  
（1） 添加到主机的路由。  
#route add –host 192.168.1.2 dev eth0:0  
#route add –host 10.20.30.148 gw 10.20.30.40  
（2） 添加到网络的路由。  
#route add –net 10.20.30.40 netmask 255.255.255.248 eth0  
#route add –net 10.20.30.48 netmask 255.255.255.248 gw 10.20.30.41  
#route add –net 192.168.1.0/24 eth1  
（3） 添加默认网关。  
#route add default gw 192.168.1.1  
（4） 查看内核路由表的配置。  
#route  
（5）删除路由。  
#route del –host 192.168.1.2 dev eth0:0  
#route del –host 10.20.30.148 gw 10.20.30.40  
#route del –net 10.20.30.40 netmask 255.255.255.248 eth0  
#route del –net 10.20.30.48 netmask 255.255.255.248 gw 10.20.30.41  
#route del –net 192.168.1.0/24 eth1  
#route del default gw 192.168.1.1  
对于1和2两点可使用下面的语句实现：  
Ifconfig eth0 172.16.19.71 netmask 255.255.255.0  
Route 0.0.0.0 gw 172.16.19.254  
Service network restart

##  traceroute

可以使用traceroute命令显示数据包到达目的主机所经过的路由。  
例如：  
#traceroute [ http://www.sina.com.cn/ ](http://www.sina.com.cn/)

##  hostname

可以使用hostname命令来更改主机名。例如；  
#hostname myhost

##  host

host命令用来做DNS查询。如果命令参数是域名，命令会输出关联的IP；如果命令参数是IP，命令则输出关联的域名。

##  netstat

可以使用netstat命令来显示网络状态信息。  
例如：  
（1） 显示网络接口状态信息。  
#netstat –i  
（2） 显示所有监控中的服务器的Socket和正使用Socket的程序信息。  
#netstat –lpe  
（3） 显示内核路由表信息。  
#netstat –r  
#netstat –nr  
（4） 显示TCP/UDP传输协议的连接状态。  
#netstat –t  
#netstat –u

##  arp

可以使用arp命令来配置并查看arp缓存。例如：  
（1） 查看arp缓存。  
#arp  
（2） 添加一个IP地址和MAC地址的对应记录。  
#arp –s 192.168.33.15 00:60:08:27:CE:B2  
（3） 删除一个IP地址和MAC地址的对应缓存记录。  
#arp –d192.168.33.15

