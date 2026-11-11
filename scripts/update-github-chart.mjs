#!/usr/bin/env node
// 定时或在构建期拉取并更新本地 GitHub 活跃贡献热力图 SVG

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'assets', 'github-contributions.svg');

export async function updateGitHubChart() {
    try {
        console.log('正在拉取最新 GitHub 贡献热力图...');
        const res = await fetch('https://ghchart.rshah.org/0071e3/mfcheer', { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let text = await res.text();
        if (!text.includes('<svg')) throw new Error('返回的非有效 SVG 格式');
        if (!text.includes('viewBox')) {
            text = text.replace('<svg ', '<svg viewBox="0 0 663 104" preserveAspectRatio="xMinYMid meet" ');
        }
        await fs.writeFile(target, text, 'utf8');
        console.log('GitHub 贡献热力图已成功本地化更新至 assets/github-contributions.svg');
        return true;
    } catch (err) {
        console.warn('拉取 GitHub 贡献热力图未成功（保留现有本地静态副本）:', err.message);
        return false;
    }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    updateGitHubChart();
}
