class Util {

    /* Utilities methods...
       Not developed by me! */

    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    static mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (Util.isObject(target) && Util.isObject(source)) {
            for (const key in source) {
                if (Util.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    Util.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return Util.mergeDeep(target, ...sources);
    }

}

module.exports = Util;