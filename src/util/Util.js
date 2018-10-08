class Util {

    /**
     * Utility method used to know if a parameter is a JS object.
     * @param item
     * @returns {*|boolean}
     */
    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    /**
     * Utility method used to merge two arrays even if theses are deep.
     * @param target Where all sources will be stored after the operation.
     * @param sources Array in sources.
     * @returns {*} The generated merged array.
     */
    static mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (Util.isObject(target) && Util.isObject(source))
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (Util.isObject(source[key])) {
                        if (!target[key]) Object.assign(target, {[key]: {}});
                        Util.mergeDeep(target[key], source[key]);
                    } else {
                        Object.assign(target, {[key]: source[key]});
                    }
                }
            }

        return Util.mergeDeep(target, ...sources);
    }

}

module.exports = Util;
