# 发布与看图回归

`npm test` 检查更新延后、离开保护、草稿写入顺序和存储失败降级。

浏览器回归只在 localhost / 127.0.0.1 的本地预览运行。页面中执行：

```js
eval(await (await fetch('/tests/ui-regression.js?t=' + Date.now())).text());
await runSiteRegression('moment-save');
```

1. 在 `/moments/` 执行 `moment-save`，刷新，再执行 `moment-restore`。
2. 在 `/gallery/` 执行 `gallery-save`，刷新，再执行 `gallery-restore`。
3. 执行 `lightbox` 检查分组、计数、箭头、横滑、重试、焦点恢复和单图。
4. 检查 320px / 375px 窄屏及桌面宽度，确认编辑窗口和灯箱按钮可见、无横向溢出。

每次刷新需重新加载测试脚本。测试使用本地虚拟身份并替换上传、创建 Issue 的函数，同时阻止真实的写请求；不会向 GitHub 写入。测试结束清除本地虚拟登录及乐观展示缓存，勿在真实网站上运行。


## 分模块构建验证

- `npm test`：18 项确定性测试（含 10 项构建编排测试），不联网、不发布。
- `npm run test:build`：显式联网读取公开 Issue，在临时副本运行真实文章、相册、说说脚本；验证完整保留、分开构建、下架、缺失目录修复、损坏图片阻止发布和全量恢复。副本结束自动删除，不修改真实内容。
- 工作流 YAML 可用 `node_modules/.bin/js-yaml .github/workflows/site.yml` 校验基本语法；仍需在 GitHub Actions 首次运行验证权限、环境配置和真实部署。
