/**
* @type  { { discord: { token: string }, bedrock_bot: { email: string, password: string }, max_players: number, bot_config: { account: string, host: string, port: number, version: string }, flags: { [category: string], { [flag: string]: (player: import("bedrock-protocol").Player) => boolean } }, methods: { [category: string], { [method: string]: (player.skinData: any) => boolean } }}}
*/
module.exports = {
    discord: {
        token: "bot token"
    },
    bedrock_bot: {
        email: "dpwij0276111971@outlook.com",
        password: "ujVS96(\""
    },
    max_players: 500,
    bot_config: {
        account: "main",
        // realms: {
        //     realmInvite: "2dfFf2_D_LY"
        // },
        host: "127.0.0.1",
        port: 19132,
        version: "1.20.81",
    },
    flags: {
        skin_checks: {
            skin_id: true,
            device_model: true,
        },
        xbox: {
            last_played: true,
        }
    },
    methods: {
        skin_checks: {
            skin_id: (player) => {
                if (player.skinData.skin_id === "5eb65f73-af11-448e-82aa-1b7b165316ad.persona-3891382d5e3f67c4-0") return false; // default bot skin for bedrock-protocol
                return true;
            },
            // leaking because GARRY SCRIPTS thinks it's a good check :D
            skin_geometry_data_engine: (player) => {
                if (player.skinData.geometry_data_version === "") return false;
                return true;
            }
        },
    }
}