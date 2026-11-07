---
title: 'Go-基准测试'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：Go-基准测试'
slug: legacy-article-6cf7741a42
---

## go test
Go语言拥有一套单元测试和性能测试系统，go test 命令，会自动读取源码目录下面名为 *_test.go 的文件，生成并运行测试用的可执行文件

- 测试用例文件不会参与正常源码编译，不会被包含到可执行文件中
- 命名文件时需要让文件必须以_test结尾
- 每个测试用例函数需要以Test为前缀

常用的参数：
```go
-v 显示测试的详细命令
-run regexp 只运行 regexp 匹配的函数，例如 -run=Array 那么就执行包含有 Array 开头的函数
-cover 开启测试覆盖率
-bench regexp 执行相应的 benchmarks，例如 -bench=.；
```

单元测试源码*_test文件可以由多个测试用例组成，每个测试用例函数需要以Test为前缀，一般参数为 *testing.T

日志：
```go
*t testing.T
t.Log
t.Logf
t.Error
t.Errorf
t.Fatal
t.Fatalf
```

下面是例子：
文件
```go
import "testing"
func TestA(t *testing.T) {
    t.Log("A")
}
func TestAB(t *testing.T) {
    t.Log("AB")
}
func TestC(t *testing.T) {
    t.Log("C")
}
```
```go
执行：
go test -v -run TestA select_test.go
输出：
=== RUN   TestA
--- PASS: TestA (0.00s)
        select_test.go:6: A
=== RUN   TestAB
--- PASS: TestAB (0.00s)
        select_test.go:10: AB
PASS
ok          command-line-arguments        0.003s
```
TestA 和 TestAB 的测试用例都被执行，原因是-run跟随的测试用例的名称支持正则表达式，使用-run TestA$即可只执行 TestA 测试用例。

## 基准测试
go test包支持基准测试，区别是传入的参数改为 b *testing.B，函数名称为 Benchmark为前缀。默认执行go test时是不执行基准的，需要使用 -bench标时

- 可以使用-cpu标识更改测试使用的GOMAXPROCS 值
- 如果函数耗时高，1s内不能准确测试性能的话， 可以使用-benchtime标识增加运行时间：go test -bench=. -benchtime=10s
- 执行测试次数过多的话，测试结果会受GC等影响，可以使用-count参数多次运行基准测试来解决，go test -count=10 
- -run=none  表示过滤掉单元测试
- -bench=.   表示的是运行所有的基准测试，. 表示全部
- -benchmem:表示显示memory的指标
- 有些测试需要一定的启动和初始化时间，如果从 Benchmark() 函数开始计时会很大程度上影响测试结果的精准性。StopTimer() 可以停止这个计数过程，做一些耗时的操作，通过 StartTimer() 重新开始计时。ResetTimer() 可以重置计数器的数据

b.N 标示函数需要执行的次数。b.N 从 1 开始，如果基准测试函数在1秒内就完成 (默认值)，则 b.N 增加，并再次运行基准测试函数。b.N 在近似这样的序列中不断增加；1, 2, 3, 5, 10, 20, 30, 50, 100 等等。 基准框架试图变得聪明，如果它看到当b.N较小而且测试很快就完成的时候，它将让序列增加地更快。

例子：
```go
func BenchmarkFuncA(b *testing.B) {
		init()
		b.ResetTimer()
        for n := 0; n < b.N; n++ {
                FuncA(20) // 运行 Fib 函数 N 次
        }
}
go test -bench=FuncA -count=10 -benchtime=10s -cpu=1,2,4 -run=none
```