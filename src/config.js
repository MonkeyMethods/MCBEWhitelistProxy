const fs = require('fs');
const path = require('path');
const canvas = require("canvas");
const { Authflow } = require("prismarine-auth")
const PlayFab = require("playfab-sdk/Scripts/PlayFab/PlayFab");
const PlayFabClient = require("playfab-sdk/Scripts/PlayFab/PlayFabClient.js");
const publicConfig = require(path.resolve(__dirname, "../config.json"));
/**
 * @type  {{ bot_config: { account: string, host: string, port: number, version: string }, flags: { [category: string], { [flag: string]: (player: import("bedrock-protocol").Player) => boolean } }, methods: { [category: string], { [method: string]: (player.skinData: any) => boolean } }}}
 */
module.exports = {
    "bot_config": {
        "account": "main",
        // "realms": {
        //     "realmInvite": "2dfFf2_D_LY"
        // },
        "host": "127.0.0.1",
        port: 19132,
        "version": "1.20.71",
    },
    "flags": {
        "skin_checks": {
            "skin_id": true,
            "device_model": true,
        },
        "xbox": {
            "last_played": true,
        }
    },
    "methods": {
        "skin_checks": {
            "skin_id": (player) => {
                if (player.skinData.skin_id === "5eb65f73-af11-448e-82aa-1b7b165316ad.persona-3891382d5e3f67c4-0") return false; // default bot skin for bedrock-protocol
                // const data = player.skinData.skin_id.split(".");
                // if (data.length !== 2) return false;
                // validate there's a uuidv4 in the first index;
                // const uuidv4 = data[0];
                // const ids = uuidv4.split("-");
                // if (uuidv4.length !== 36 || ids.length !== 5 || ids[0].length !== 8 || ids[1].length !== 4 || ids[2].length !== 4 || ids[3].length !== 4 || ids[4].length !== 12) return false;
                return true;
            },
            // leaking because GARRY SCRIPTS thinks it's a good check :D
            "skin_geometry_data_engine": (player) => {
                if (player.skinData.geometry_data_version === "") return false;
                return true;
            }
        },
    }
}