async function api(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("API request failed");
    }

    return response.json();
}


function getValue(obj, names, fallback = 0) {
    for (const name of names) {
        if (
            obj &&
            obj[name] !== undefined &&
            obj[name] !== null
        ) {
            return obj[name];
        }
    }

    return fallback;
}


function getPlayerName(player) {

    if (!player) {
        return "Unknown Player";
    }

    if (player.name) {
        return player.name;
    }

    if (player.playerName) {
        return player.playerName;
    }

    return [
        player.firstName,
        player.lastName
    ].filter(Boolean).join(" ") || "Unknown Player";
}


function getTeamName(player) {

    return (
        player.teamName ||
        player.team ||
        player.teamAbbreviation ||
        "-"
    );
}


/* ==========================
   리더
========================== */

async function loadLeader(
    element,
    stat
) {

    const box =
        document.getElementById(element);

    try {

        const result =
            await api(
                `/api/players?page=1&pageSize=5&sortBy=${stat}&ascending=false&season=2025`
            );

        const players =
            result.data ||
            result.items ||
            result.results ||
            result;

        box.innerHTML =
            players.map(
                (player, index) => {

                    const value =
                        getValue(
                            player,
                            [stat]
                        );

                    return `
                        <div class="leader">

                            <div class="rank">
                                ${index + 1}
                            </div>

                            <div class="leader-name">
                                ${getPlayerName(player)}
                            </div>

                            <div class="leader-value">
                                ${value}
                            </div>

                        </div>
                    `;
                }
            ).join("");

    } catch (error) {

        box.innerHTML =
            `<div style="padding:20px">
                데이터를 불러오지 못했습니다.
            </div>`;

        console.error(error);
    }
}


/* ==========================
   선수 목록
========================== */

async function loadPlayers() {

    const stat =
        document.getElementById(
            "statSelect"
        ).value;

    const box =
        document.getElementById(
            "playersGrid"
        );

    box.innerHTML = "Loading...";

    try {

        const result =
            await api(
                `/api/players?page=1&pageSize=20&sortBy=${stat}&ascending=false&season=2025`
            );

        const players =
            result.data ||
            result.items ||
            result.results ||
            result;

        box.innerHTML =
            players.map(
                player => {

                    const value =
                        getValue(
                            player,
                            [stat]
                        );

                    return `
                        <article class="player-card">

                            <div class="player-name">
                                ${getPlayerName(player)}
                            </div>

                            <div class="player-team">
                                ${getTeamName(player)}
                            </div>

                            <div class="player-stat">
                                ${value}
                            </div>

                        </article>
                    `;
                }
            ).join("");

    } catch (error) {

        console.error(error);

        box.innerHTML =
            `<div>
                데이터를 불러오지 못했습니다.
            </div>`;
    }
}


/* ==========================
   고급 통계
========================== */

async function loadAdvanced() {

    const table =
        document.getElementById(
            "advancedTable"
        );

    try {

        const result =
            await api(
                "/api/advanced?page=1&pageSize=20&season=2025"
            );

        const players =
            result.data ||
            result.items ||
            result.results ||
            result;

        table.innerHTML =
            players.map(
                (player, index) => {

                    return `
                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                <strong>
                                    ${getPlayerName(player)}
                                </strong>
                            </td>

                            <td>
                                ${getTeamName(player)}
                            </td>

                            <td>
                                ${getValue(
                                    player,
                                    ["per", "PER"],
                                    "-"
                                )}
                            </td>

                            <td>
                                ${getValue(
                                    player,
                                    ["tsPct", "tsPercentage", "TS"],
                                    "-"
                                )}
                            </td>

                            <td>
                                ${getValue(
                                    player,
                                    ["usgPct", "usagePercentage", "USG"],
                                    "-"
                                )}
                            </td>

                        </tr>
                    `;
                }
            ).join("");

    } catch (error) {

        console.error(error);

        table.innerHTML =
            `<tr>
                <td colspan="6">
                    고급 통계를 불러오지 못했습니다.
                </td>
            </tr>`;
    }
}


/* ==========================
   API 상태
========================== */

async function checkAPI() {

    try {

        await api("/api/health");

        document.getElementById(
            "statusDot"
        ).style.background =
            "#22c55e";

    } catch {

        document.getElementById(
            "statusDot"
        ).style.background =
            "#ef4444";
    }
}


/* ==========================
   시작
========================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkAPI();

        loadLeader(
            "scorers",
            "points"
        );

        loadLeader(
            "assists",
            "assists"
        );

        loadLeader(
            "rebounds",
            "rebounds"
        );

        loadAdvanced();

        loadPlayers();
    }
);
