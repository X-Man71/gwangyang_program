import express from "express";

const app = express();
const PORT = 3000;

const NBA_API = "https://api.server.nbaapi.com";

app.use(express.static("public"));

async function nbaFetch(path, params = {}) {
    const url = new URL(`${NBA_API}${path}`);

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
            url.searchParams.set(key, value);
        }
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`NBA API Error: ${response.status}`);
    }

    return response.json();
}

// 선수 전체 기록
app.get("/api/players", async (req, res) => {
    try {
        const data = await nbaFetch("/api/playertotals", {
            page: req.query.page || 1,
            pageSize: req.query.pageSize || 20,
            season: req.query.season || 2025,
            sortBy: req.query.sortBy || "points",
            ascending: req.query.ascending || "false"
        });

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "NBA 선수 데이터를 가져오지 못했습니다."
        });
    }
});

// 고급 선수 기록
app.get("/api/advanced", async (req, res) => {
    try {
        const data = await nbaFetch(
            "/api/playeradvancedstats",
            {
                page: req.query.page || 1,
                pageSize: req.query.pageSize || 20,
                season: req.query.season || 2025
            }
        );

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "고급 통계를 가져오지 못했습니다."
        });
    }
});

// API 상태 확인
app.get("/api/health", async (req, res) => {
    try {
        await nbaFetch("/api/playertotals", {
            page: 1,
            pageSize: 1,
            season: 2025
        });

        res.json({
            connected: true
        });
    } catch {
        res.status(500).json({
            connected: false
        });
    }
});

app.listen(PORT, () => {
    console.log(`🏀 NBA Portal: http://localhost:${PORT}`);
});
