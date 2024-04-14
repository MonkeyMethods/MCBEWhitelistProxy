const discord = require("discord.js");
const fs = require("fs");
let lastUpdated = 0;
module.exports = {
    /** @param {discord.ChatInputCommandInteraction} interaction */
    permission: (interaction) => true,

    command: new discord.SlashCommandBuilder()
        .setDescription("Run commands at server level.")
        .addStringOption(option => option.setName("command").setDescription("Command to run.").setRequired(true))
        .setDMPermission(false),

    /** @param {discord.ChatInputCommandInteraction} interaction */
    callback: async (interaction) => {
        if (lastUpdated !== fs.statSync(__filename).mtimeMs) {
            delete require.cache[require.resolve(__filename)];
            lastUpdated = fs.statSync(__filename).mtimeMs;
        }
        const { bds_main } = require("../../index.js")
        await interaction.deferReply({ ephemeral: true });
        let output;
        waitForMessages(bds_main.stdout).then((messages) => {
            if (messages.length === 0) return;
            output = true;
            interaction.followUp({
                "embeds": [
                    {
                        "title": "Command Output",
                        "description": messages.join(" ").split("]").slice(1).join("]").trim(),
                        "color": messages.join(" ").includes("ERROR]") ? 0xff0000 : 0x00ff00
                    }
                ]
            })
        });
        bds_main.stdin.write(interaction.options.getString("command") + "\n");
        new Promise((r) => setTimeout(r, 120)).then(() => {
            if (output) return;
            interaction.followUp({
                "embeds": [
                    {
                        "title": "Command Output",
                        "description": "Command successfully executed.",
                        "color": 0x00ff00
                    }
                ]
            })
        });
    }
}

const waitForMessages = async (stdout, ms = 100) => {
    return new Promise((resolve) => {
        let messages = []; ''
        const listener = (data) => {
            messages.push(data);
        };
        stdout.on("data", listener);
        setTimeout(() => {
            resolve(messages);
            stdout.removeListener("data", listener);
        }, ms);
    });
}