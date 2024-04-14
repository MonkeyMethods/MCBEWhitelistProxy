(async () => {
    const protocol = require('bedrock-protocol');
    const fs = require('fs');
    const path = require('path');
    const config = require('./config');
    const publicConfig = require(path.resolve(__dirname, "../config.json"));
    const { spawn } = require('child_process');
    /** @type {} */
    const build_platforms = [
        "Undefined",
        "Android",
        "IOS",
        "OSX",
        "FireOS",
        "GearVR",
        "Hololens",
        "Win10",
        "Win32",
        "Dedicated",
        "TVOS",
        "Orbis",
        "NintendoSwitch",
        "Xbox",
        "WindowsPhone",
        "Linux"
    ]

    const { Client } = require('discord.js');
    const colors = require(path.resolve(__dirname, 'colors.js'));
    console = { ...console, ...colors };
    console.log(`\x1b[34mDiscord bot starting...\x1b[0m`);
    const dclient = new Client({ intents: 32767 });
    module.exports = { client: dclient };
    await dclient.login(publicConfig.discord.token)
    console.log(`\x1b[34mLogged in as \x1b[32m${dclient.user.username}\x1b[0m`);
    require(path.resolve(__dirname, './discord/index.js')).onLogin(dclient);

    const start_game = {
        entity_id: -1n,
        runtime_entity_id: 1n,
        player_gamemode: 'survival',
        player_position: {
            x: -2.7025790214538574,
            y: 106.62001037597656,
            z: -1.276930332183838
        },
        rotation: { x: 0, z: 0 },
        seed: 0n,
        biome_type: 0,
        biome_name: 'plains',
        dimension: 'overworld',
        generator: 1,
        world_gamemode: 'survival',
        difficulty: 2,
        spawn_position: { x: 0, y: 0, z: 1 },
        achievements_disabled: true,
        editor_world_type: 'not_editor',
        created_in_editor: false,
        exported_from_editor: false,
        day_cycle_stop_time: 0,
        edu_offer: 0,
        edu_features_enabled: false,
        edu_product_uuid: '',
        rain_level: 0,
        lightning_level: 1,
        has_confirmed_platform_locked_content: false,
        is_multiplayer: true,
        broadcast_to_lan: true,
        xbox_live_broadcast_mode: 6,
        platform_broadcast_mode: 6,
        enable_commands: true,
        is_texturepacks_required: true,
        gamerules: [],
        experiments: [],
        experiments_previously_used: true,
        bonus_chest: false,
        map_enabled: false,
        permission_level: 'operator',
        server_chunk_tick_range: 4,
        has_locked_behavior_pack: false,
        has_locked_resource_pack: false,
        is_from_locked_world_template: false,
        msa_gamertags_only: true,
        is_from_world_template: false,
        is_world_template_option_locked: false,
        only_spawn_v1_villagers: false,
        persona_disabled: false,
        custom_skins_disabled: false,
        emote_chat_muted: false,
        game_version: '*',
        limited_world_width: 16,
        limited_world_length: 16,
        is_new_nether: false,
        edu_resource_uri: { button_name: '', link_uri: '' },
        experimental_gameplay_override: false,
        chat_restriction_level: 'none',
        disable_player_interactions: false,
        level_id: 'world',
        world_name: ' ',
        premium_world_template_id: '00000000-0000-0000-0000-000000000000',
        is_trial: false,
        movement_authority: 'server',
        rewind_history_size: 40,
        server_authoritative_block_breaking: true,
        current_tick: 0n,
        enchantment_seed: 0,
        block_properties: [],
        itemstates: [],
        multiplayer_correlation_id: '<raknet>bdc3-8675-b875-81da',
        server_authoritative_inventory: true,
        engine: '1.20.73',
        property_data: { type: 'compound', name: '', value: {} },
        block_pallette_checksum: 0n,
        world_template_id: '00000000-0000-0000-0000-000000000000',
        client_side_generation: false,
        block_network_ids_are_hashes: true,
        server_controlled_sound: true
    }
    let onlinePlayers = []
    const bdsPath = path.join(__dirname, "../bedrock-server");
    fs.writeFileSync(path.join(bdsPath, "./allowlist.json"), "{}");
    const oldConfig = fs.readFileSync(path.join(bdsPath, "./server.properties"), "utf-8").split("\n");
    // have no idea why I have to do this ( I don't have to on windows but ubuntu i do )
    let terminationChar = oldConfig[oldConfig.findIndex(i => i.startsWith("level-name"))].split("=")[1];
    terminationChar = terminationChar[terminationChar.length - 1];
    oldConfig[oldConfig.findIndex(i => i.startsWith("max-players"))] = "max-players=" + publicConfig.max_players + terminationChar
    fs.writeFileSync(path.join(bdsPath, "./server.properties"), oldConfig.join("\n"));

    const bds_main = spawn(bdsPath + "\\bedrock_server.exe", [], { cwd: bdsPath });
    bds_main.stdout.on("data", (data) => {
        console.log(data.toString());
    })
    bds_main.stderr.on("data", (data) => {
        console.log(data.toString());
    })
    bds_main.on("close", (code) => {
        console.log(`Bedrock server exited with code ${code}`);
    })
    module.exports.bds_main = bds_main;
    const proxyServer = protocol.createServer({
        "maxPlayers": 99999, "version": "1.20.71", host: "127.0.0.1", "port": 19132, "advertisementFn": () => {
            return new protocol.ServerAdvertisement({
                "playersOnline": onlinePlayers.length,
                "maxPlayers": publicConfig.max_players,
                "gameType": "Survival",
                "gameName": "Bedrock Protocol",
                "motd": "§eWelcome to the server!",
                "motdType": 1,
            }, 19132, "1.20.71")
        }
    })
    module.exports.proxyServer = proxyServer;
    /** @param {import("bedrock-protocol").Player} player */
    const addPlayerToWhiteList = async (player) => {
        const local = player.connection.address.split("/")[0] == "127.0.0.1"
        if (local) {
            bds_main.stdin.write(`whitelist add "${player.profile.name}"\n`);
            await new Promise(r => setTimeout(r, 2000));
            return true;
        }
        // add player to logs
        const currentLogs = JSON.parse(fs.readFileSync(path.join(bdsPath, "./logs.json"), "utf-8"));
        if (currentLogs[player.profile.xuid]) {
            for (const [key, value] of Object.entries(currentLogs[player.profile.xuid])) {
                if (player[key] !== value) {
                    console.log(`Player '${player.profile.name}' has changed their ${key} from '${value}' to '${player[key]}'`);
                    currentLogs[player.profile.xuid][key] = player[key];
                }
            }
        }
        await new Promise(async (r) => {
            for (const [category, checks] of Object.entries(config.flags)) {
                for (const [check, enabled] of Object.entries(checks)) {
                    if (!enabled) continue;
                    const method = config.methods[category]?.[check];
                    if (!method) continue;
                    const passed = await method(player);
                    if (passed) continue;
                    player.write("disconnect", {
                        "hideDisconnectionScreen": false,
                        "message": `§cYou've been kicked from the server!\n\n§7Flag ID: 0x${Object.keys(config.flags).indexOf(category) << 4 + (Object.keys(checks).indexOf(check) << 8)}`
                    });
                    player.close();
                    return false;
                }
            }
            r();
        })
        /**
         * @type {{ name: string, xuid: string, ignoresPlayerLimit: boolean }[]}
         */
        bds_main.stdin.write(`whitelist add "${player.profile.name}"\n`);
        await new Promise(r => setTimeout(r, 2000));
        return true;
    }
    const removePlayerFromWhiteList = async (name) => {
        bds_main.stdin.write(`whitelist remove "${name}"\n`);
        await new Promise(r => setTimeout(r, 2000));
        return true;
    }
    proxyServer.on("connect", (player) => {
        const local = player.connection.address.split("/")[0] == "127.0.0.1"
        console.log(local)
        console.log("Player has connected to the server!");
        player.on("packet", async ({ data: { name, params } }) => {
            console.log(name, params)
            switch (name) {
                case "client_cache_status":
                    if (local) return;
                    if (params.enabled) return;
                    // only bots have this disabled;
                    player.write("disconnect", {
                        "hideDisconnectionScreen": false,
                        "message": "§cYou've been kicked from the server!\n\n§7Flag ID: 0x0"
                    });
                    removePlayerFromWhiteList(player.profile.name);
                    player.dontRUN = true;
                    player.close();
                    break;
                case "resource_pack_client_response":
                    if (!local && params.response_status !== "have_all_packs") {
                        player.write("disconnect", {
                            "hideDisconnectionScreen": false,
                            "message": "§cYou've been kicked from the server!\n\n§7Flag ID: 0x1"
                        });
                        player.close();
                        break;
                    }
                    player.write("start_game", start_game);
                    if (!(await addPlayerToWhiteList(player))) return;
                    player.write("transfer", {
                        server_address: "127.0.0.1",
                        port: 19135,
                    });
                    new Promise(r => setTimeout(r, 10000)).then(() => {
                        removePlayerFromWhiteList(player.profile.name);
                    })
                    break;
                case "client_to_server_handshake":
                    player.write("resource_packs_info", {
                        must_accept: false,
                        has_scripts: false,
                        has_scripts: false,
                        force_server_packs: false,
                        behaviour_packs: [],
                        texture_packs: [],
                        resource_pack_links: [],
                    });
                    break;
            }
        })
    })
    const createClient = (options = {}) => {
        const mcbe_client = protocol.createClient({
            host: "127.0.0.1",
            port: 19132,
            version: "1.20.71",
            username: publicConfig.bedrock_bot.email,
            profilesFolder: path.join(__dirname, "../account"),
            "password": publicConfig.bedrock_bot.password,
            flow: "msal",
            authTitle: "000000004c20a908",
            "onMsaCode": async (code) => {
                throw new Error("Microsoft auth code required");
            },
            "skinData": {
                "SkinData": "-=-----------=-----------=-----------=-----------=-----------=-----------=-----------=-----------=-----------=-----------=-----------=----------v",
                "SkinResourcePatch": "-=-----------=-----------=-----------=----------",
                "SkinGeometryData": "-=-----------=-----------=-----------=-----------=----------",
                "DeviceModel": "LivelyServer",
                "DeviceOS": build_platforms.indexOf("Win32"),
                "PersonaPieces": [],
                "PieceTintColors": [],
                "SkinId": "Standard_Custom",
                "SkinColor": "Standard_Custom",
                "SkinGeometryDataEngineVersion": "---"
            },
            ...options
        })
        module.exports.mcbe_client = mcbe_client;
        mcbe_client.on("transfer", async (data) => {
            await new Promise(r => setTimeout(r, 500));
            mcbe_client.connection.close();
            delete mcbe_client;
            createClient({ ...options, host: data.server_address, port: data.port });
        })
        mcbe_client.on("play_status", (data) => {
            if (data.status !== "login_success") return;
            console.log(`Successfully joined ${mcbe_client.options.host}:${mcbe_client.options.port} as ${mcbe_client.profile.name}`);
        })
        mcbe_client.on("player_list", ({ records: { type, records_count, records } }) => {
            if (type !== "add") {
                onlinePlayers = onlinePlayers.filter(i => i !== records[0].uuid);
            } else {
                if (onlinePlayers.includes(records[0].uuid)) return;
                onlinePlayers.push(records[0].uuid);
            }
        });
    }
    createClient();
})();
