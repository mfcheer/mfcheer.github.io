---
title: Go 服务的优雅退出：从信号到连接排空
date: '2026-02-18 21:40'
tags: [Go, 后端]
summary: kill -15 之后到底发生了什么？把优雅退出的完整链路梳理一遍：信号处理、健康检查摘流、连接排空和超时兜底。
---

发版时最怕看到的现象：流量一切正常，切流瞬间冒出一批 502。多数时候根因都一样——服务没有优雅退出。

## 完整链路

一次优雅退出，按时间顺序应该发生四件事：

1. 收到 `SIGTERM`，停止接收**新**请求；
2. 从注册中心摘除实例，等负载均衡刷新（这个时间取决于摘流机制，通常 5~10s）；
3. 排空存量连接，处理中的请求给一个上限时间（比如 30s）；
4. 超时兜底，强制退出，不能无限等。

## 最小可用实现

```go
func main() {
    srv := &http.Server{Addr: ":8080", Handler: mux}

    go func() {
        if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
            log.Fatalf("listen: %v", err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
    <-quit

    log.Println("shutting down ...")

    // 有界等待：先排空连接，30s 强制退出
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        log.Printf("forced shutdown: %v", err)
    }
    log.Println("bye")
}
```

两个容易漏的细节：

- `Shutdown` 只负责**已接受**的连接，keep-alive 的空闲连接会被关闭，但**未 Accept** 的连接不受控，所以步骤 2 的摘流仍然不可省；
- K8s 里记得让 `terminationGracePeriodSeconds` 大于应用自己的排空超时，否则 systemd/K8s 会先动手。

## 别忘了收尾任务

异步任务、定时器、本地缓存刷盘，都要挂在退出链路上。一个常用的模式是集中管理 `io.Closer`：

```go
type Closer struct {
    mu     sync.Mutex
    closers []func() error
}

func (c *Closer) Register(f func() error) { /* ... */ }
func (c *Closer) Close() error            { /* 逆序执行，聚合错误 */ }
```

优雅退出的本质是**把"不可控的中断"变成"有界的交接"**。这个思路放到任何一个有状态的服务上都成立。
