/**
 * Cloudflare Worker for GitHub OAuth Gatekeeper
 * 
 * 用于在纯静态 GitHub Pages 上支持 GitHub OAuth 一键授权登录
 * 
 * 部署方法（仅需 30 秒）：
 * 1. 登录 Cloudflare Dashboard -> Workers & Pages -> Create Worker；
 * 2. 复制并粘贴本文件全部代码，点击 Deploy（部署）；
 * 3. 前往 Worker 的 Settings -> Variables & Secrets，添加两个环境变量：
 *    - CLIENT_ID : 你的 GitHub OAuth App Client ID
 *    - CLIENT_SECRET : 你的 GitHub OAuth App Client Secret
 * 4. 复制 Worker 分配的域名（例如 https://xxxx.workers.dev），在博客说说弹窗点击「OAuth 设置 ⚙️」填入即可！
 */

export default {
    async fetch(request, env) {
        // 处理跨域预检请求
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Accept",
                    "Access-Control-Max-Age": "86400"
                }
            });
        }

        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        try {
            const body = await request.json().catch(() => ({}));
            const code = body.code;
            if (!code) {
                return new Response(JSON.stringify({ error: "Missing code parameter" }), {
                    status: 400,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "application/json"
                    }
                });
            }

            const clientId = env.CLIENT_ID || body.client_id;
            const clientSecret = env.CLIENT_SECRET;

            if (!clientSecret) {
                return new Response(JSON.stringify({ error: "Worker 未配置 CLIENT_SECRET 环境变量" }), {
                    status: 500,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "application/json"
                    }
                });
            }

            const ghRes = await fetch("https://github.com/login/oauth/access_token", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: code
                })
            });

            const data = await ghRes.json();
            return new Response(JSON.stringify(data), {
                status: ghRes.status,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                }
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
                status: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                }
            });
        }
    }
};
