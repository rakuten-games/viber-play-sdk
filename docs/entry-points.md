# Viber entry points

|Entry point|Description|Example|
|---|---|---|
|`bot_global`/`bot_jp`|opened from keyboard of the bot or conversation with it||
|`chatex`|opened from Chat Extension||
|`pachat`|opened from link promoted in PA||
|`share`|opened from message sent via shareAsync||
|`update`|opened from message sent via updateAsync||
|`game_bot`|opened from message sent by game bot||
|`game_switch`|opened from game switch feature||
|`banner`|opened from banner placed in Viber by game platform holders||
|`landing`|from landing page in /viber-play/, used to be `rgdeeplink`||
|`clicker`|from Viber sticker clicker button||
|`platform_ad`|ad campaign run by platform owner||
|`unknown`|if entry point is empty, it's either user opened link directly or it is traffic of other source (referral, search etc.). utm paramters might help to figure out that.||
