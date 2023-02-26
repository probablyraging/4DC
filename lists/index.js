const { rules } = require('../lists/rules');

module.exports = {
    welcome: [
        `https://i.imgur.com/wC1Lu54.png`,

        `Welcome to ForTheContent, a community of content creators, developers, musicians, gamers, and more. Our aim is to bring together like-minded individuals from all corners of the globe in a welcoming and supportive environment. As a peer-to-peer help and advice server, our aim is to provide our members with the resources and support they need to grow their online presence and achieve their goals

**NEW TO DISCORD?**
Check out the [Discord Beginner's Guide](<https://dis.gd/beginnersguide>) to help get you started

**GETTING STARTED**
> <#1005283113775157349> Information about the server channels and roles
> <#820889004055855147> Meet and chat with the community
> <#1049263519255777301> Tell us a little about yourself
> <id:customize> Grab yourself some profile flair
> <#1040530300515647548> Find answers to frequently asked question
> <#978553334854205450> Get assistance or support for specific topics
⠀`,

        `https://i.imgur.com/zD5ueDZ.png`,

        `By participating in this server, you agree to follow [ForTheContent's Server Rules](<https://discord.com/channels/820889004055855144/898541066595209248>), [Discord's ToS](<https://discord.com/terms>) and [Discord's Community Guidelines](<https://discord.com/guidelines>)
                
> **1.** ${rules[0]}
> **2.** ${rules[1]}
> **3.** ${rules[2]}
> **4.** ${rules[3]}
> **5.** ${rules[4]}
> **6.** ${rules[5]}
> **7.** ${rules[6]}

See something that breaks the rules? Use the </report:1031245457902555213> command to notify staff

*last updated: <t:${Math.round(new Date() / 1000)}:R>*`
    ],

    faqs: [
        `https://i.imgur.com/4qnr530.png`,

        `**When/how can I share my content?**
> Content sharing is available in the dedicated channels located under the 'CONTENT SHARE' section

**Can I advertise a paid service?**
> Yes. Paid services related to content creation *(e.g. video editing and graphic design)* can be posted in the <#1052096719778762822> channel for free. Other types of paid services, and products are only permitted in <#907446635435540551>. There are fees associated with creating a premium ad which you can find in [this post](<https://discord.com/channels/820889004055855144/907446635435540551/907463741174587473>)

**Can I advertise my own Discord server?**
> Yes. To be able to post Discord server invite links in the 'CONTENT SHARE' channels, you must be an active <@&1061554108005355570> subscriber. You can become a subscriber by [clicking here](<https://discord.com/channels/820889004055855144/role-subscriptions>)

**What is server subscribing and boosting?**
> Subscribing to or boosting the server is a way to support ForTheContent. By becoming a server subscriber or booster, you will gain access to exclusive perks such as bypassing rank requirements for certain channels, double XP, automatic content sharing, and access to the giveaway channel. You can view a full list of perks [here](<https://discord.com/channels/820889004055855144/role-subscriptions>)
⠀`,

        `**How does the rank/XP system work?**
> All new users begin at Rank 0 and unlock higher ranks in increments of five *(e.g. Rank 5, Rank 10, Rank 15)*. By sending messages in the server, you will earn between 15 and 25 XP towards your rank. Unlocking new ranks grants access to various rewards, which can be found in the <#1005283113775157349> channel. To prevent spamming, earning XP is limited to once a minute per user. You can view your current rank by using the </rank:1040546996735451176> command in the <#837945839799500850> channel. Please note that you will not receive XP for posting messages in the 'CONTENT SHARE' section
        
**How do I link my channels/socials?**
> Linking your channels/socials to your Discord profile makes it easier for other people to find your content. To link them on PC; in the bottom left of Discord, go to **user settings :gear: > connections**. To link them on iOS and Android; in the bottom right, click on **your avatar > connections > add**. For more help [click here](<https://support.discord.com/hc/en-us/articles/8063233404823-Connections-Community-Members>)

**Will people here actually watch my videos?**
> While self-promotion is a perk of supporting the server, there is no guarantee that people will watch, it is more an opportunity to expose your content to a wider audience. It is important to remember that many of the members here are also content creators and may not be your intended target audience. However, the community is generally supportive of those who are active, helpful, and supportive of others
⠀`,

        `**Why do I keep receiving spam and promotional content through DMs?**
> Unfortunately, this is a common occurrence on Discord and we do our best to remove these spam accounts. It is recommended to disable DMs from users who are not on your friends list. This can be done by going to **Settings :gear: > Privacy & Safety** and disabling the option to allow DMs from server members. You can also report these accounts to staff by using the </report:1031245457902555213> command
        
**How can I apply for a staff role?**
> We are always accepting new applications for staff members. If you believe you would make a great addition to our team, you can apply by filling out [this form](https://docs.google.com/forms/d/1W7K6WtKes3otlWYiSO_vdZ-dg9f4H0xS-g87gvhGvqY). Applications are accepted and denied privately and we don't provide notification of an application being denied. If your application is successful however, a staff member will contact you to discuss further

**How can I report someone for breaking the rules?**
> To make a report, you can use the </report:1031245457902555213> command, or you can **right-click on a message > Apps > Report Message** and one of the staff members will review it. Be sure to include any screenshots in your report. If the matter is more urgent, you can ping a staff member or one of the staff roles
⠀`,

        `https://i.imgur.com/kKwDa4j.png`,

        `**How do I get started?**
> Starting a YouTube channel is super easy, but knowing what tools to use in the process is a little harder and usually depends on what type of content you plan to make, your financial situation, and your personal preference. To get started, there are 3 main tools you are going to need;
> <:minidot:923683258871472248> Recording gear or software for recording yourself or your device. This might be a handheld camera or a screen recording program like [OBS](<https://obsproject.com>)
> <:minidot:923683258871472248> A video editing suite, such as [DaVinci Resolve](<https://www.blackmagicdesign.com/products/davinciresolve>) *(free)* or [Adobe Premiere Pro](<https://www.adobe.com/au/products/premiere.html>) *(paid)*. This is what you will use to edit your recorded footage into a watchable video
> <:minidot:923683258871472248> A photo editing suite, such as [GIMP](<https://www.gimp.org/>) *(free)* or [Adobe Photoshop](<https://www.adobe.com/au/products/photoshop.html>) *(paid)*. You can also download some free thumbnails templates from [FreePik](<https://www.freepik.com/free-photos-vectors/youtube-thumbnail>) and [Fotor](<https://www.fotor.com/youtube-thumbnail/templates/>). This is what you will use to create graphics such as thumbnails, profile pictures, banners etc..
> Take the time to do some research about the gear and software you plan to use. Each option can vary in difficulty to use and some are better suited for biginners while others are better suited for people with prior experience
⠀`,

        `**How do I get monetized?**
> The option to monetize your content becomes available once you have reached the requirements set by YouTube, which currently are;
> <:minidot:923683258871472248> 1000 subscribers
> <:minidot:923683258871472248> 4000 watch time hours (over a 12-month period)
> <:minidot:923683258871472248> 2FA enabled on your account
> <:minidot:923683258871472248> 0 community strikes
> Once you have met these requirements you will be able to visit the monetization tab in YouTube studio and apply for the YouTube partner program. The application process can take anywhere from 24 hours to a couple of weeks, but it is usually pretty quick. Meeting the above requirements does not guarantee you will be approved for partnership. More information here <https://support.google.com/youtube/answer/72851/>
⠀`,

        `**How can I get more subscribers/views?**
> There is no simple answer to this question, but it's going to take time, patience, and an understanding of the platform. Some strategies worth noting are;
> <:minidot:923683258871472248> Start by doing your own research on SEO (Search Engine Optimization). SEO such as using good keywords, thumbnails, titles, and descriptions can drastically improve the chances of YouTube and Google choosing your content to fill their search results with when someone makes a search request using keywords that you've used
> <:minidot:923683258871472248> Your YouTube studio analytics page has a bunch of really useful information that can help give you an understanding of how to maximize your reach. Things such as time frames of when your audience is most active on YouTube, other channels/content that your audience watches, the age and gender of your audience, and so on. Use this information to better match your content and uploading schedule so that you are doing everything possible to make sure your audience is seeing not only your content, but the content they want to watch
> <:minidot:923683258871472248> Use tools such as [VidIQ](<https://vidiq.com>), [TubeBuddy](<https://www.tubebuddy.com>), and the new research tab in YouTube studio to plan your videos ahead of time. Make sure your content ideas are what people actually want to see, and then use suitable titles, tags and descriptions to make sure YouTube knows how to recommend your content
> <:minidot:923683258871472248> Put call to actions in your videos. They remind people to like, comment and subscribe to your content. Video interaction like these, as well as viewer retention and average watch time are what the YouTube algorithm looks for when deciding what content to recommend
⠀`,

        `**What is SEO and how do I utilize it?**
> Search Engine Optimization (SEO) is the practice of using good thumbnails, titles, descriptions and keywords to improve the chances of YouTube and Google recommending your content to others by choosing your content to fill their search results. Here is how they are utilized;
> <:minidot:923683258871472248> Thumbnails entice viewers to click on your content, leading to a higher watch time and click through rate, both of which help your content rank higher in search results
> <:minidot:923683258871472248> Titles tell humans and search engines what your content is about, so make sure your title brielfy and accurately describes your content 
> <:minidot:923683258871472248> Description are a longer form of your contents description and will also be used by search engines to determine what your content is about
> <:minidot:923683258871472248> Keywords give YouTube and other search engines information and context about your content. Using 5-10 keywords related to your content is the best practice
> <:minidot:923683258871472248> Closed Captions are yet another way search engines can get an understanding into your video. You can turn on closed captions for your videos in YouTube studio
> Some other tactics that have been mentioned but have not been verified includes using descriptive imagery and text in your thumbnails and videos, audible keywords in your commentary script, as well as keywords in your embedded subtitles. YouTube and Google use image, audio and video recognition that can detect objects, text and keywords in your thumbnails and videos, adding to the overall SEO of those videos4
⠀`,

        `https://i.imgur.com/y0EMLmh.png`,

        `**How do I get started?**
> Streaming on Twitch is simple, all you need is a broadcasting program such as [OBS](<https://obsproject.com>), [Streamlabs OBS](<https://streamlabs.com>), [XSplit](<https://www.xsplit.com>), or any other alternative. Once you have chosen a program to use, you can head over to your [settings](<https://dashboard.twitch.tv/settings/stream>) page on Twitch, grab your stream key and go live right away. Though you might want to take some time to learn the program you're using, fine-tune your video and audio settings and set up some overlays and notification alerts

**Where can I get overlays, alert notifications, panels, emotes etc..?**
> There are plenty of free and paid services to use that can improve your stream by adding overlays, alert notifications, subscriber badges, and more. If you are just starting out on Twitch, you probably don't want to be investing too much (if any) money into your stream early on, so your best option would be to use a free service like one of the following;
> <:minidot:923683258871472248> [StreamElements](<https://streamelements.com>) offers a variety of free and paid features ranging from overlays, alert graphics, chatbots, and donation options right up to having your very own merch store
> <:minidot:923683258871472248> [NerdOrDie](<https://nerdordie.com>) offers everything you could really ever need as streamer with both free and paid features, such as overlays, alert graphics, sub badges, emotes, and lots more
> <:minidot:923683258871472248> For custom subscriber and badge emotes you are likely going to have to invest some money into these. Fiverr would probably be the best place to start
⠀`,

        `**How do I reach affiliate?**
> Currently, the requirements for becoming an affiliate on Twitch, which are tracked over a 30-day period are;
> <:minidot:923683258871472248> 500 minutes of total stream time
> <:minidot:923683258871472248> Stream on 7 unique days
> <:minidot:923683258871472248> Average 3 concurrent viewers or more
> <:minidot:923683258871472248> 50 followers
> You can check your progress here <https://dashboard.twitch.tv/achievements/>. Once you have met these requirements you will receive an email from Twitch explaining how to continue with your application for the affiliate program. This email could take anywhere from a couple of hours to a few days to be received. More information here <https://help.twitch.tv/s/article/joining-the-affiliate-program/>
                
**What should I stream?**
> When it comes right down to it, you should stream what you enjoy, but you should also keep in mind that certain games and genres just don't perform as well as others. Streaming in categories that people want to actually watch is key. There is of course no harm in being a variety streamer or doing variety streams, but doing so may make the process of growing your audience a little harder. Playing games that aren't very popular might be fun for you, but may not be as exciting for your viewers. Reach out to your viewers and see what type of content they would like to see, mix it up and see what clicks best for you, your audience and your potential viewers
⠀`,

        `**How can I get more viewers and followers?**
> There is no simple answer to this question, but it's going to take time, patience, and an understanding of the platform. Some strategies worth noting are;
> <:minidot:923683258871472248> Try to go live as often, and for as long as possibly. If you're doing short streams you are limiting the possibility of potential viewers finding you. By doing longer streams you are broadening the time frame of when people are active on Twitch and looking for streams to watch
> <:minidot:923683258871472248> Ask your friends and family to watch and participate in your streams. Twitch's browse tab is ordered by viewer count, from largest to smallest. Smaller streamers are placed toward the bottom of the list of active streams, and this can often mean potential viewers will have to scroll through multiple pages of other streams before they see yours. By asking your friends and family to watch your streams, you are effectively increasing your view count, raising your position on the browse tab
> <:minidot:923683258871472248> On top of the previous point, you should try to stream in categories that are getting a good amount of views but aren't overly saturated. Streaming popular titles like Fortnite and Call Of Duty, or in genres like Just Chatting will make it that much harder to find your stream, as these categories often have thousands of active streamers already. So when starting out it is often best to find categories that average a couple of thousand viewers, that also don't have too many people streaming at any one time
> <:minidot:923683258871472248> Set yourself a reasonable schedule, list that schedule in the schedules tab on your Twitch channel so your followers can see it as well, and try to stick to it as best as you can. If your followers know when to expect you to go live, they will often set time aside to be able to catch your streams
⠀`,

        `https://i.imgur.com/hN2ix8t.png`,

        `**Official YouTube Links**
> Help Center: <https://support.google.com/youtube/>
> General FAQ: <https://support.google.com/youtube/thread/677314/>
> Discovery and Performance FAQ: <https://support.google.com/youtube/answer/141805/>
> Top Questions: <https://www.youtube.com/creators/top-questions/>
> Community Guidelines: <https://support.google.com/youtube/answer/9288567/>
> Guidelines Strikes: <https://support.google.com/youtube/answer/2802032/>
> Partner Program: <https://support.google.com/youtube/answer/72851/>
> Monetization Policies: <https://support.google.com/youtube/answer/1311392/>
> Copyright FAQ: <https://support.google.com/youtube/thread/1281991/>
> Copyright Strikes: <https://support.google.com/youtube/answer/2814000/>
> Encoding Guidelines: <https://support.google.com/youtube/answer/1722171/>
> Stream Troubleshooting: <https://support.google.com/youtube/answer/2853835/>
> Audio Library: <https://www.youtube.com/audiolibrary/>
⠀`,

        `**Official Twitch Links**
> Support: <https://help.twitch.tv/s/contactsupport/>
> Twitch Blog: <https://blog.twitch.tv/>
> Legal Information: <https://www.twitch.tv/p/legal/>
> Music Guidelines: <https://www.twitch.tv/p/legal/community-guidelines/music/>
> Encoding Guidelines: <https://stream.twitch.tv/encoding/>
> Emote Guidelines: <https://help.twitch.tv/s/article/emote-guidelines/>
> Affiliate FAQ: <https://help.twitch.tv/s/article/twitch-affiliate-program-faq/>
> Recommended Streaming Software: <https://dashboard.twitch.tv/broadcast/>
> Cheering and Bits: <https://help.twitch.tv/customer/portal/articles/2449458/>
> Stream Connection Inspector: <https://inspector.twitch.tv/>
> Brand Assets: <https://brand.twitch.tv/>
> Discord Integration: <https://support.discord.com/hc/en-us/articles/212112068-Twitch-Integration-FAQ/>
⠀`,

        `**Official TikTok Links**
> Help Center: <https://support.tiktok.com/>
> Community Guidelines: <https://www.tiktok.com/community-guidelines?lang=en>
> General FAQ: <https://www.tiktokus.info/faqs/>
> Recommendations System: <https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you>
> Monetization and Advertising: <https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts>
⠀`,

        `**Official Discord Links**
> Beginner's Guide: <https://support.discord.com/hc/en-us/articles/360045138571-Beginner-s-Guide-to-Discord>
> Support Center: <https://support.discord.com>
> Community Guidelines: <https://discord.com/guidelines>
> Safety Center: <https://discord.com/safety>
> Setting up Two-Factor Authentication: <https://support.discord.com/hc/en-us/articles/219576828-Setting-up-Two-Factor-Authentication>
> Secure Your Account: <https://discord.com/safety/360043857751-Four-steps-to-a-super-safe-account>`
    ],

    servermap: [
        `https://i.imgur.com/DzeC8I8.png`,

        `You can easily hide channels from the channel list via <id:browse>

**WELCOME**
<#898541066595209248> A list of the server rules. Read them, they're important
<#820922632227913759> Important updates and changes regarding the server
<#1005283113775157349> You are here
<#843127402435313724> Let us know how we can improve the server
<#900243955847938078> Stay up to date with trends and platform changes
<#887642369598570527> Look at all these awesome server boosters

**CHATTING**
<#820889004055855147> Introduce yourself, hang out, and chat with other server members
<#845180817281253406> Share memes, images and other non-promotional type media here
<#1049263519255777301> Let us know who you are, what you do, and where we can find your content
<#843103680592609320> Reached a personal milestone? Flex on us
<#846449072105586708> Current game deals and random game related chat
<#1038766290246062100> Create AI generated images based of written prompts
<#851584454036029441> It basically explains itself
<#896069772624683018> Match the first letter of your word, to the last letter of the previous word

**RESOURCES**
<#1040530300515647548> Find answers to common questions as well as some useful links
<#1049118939164188743> Useful resources for content creators

**FORUMS**
<#978553334854205450> Get assistance or support for specific topics
<#978691673842389053> Get some constructive feedback on your graphics or videos
<#978694637088804884> Looking for something specific? Like new friends? Find them here
<#1052096719778762822> List your paid or free services for others to browse
⠀`,

        `**CONTENT SHARE**
<#907446635435540551> Buy an ad spot that will be seen by thousands of people
<#878229815541497857> Content sharing, but with a twist
<#859117794779987978> A channel for our awesome server boosters to share their awesome content
<#856719763187302441> Share your YouTube content
<#1075915365105807533> Share your Twitch content
<#1075915526833967269> Share your TikTok content
<#1075915468315050115> Share your Instagram content
<#1075915586053357689> Share your Twitter content
<#1075915738721833061> Share your Soundcloud & Spotify content
<#1075916325077131316> Share your other forms of content

**VOICE CHAT**
<#1038671738764017765> Create a new voice channel to hang out in

**BOT**
<#855427926136193054> Bump the server every 2 hours for a cookie
<#837945839799500850> Check your rank, and get notified when you rank up
<#1040381607674130492> Real time leaderboards for server ranks and games
<#987212586007281674> It's like a revolving door
<#995882451446546502> All of these people are on Santa's naughty list
⠀`,

        `https://i.imgur.com/fbGTTcI.png`,

        `⠀
**STAFF**
<@&1033563360660291615> A joint staff role for both server admins and mods
<@&885919072791973898> ForTheContent administrators
<@&931054970327932928> ForTheContent moderators

**MEMBERS**
<@&1061532395314098229> View server subscriber perks [here](<https://discord.com/channels/820889004055855144/role-subscriptions>)
<@&821876910253670442> View server booster perks [here](<https://discord.com/channels/820889004055855144/role-subscriptions>)
<@&839527054465826867> Displays currently live streaming server boosters
<@&878229140992589906> Awarded to the user who claimed the #content-spotlight
<@&998861546530820207> Displays a randomly selected user who is currently live streaming

**RANKS AND REWARDS**
<@&1033910783400230953> Access to all server booster perks upon request
<@&1033910403455012944> Nothing new
<@&1032783497984753694> Nothing new
<@&1032782969091407873> Nothing new
<@&846419141892112384> Permanent custom role and role icon upon request
<@&846418906520354866> Access to our giveaway channel for free products and game keys
<@&846418761674129409> Nothing new
<@&846418567263420437> Nothing new
<@&846417898351362098> Nothing new
<@&846418078317412403> Permission to post non-promotional links in most channels
*rank rewards can be unlocked immediately by becoming a server booster*

**NOTIFICATIONS**
<@&852348066618015744> Get notified when a new server announcement is made
<@&852348258495627314> Get notified when a free game is posted in #game-deals 
<@&879248157161177139> Get notified when the server is ready to be bumped again`,
    ]
}





