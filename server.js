const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] 
});

// --- إعداداتك الخاصة ---
const TOKEN = 'MTUwMzE4Mzc5OTQ3ODEyODcxMg.GEWqSU.EqdtyBhQz5e9X5G1tY_CNBRlABjHc6NF-VYHzU';
const LOG_CHANNEL_ID = '1503155967532077168'; // شات التقديم
const ROLE_ID = '1503151949598556321'; // رتبة التفعيل
const ADMIN_ROLE_ID = '1503152012483629156'; // رتبة الإدارة

client.on('ready', () => {
    console.log(`✅ ${client.user.tag} شغال يا وحش!`);
});

// استقبال البيانات من الموقع
app.post('/apply', async (req, res) => {
    const { userid, skills, reason } = req.body;
    const channel = client.channels.cache.get(LOG_CHANNEL_ID);

    if (!channel) return res.status(500).send('القناة مش موجودة');

    const embed = new EmbedBuilder()
        .setTitle('🚨 طلب انضمام جديد لـ 𝐆𝐑𝐎𝐔𝐏 𝟗')
        .setColor(0xFF0000)
        .addFields(
            { name: '🆔 معرف المتقدم:', value: `<@${userid}> (${userid})` },
            { name: '💻 المهارات:', value: `\`\`\`${skills}\`\`\`` },
            { name: '🎯 السبب:', value: `\`\`\`${reason}\`\`\`` }
        )
        .setFooter({ text: 'نظام الحماية GROUP 9' })
        .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`accept_${userid}`).setLabel('قبول ✅').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`reject_${userid}`).setLabel('رفض ❌').setStyle(ButtonStyle.Danger)
    );

    await channel.send({ content: `<@&${ADMIN_ROLE_ID}> فيه طلب جديد!`, embeds: [embed], components: [buttons] });
    res.status(200).send('تم الإرسال');
});

// معالجة أزرار القبول والرفض
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({ content: 'ما عندكش صلاحية يا هكر!', ephemeral: true });
    }

    const [action, targetId] = interaction.customId.split('_');
    const guild = interaction.guild;
    const member = await guild.members.fetch(targetId).catch(() => null);

    if (action === 'accept') {
        if (member) {
            await member.roles.add(ROLE_ID).catch(console.error);
            await member.send('✅ **تم قبول طلب التفعيل بتاعك في 𝐆𝐑𝐎𝐔𝐏 𝟗.**\nيرجى عدم تسريب المعلومات وإلا سيتم حظر حسابك.').catch(() => null);
        }
        await interaction.update({ content: `✅ تم قبول <@${targetId}> بنجاح.`, embeds: [], components: [] });
    } else {
        if (member) {
            await member.send('❌ **تم رفض تقديمك في 𝐆𝐑𝐎𝐔𝐏 𝟗 لأسباب خاصة.**').catch(() => null);
        }
        await interaction.update({ content: `❌ تم رفض <@${targetId}>.`, embeds: [], components: [] });
    }
});

client.login(TOKEN);
app.listen(3000, () => console.log('🌐 السيرفر شغال على بورت 3000'));
