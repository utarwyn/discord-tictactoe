class Player {

    /**
     * Used to create a Player object
     * @param member {GuildMember} The Discord Guild member
     */
    constructor(member) {
        /**
         * The associated Discord Guild member if provided
         * @type {GuildMember}
         * @private
         */
        this._member = member;

        /**
         * Name of this current player
         * @type {null|string}
         * @private
         */
        this._name = null;
    }

    getName() {
        if (this._name === null)
            if (this.isAI()) {
                this._name = Player._generateAIName();
            } else {
                this._name = this._member.displayName;
            }

        return this._name;
    }

    getTag() {
        return (this.isAI()) ? this.getName() : "<@" + this._member.user.id + ">";
    }

    isAI() {
        return this._member === null;
    }

    /**
     * Check if a member is stored in this Player object.
     * @param member {GuildMember|User} The provided Guild member or Discord User.
     * @returns {boolean} True if the provided member and this player is the same person.
     */
    isMember(member) {
        if (this._member === null) return false;

        if (member.user !== undefined)
            return member.user.id === this._member.user.id;
        else if (member.id !== undefined)
            return member.id === this._member.user.id;

        return false;
    }

    equals(player) {
        return this.getTag() === player.getTag();
    }

    static _generateAIName() {
        const names = ["Daniel", "Ben", "Jayden", "Zane", "Cesar", "Alec", "Braydon"];
        return names[Math.floor(Math.random() * names.length)];
    }

}

module.exports = Player;
