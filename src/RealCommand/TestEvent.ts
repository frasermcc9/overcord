import DiscordEvent from "../events/BaseEvent";

const TestEvent: DiscordEvent<"guildMemberAdd"> = {
    callback: (member) => {
        console.log(`Say hi to ${member.user.username}!`);
    },
    firesOn: "guildMemberAdd",
};

export default TestEvent;
